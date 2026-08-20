import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { UserProfile, SyncStatus } from '../types/bible';
import { getSession, getUserProfile, signIn, signUp, signOut, onAuthStateChange } from '../services/authService';
import { syncGuestDataToCloud, loadCloudDataToLocal } from '../services/syncService';
import { isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isGuest: boolean;
  syncStatus: SyncStatus;
  isAuthModalOpen: boolean;
  isSyncModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsSyncModalOpen: (open: boolean) => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, pass: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  triggerSync: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);

  // Initialize session and auth state listener on app mount
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Check existing session
    getSession().then((session) => {
      if (session?.user) {
        setUser(session.user);
        getUserProfile(session.user.id).then((prof) => setProfile(prof));
        loadCloudDataToLocal(session.user.id);
      }
    });

    // Listen to Auth State Changes
    const subscription = onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const prof = await getUserProfile(session.user.id);
        setProfile(prof);

        if (event === 'SIGNED_IN') {
          // Check if guest has local data to prompt sync banner
          setIsSyncModalOpen(true);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const res = await signIn(email, pass);
    if (res.error) {
      return { success: false, error: res.error.message };
    }
    if (res.user) {
      setUser(res.user);
      const prof = await getUserProfile(res.user.id);
      setProfile(prof);
      setIsSyncModalOpen(true);
    }
    return { success: true };
  };

  const signup = async (email: string, pass: string, name?: string): Promise<{ success: boolean; error?: string }> => {
    const res = await signUp(email, pass, name);
    if (res.error) {
      return { success: false, error: res.error.message };
    }
    if (res.user) {
      setUser(res.user);
      const prof = await getUserProfile(res.user.id);
      setProfile(prof);
      setIsSyncModalOpen(true);
    }
    return { success: true };
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    setProfile(null);
    setSyncStatus('synced');
  };

  const triggerSync = async (): Promise<boolean> => {
    if (!user) return false;
    setSyncStatus('syncing');
    const success = await syncGuestDataToCloud(user.id);
    if (success) {
      await loadCloudDataToLocal(user.id);
      setSyncStatus('synced');
    } else {
      setSyncStatus('error');
    }
    return success;
  };

  const isAuthenticated = Boolean(user);
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
        syncStatus,
        isAuthModalOpen,
        isSyncModalOpen,
        setIsAuthModalOpen,
        setIsSyncModalOpen,
        login,
        signup,
        logout,
        triggerSync
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
