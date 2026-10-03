import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { UserProfile, SyncStatus } from '../types/bible';
import { getSession, getUserProfile, signIn, signUp, signOut, onAuthStateChange } from '../services/authService';
import { syncGuestDataToCloud } from '../services/syncService';
import { fetchCloudSearchData } from '../services/userDataService';
import { isSupabaseConfigured } from '../lib/supabase';
import { isAdminSessionActive } from '../services/adminService';
import { drainSyncQueue } from '../services/offlineSyncQueue';

// ─── LocalStorage Keys ────────────────────────────────────────────────────────

const USER_DATA_KEYS = [
  'bible_app_bookmarks',
  'bible_app_highlights',
  'bible_app_user_notes',
  'bible_app_reading_history',
  'bible_app_reading_history_list',
  'bible_app_preferences',
  'bible_app_reading_progress'
];

/**
 * Returns true if any meaningful guest data exists in localStorage.
 * Used to decide whether to show the one-time migration banner.
 */
const hasGuestData = (): boolean => {
  try {
    const bookmarks = localStorage.getItem('bible_app_bookmarks');
    const highlights = localStorage.getItem('bible_app_highlights');
    const notes = localStorage.getItem('bible_app_user_notes');
    if (bookmarks && JSON.parse(bookmarks).length > 0) return true;
    if (highlights && Object.keys(JSON.parse(highlights)).length > 0) return true;
    if (notes && JSON.parse(notes).length > 0) return true;
  } catch {
    // ignore parse errors
  }
  return false;
};

/**
 * Clears all user-specific data from localStorage to prevent cross-user contamination.
 * Called before loading cloud data on login, and on logout.
 */
export const clearLocalUserData = (): void => {
  try {
    USER_DATA_KEYS.forEach((key) => localStorage.removeItem(key));
    console.log('[Auth] Cleared all local user data keys from localStorage.');
  } catch (err) {
    console.warn('[Auth] Error clearing local storage on user transition:', err);
  }
};

// ─── Context Types ────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isGuest: boolean;
  isSessionLoading: boolean;
  syncStatus: SyncStatus;
  isAuthModalOpen: boolean;
  isSyncModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsSyncModalOpen: (open: boolean) => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, pass: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  triggerSync: () => Promise<boolean>;
  updateProfileState: (updates: Partial<UserProfile>) => void;
  /** Callback registered by ReadingContext so AuthContext can trigger cloud data refresh */
  registerCloudDataRefresh: (fn: (userId: string) => Promise<void>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── AuthProvider ─────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem('bible_app_local_session');
      if (raw) {
        const snap = JSON.parse(raw);
        if (snap && snap.id) {
          return {
            id: snap.id,
            email: snap.email || '',
            user_metadata: snap.user_metadata || {},
            app_metadata: snap.app_metadata || {},
            aud: 'authenticated',
            role: snap.role || 'authenticated',
            created_at: new Date(snap.sessionSavedAt || Date.now()).toISOString()
          } as User;
        }
      }
    } catch {}
    return null;
  });

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const raw = localStorage.getItem('bible_app_profile_snapshot');
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  // If local session exists or device is offline, start with isSessionLoading: false for instant boot (<50ms)
  const [isSessionLoading, setIsSessionLoading] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return false;
    const hasLocalSession = !!localStorage.getItem('bible_app_local_session');
    return !hasLocalSession;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);

  // ReadingContext registers this callback so we can trigger a cloud refresh from here
  const cloudDataRefreshRef = useRef<((userId: string) => Promise<void>) | null>(null);

  // Stores the session user while waiting for ReadingContext to register its callback.
  // This solves the race condition where getSession() fires before ReadingContext mounts.
  const pendingSessionUserRef = useRef<{ user: User; isNewSignup: boolean } | null>(null);

  const registerCloudDataRefresh = useCallback((fn: (userId: string) => Promise<void>) => {
    cloudDataRefreshRef.current = fn;

    // If a session was already restored before ReadingContext mounted (race condition),
    // fire the cloud data load now that the callback is finally registered.
    if (pendingSessionUserRef.current) {
      const { user: pendingUser, isNewSignup } = pendingSessionUserRef.current;
      pendingSessionUserRef.current = null;
      console.log('[Auth] ReadingContext callback registered — triggering deferred cloud load for:', pendingUser.id);
      fn(pendingUser.id).catch((err) =>
        console.error('[Auth] Deferred cloud data refresh failed:', err)
      );

      // Show migration banner if applicable
      const migrationKey = `bible_sync_done_${pendingUser.id}`;
      const alreadyMigrated = localStorage.getItem(migrationKey) === 'true';
      if (isNewSignup && !alreadyMigrated) {
        setIsSyncModalOpen(true);
      }
    }
  }, []);

  /**
   * Called whenever a user session is established (login, signup, or page-reload session restore).
   * 1. Sets user/profile state
   * 2. Clears stale local data to prevent cross-user contamination
   * 3. Triggers ReadingContext to load fresh cloud data (or defers if not yet mounted)
   * 4. Optionally shows the one-time guest-migration banner
   */
  const handleUserSessionEstablished = useCallback(
    async (newUser: User, isNewSignup: boolean) => {
      setUser(newUser);

      // Persist safe local session snapshot (NO password/tokens, user metadata only)
      try {
        const sessionSnapshot = {
          id: newUser.id,
          email: newUser.email,
          user_metadata: newUser.user_metadata || {},
          app_metadata: newUser.app_metadata || {},
          role: newUser.role || 'authenticated',
          sessionSavedAt: Date.now()
        };
        localStorage.setItem('bible_app_local_session', JSON.stringify(sessionSnapshot));
      } catch (err) {
        console.warn('[Auth] Failed caching local session snapshot:', err);
      }

      // Fetch profile & search history (non-blocking — UI updates when ready)
      getUserProfile(newUser.id).then((prof) => {
        setProfile(prof);
        if (prof) {
          try {
            localStorage.setItem('bible_app_profile_snapshot', JSON.stringify(prof));
            if (prof.avatar_url) {
              localStorage.setItem('bible_app_user_avatar', prof.avatar_url);
            }
          } catch {
            // ignore
          }
        }
      });

      fetchCloudSearchData(newUser.id).then(({ searchHistory, openedVerses }) => {
        if (searchHistory && searchHistory.length > 0) {
          try {
            localStorage.setItem('bible_app_search_history', JSON.stringify(searchHistory));
            console.log('[Auth] Restored search history from cloud:', searchHistory.length);
          } catch {
            // ignore
          }
        }
        if (openedVerses && openedVerses.length > 0) {
          try {
            localStorage.setItem('bible_app_opened_verses_history', JSON.stringify(openedVerses));
            console.log('[Auth] Restored opened search verses from cloud:', openedVerses.length);
          } catch {
            // ignore
          }
        }
      });

      // Clear local user data ONLY if switching user accounts, never when reconnecting same user!
      const lastActiveUid = localStorage.getItem('bible_app_last_active_uid');
      if (lastActiveUid && lastActiveUid !== newUser.id) {
        clearLocalUserData();
      }
      localStorage.setItem('bible_app_last_active_uid', newUser.id);

      // Drain any queued offline mutations first before pulling fresh data
      if (navigator.onLine) {
        try {
          await drainSyncQueue(newUser.id);
        } catch (queueErr) {
          console.warn('[Auth] Error draining offline sync queue on session establish:', queueErr);
        }
      }

      if (cloudDataRefreshRef.current) {
        // ReadingContext callback already registered — call it directly
        try {
          await cloudDataRefreshRef.current(newUser.id);
          console.log('[Auth] Cloud data refresh completed for user:', newUser.id);
        } catch (err) {
          console.error('[Auth] Cloud data refresh failed:', err);
        }

        // Show migration banner ONLY if this is a new signup with guest data
        const migrationKey = `bible_sync_done_${newUser.id}`;
        const alreadyMigrated = localStorage.getItem(migrationKey) === 'true';
        if (isNewSignup && !alreadyMigrated) {
          setIsSyncModalOpen(true);
        }
      } else {
        // ReadingContext not yet mounted — store user for deferred cloud load.
        console.log('[Auth] ReadingContext callback not yet registered. Deferring cloud load until ReadingContext mounts.');
        pendingSessionUserRef.current = { user: newUser, isNewSignup };
      }
    },
    []
  );

  // Initialize session and auth state listener on app mount
  useEffect(() => {
    // 1. Immediately inspect local session snapshot
    const rawLocalSession = localStorage.getItem('bible_app_local_session');
    const rawProfile = localStorage.getItem('bible_app_profile_snapshot');
    let hasLocalSession = false;

    if (rawLocalSession) {
      try {
        const snap = JSON.parse(rawLocalSession);
        if (snap && snap.id) {
          const syntheticUser: User = {
            id: snap.id,
            app_metadata: snap.app_metadata || {},
            user_metadata: snap.user_metadata || {},
            aud: 'authenticated',
            created_at: new Date(snap.sessionSavedAt || Date.now()).toISOString(),
            email: snap.email || '',
            role: snap.role || 'authenticated'
          } as User;
          setUser(syntheticUser);
          hasLocalSession = true;

          if (rawProfile) {
            try {
              const prof = JSON.parse(rawProfile);
              if (prof) setProfile(prof);
            } catch {
              // ignore
            }
          }
          console.log('[Auth] Restored local session snapshot for user:', snap.id);
        }
      } catch (e) {
        console.warn('[Auth] Error parsing local session snapshot:', e);
      }
    }

    // 2. If offline, immediately conclude session loading so reader renders offline instantly
    if (!navigator.onLine) {
      console.log('[Auth] Device is offline at boot. Completed local session resolution.');
      setIsSessionLoading(false);
      return;
    }

    if (!isSupabaseConfigured) {
      setIsSessionLoading(false);
      return;
    }

    // 3. Online: Check existing session with Supabase with a fast 2-second timeout
    const sessionTimeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000));
    Promise.race([getSession(), sessionTimeout])
      .then(async (session) => {
        if (session?.user) {
          await handleUserSessionEstablished(session.user, false);
        } else if (!hasLocalSession && session === null) {
          // Only clear user if getSession definitively resolved with null and device had no local session
        }
      })
      .catch((err) => {
        console.warn('[Auth] getSession failed (network error):', err);
      })
      .finally(() => {
        setIsSessionLoading(false);
      });

    // 4. Background Sync Queue: online listener
    const handleOnlineEvent = () => {
      console.log('[Auth] Online event detected! Draining offline sync queue...');
      const targetUid = user?.id || (rawLocalSession ? JSON.parse(rawLocalSession)?.id : null);
      if (targetUid) {
        drainSyncQueue(targetUid).then(() => {
          if (cloudDataRefreshRef.current) {
            cloudDataRefreshRef.current(targetUid);
          }
        });
      }
    };
    window.addEventListener('online', handleOnlineEvent);

    // 5. Listen to Auth State Changes from Supabase
    const subscription = onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') return;

      if (session?.user) {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session.user);
          try {
            const sessionSnapshot = {
              id: session.user.id,
              email: session.user.email,
              user_metadata: session.user.user_metadata || {},
              app_metadata: session.user.app_metadata || {},
              role: session.user.role || 'authenticated',
              sessionSavedAt: Date.now()
            };
            localStorage.setItem('bible_app_local_session', JSON.stringify(sessionSnapshot));
          } catch {
            // ignore
          }
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('bible_app_local_session');
        localStorage.removeItem('bible_app_profile_snapshot');
        localStorage.removeItem('bible_app_last_active_uid');
        setUser(null);
        setProfile(null);
        setSyncStatus('synced');
        pendingSessionUserRef.current = null;
      }
    });

    return () => {
      window.removeEventListener('online', handleOnlineEvent);
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [handleUserSessionEstablished]);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const res = await signIn(email, pass);
    if (res.error) {
      return { success: false, error: res.error.message };
    }
    if (res.user) {
      // login is a returning user — never show migration banner
      await handleUserSessionEstablished(res.user, false);
    }
    return { success: true };
  };

  const signup = async (email: string, pass: string, name?: string): Promise<{ success: boolean; error?: string }> => {
    // Check for guest data BEFORE clearing localStorage in handleUserSessionEstablished
    const guestDataExists = hasGuestData();

    const res = await signUp(email, pass, name);
    if (res.error) {
      return { success: false, error: res.error.message };
    }
    if (res.user) {
      // signup — show migration banner if guest data existed
      await handleUserSessionEstablished(res.user, guestDataExists);
    }
    return { success: true };
  };

  const logout = async () => {
    localStorage.removeItem('bible_app_local_session');
    localStorage.removeItem('bible_app_profile_snapshot');
    localStorage.removeItem('bible_app_last_active_uid');
    await signOut();
    setUser(null);
    setProfile(null);
    setSyncStatus('synced');
    setIsSyncModalOpen(false);
    pendingSessionUserRef.current = null;

    // Clear ALL user-specific localStorage keys on logout to protect data isolation
    clearLocalUserData();
  };

  const triggerSync = async (): Promise<boolean> => {
    if (!user) return false;
    setSyncStatus('syncing');

    try {
      const success = await syncGuestDataToCloud(user.id);
      if (success) {
        // Mark migration as done for this user so the banner never reappears
        localStorage.setItem(`bible_sync_done_${user.id}`, 'true');
        // Reload cloud data after migration to ensure state is fresh
        if (cloudDataRefreshRef.current) {
          await cloudDataRefreshRef.current(user.id);
        }
        setSyncStatus('synced');
        console.log('[Sync] Guest data migration to cloud completed successfully.');
      } else {
        setSyncStatus('error');
        console.error('[Sync] Guest data migration to cloud failed.');
      }
      return success;
    } catch (err) {
      console.error('[Sync] triggerSync threw an exception:', err);
      setSyncStatus('error');
      return false;
    }
  };

  const updateProfileState = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      if (updates.avatar_url) {
        try {
          localStorage.setItem('bible_app_user_avatar', updates.avatar_url);
        } catch {
          // ignore
        }
      }
      return updated;
    });
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = (profile?.role === 'admin') || isAdminSessionActive();
  const isGuest = !isAuthenticated;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated,
        isAdmin,
        isGuest,
        isSessionLoading,
        syncStatus,
        isAuthModalOpen,
        isSyncModalOpen,
        setIsAuthModalOpen,
        setIsSyncModalOpen,
        login,
        signup,
        logout,
        triggerSync,
        updateProfileState,
        registerCloudDataRefresh
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
