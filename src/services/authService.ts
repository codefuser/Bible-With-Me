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
    // 1. Fetch Supabase Auth user (contains user_metadata)
    const { data: authData } = await supabase.auth.getUser();
    const authUser = authData?.user;
    const meta = authUser?.user_metadata || {};

    // 2. Fetch profiles table row
    const { data: dbProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    const mergedAvatar = meta.avatar_url || (dbProfile as any)?.avatar_url || localStorage.getItem('bible_app_user_avatar') || undefined;
    const mergedName = meta.display_name || dbProfile?.display_name || authUser?.email?.split('@')[0] || 'User';

    return {
      id: userId,
      email: authUser?.email || dbProfile?.email || '',
      display_name: mergedName,
      avatar_url: mergedAvatar,
      role: dbProfile?.role || 'user',
      created_at: dbProfile?.created_at || authUser?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
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
    // 1. Primary: Save directly into Supabase Auth user_metadata (100% supported on all Supabase DBs)
    const { error: authErr } = await supabase.auth.updateUser({
      data: updates
    });

    if (authErr) {
      console.warn('[Supabase Auth Metadata Warning]:', authErr.message);
    } else {
      console.log('[Supabase Auth Sync] Successfully saved profile updates to user_metadata:', Object.keys(updates));
    }

    // 2. Secondary: Update profiles table (only fields that exist: display_name)
    if (updates.display_name) {
      try {
        await supabase.from('profiles').upsert(
          { id: userId, display_name: updates.display_name, updated_at: new Date().toISOString() },
          { onConflict: 'id' }
        );
      } catch {
        // ignore profile table errors if display_name column issues exist
      }
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
