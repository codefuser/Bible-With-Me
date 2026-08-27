import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { UserProfile, SyncStatus } from '../types/bible';
import { getSession, getUserProfile, signIn, signUp, signOut, onAuthStateChange } from '../services/authService';
import { syncGuestDataToCloud } from '../services/syncService';
import { isSupabaseConfigured } from '../lib/supabase';

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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [isSessionLoading, setIsSessionLoading] = useState<boolean>(true);
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

      // Fetch profile (non-blocking — UI updates when ready)
      getUserProfile(newUser.id).then((prof) => {
        setProfile(prof);
        if (prof?.avatar_url) {
          try {
            localStorage.setItem('bible_app_user_avatar', prof.avatar_url);
            console.log('[Auth] Restored profile avatar from cloud:', prof.avatar_url);
          } catch {
            // ignore
          }
        }
      });

      // Clear any stale local/guest data before loading cloud data
      clearLocalUserData();

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
        // registerCloudDataRefresh() will trigger the load once ReadingContext registers.
        console.log('[Auth] ReadingContext callback not yet registered. Deferring cloud load until ReadingContext mounts.');
        pendingSessionUserRef.current = { user: newUser, isNewSignup };
      }
    },
    []
  );

  // Initialize session and auth state listener on app mount
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // No Supabase config — skip session check and go directly to landing page
      setIsSessionLoading(false);
      return;
    }

    // Check existing session (page reload / tab re-open)
    getSession().then(async (session) => {
      if (session?.user) {
        // Session restore: load cloud data automatically, no sync banner
        await handleUserSessionEstablished(session.user, false);
      }
      // Session check done — reveal the correct screen
      setIsSessionLoading(false);
    });

    // Listen to Auth State Changes from Supabase (handles token refresh etc.)
    const subscription = onAuthStateChange(async (event, session) => {
      // INITIAL_SESSION is handled by getSession() above; skip to avoid double-load
      if (event === 'INITIAL_SESSION') return;

      if (session?.user) {
        if (event === 'SIGNED_IN') {
          // This fires after login/signup — handled by login()/signup() directly.
          // We only handle TOKEN_REFRESHED here to keep the user object current.
          setUser(session.user);
        } else if (event === 'TOKEN_REFRESHED') {
          setUser(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setSyncStatus('synced');
        pendingSessionUserRef.current = null;
      }
    });

    return () => {
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
  const isAdmin = profile?.role === 'admin';
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
