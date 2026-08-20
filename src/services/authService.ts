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
      .single();

    if (error || !data) {
      console.warn('Could not fetch user profile:', error?.message);
      return null;
    }

    return data as UserProfile;
  } catch (err) {
    console.error('Error fetching profile:', err);
    return null;
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
