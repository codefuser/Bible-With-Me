import { supabase } from '../lib/supabase';
import { UserProfile } from '../types/bible';
import { User, Session } from '@supabase/supabase-js';

export const signUp = async (
  email: string,
  pass: string,
  displayName?: string
): Promise<{ user: User | null; error: Error | null }> => {
  if (!supabase) {
    return { user: null, error: new Error('Supabase client is not configured.') };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          display_name: displayName || email.split('@')[0]
        }
      }
    });

    if (error) return { user: null, error };
    return { user: data.user, error: null };
  } catch (err: any) {
    return { user: null, error: err };
  }
};

export const signIn = async (
  email: string,
  pass: string
): Promise<{ user: User | null; session: Session | null; error: Error | null }> => {
  if (!supabase) {
    return { user: null, session: null, error: new Error('Supabase client is not configured.') };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass
    });

    if (error) return { user: null, session: null, error };
    return { user: data.user, session: data.session, error: null };
  } catch (err: any) {
    return { user: null, session: null, error: err };
  }
};

export const signOut = async (): Promise<{ error: Error | null }> => {
  if (!supabase) return { error: null };
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err: any) {
    return { error: err };
  }
};

export const getSession = async (): Promise<Session | null> => {
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch (err) {
    console.error('Error fetching session:', err);
    return null;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('[Supabase Profile] fetch warning:', error.message);
    }

    if (data) {
      return data as UserProfile;
    }

    // Fallback: check Supabase Auth user metadata
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user && userData.user.id === userId) {
      const meta = userData.user.user_metadata || {};
      return {
        id: userId,
        email: userData.user.email || '',
        display_name: meta.display_name || userData.user.email?.split('@')[0] || 'User',
        avatar_url: meta.avatar_url || localStorage.getItem('bible_app_user_avatar') || undefined,
        role: 'user',
        created_at: userData.user.created_at,
        updated_at: new Date().toISOString()
      } as UserProfile;
    }

    return null;
  } catch (err) {
    console.error('Error fetching profile:', err);
    return null;
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: { display_name?: string; avatar_url?: string }
): Promise<{ success: boolean; error?: string }> => {
  if (!supabase) return { success: false, error: 'Supabase client not configured.' };
  try {
    // 1. Try Upsert on profiles table
    const { error: upsertErr } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          ...updates,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );

    if (upsertErr) {
      console.warn('[Supabase Profile Upsert Warning] Trying update fallback:', upsertErr.message);
      // 2. Try Update fallback
      const { error: updateErr } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (updateErr) {
        console.error('[Supabase Profile Update Error]:', updateErr.message);
      }
    }

    // 3. Backup to Supabase Auth user metadata
    try {
      await supabase.auth.updateUser({
        data: updates
      });
      console.log('[Supabase Auth] Updated user_metadata with profile updates for:', userId);
    } catch (authErr) {
      console.warn('[Supabase Auth Metadata Warning]:', authErr);
    }

    return { success: true };
  } catch (err: any) {
    console.error('[updateUserProfile Exception]:', err);
    return { success: false, error: err?.message || 'Failed to update profile.' };
  }
};

export const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
  if (!supabase) return { error: new Error('Supabase client not configured.') };

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  } catch (err: any) {
    return { error: err };
  }
};

export const onAuthStateChange = (
  callback: (event: string, session: Session | null) => void
) => {
  if (!supabase) return { unsubscribe: () => {} };
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription;
};
