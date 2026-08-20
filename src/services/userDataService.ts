import { supabase } from '../lib/supabase';
import { ReadingPreferences, VerseNote, ReadingProgress } from '../types/bible';
import { HighlightColor } from './highlightService';

// Settings Sync
export const fetchCloudSettings = async (userId: string): Promise<Partial<ReadingPreferences> | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      fontSize: data.font_size,
      lineHeight: data.line_height,
      maxWidth: data.reading_width,
      theme: data.theme,
      language: data.language
    };
  } catch (err) {
    console.error('Error fetching cloud settings:', err);
    return null;
  }
};

export const upsertCloudSettings = async (userId: string, prefs: ReadingPreferences): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('user_settings').upsert(
      {
        user_id: userId,
        theme: prefs.theme,
        font_size: prefs.fontSize,
        line_height: prefs.lineHeight,
        reading_width: prefs.maxWidth,
        language: prefs.language,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id' }
    );
    return !error;
  } catch (err) {
    console.error('Error saving settings to cloud:', err);
    return false;
  }
};

// Bookmarks Sync
export interface CloudBookmark {
  id?: string;
  user_id?: string;
  book: string;
  chapter: number;
  verse: number;
  created_at?: string;
}

export const fetchCloudBookmarks = async (userId: string): Promise<CloudBookmark[]> => {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId);

    if (error || !data) return [];
    return data;
  } catch (err) {
    console.error('Error fetching bookmarks:', err);
    return [];
  }
};

export const upsertCloudBookmark = async (userId: string, book: string, chapter: number, verse: number): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('bookmarks').upsert(
      {
        user_id: userId,
        book,
        chapter,
        verse,
        created_at: new Date().toISOString()
      },
      { onConflict: 'user_id,book,chapter,verse' }
    );
    return !error;
  } catch (err) {
    console.error('Error saving bookmark to cloud:', err);
    return false;
  }
};

export const deleteCloudBookmark = async (userId: string, book: string, chapter: number, verse: number): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('book', book)
      .eq('chapter', chapter)
      .eq('verse', verse);

    return !error;
  } catch (err) {
    console.error('Error deleting bookmark from cloud:', err);
    return false;
  }
};

// Highlights Sync
export interface CloudHighlight {
  id?: string;
  user_id?: string;
  book: string;
  chapter: number;
  verse: number;
  color: string;
  created_at?: string;
  updated_at?: string;
}

export const fetchCloudHighlights = async (userId: string): Promise<CloudHighlight[]> => {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('highlights')
      .select('*')
      .eq('user_id', userId);

    if (error || !data) return [];
    return data;
  } catch (err) {
    console.error('Error fetching highlights:', err);
    return [];
  }
};

export const upsertCloudHighlight = async (
  userId: string,
  book: string,
  chapter: number,
  verse: number,
  color: HighlightColor
): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('highlights').upsert(
      {
        user_id: userId,
        book,
        chapter,
        verse,
        color,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id,book,chapter,verse' }
    );
    return !error;
  } catch (err) {
    console.error('Error saving highlight to cloud:', err);
    return false;
  }
};

export const deleteCloudHighlight = async (userId: string, book: string, chapter: number, verse: number): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('highlights')
      .delete()
      .eq('user_id', userId)
      .eq('book', book)
      .eq('chapter', chapter)
      .eq('verse', verse);

    return !error;
  } catch (err) {
    console.error('Error deleting highlight from cloud:', err);
    return false;
  }
};

// Notes Sync
export const fetchCloudNotes = async (userId: string): Promise<VerseNote[]> => {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId);

    if (error || !data) return [];
    return data;
  } catch (err) {
    console.error('Error fetching cloud notes:', err);
    return [];
  }
};

export const upsertCloudNote = async (
  userId: string,
  book: string,
  chapter: number,
  verse: number,
  content: string
): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('notes').upsert(
      {
        user_id: userId,
        book,
        chapter,
        verse,
        content,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id,book,chapter,verse' }
    );
    return !error;
  } catch (err) {
    console.error('Error saving note to cloud:', err);
    return false;
  }
};

export const deleteCloudNote = async (userId: string, book: string, chapter: number, verse: number): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('user_id', userId)
      .eq('book', book)
      .eq('chapter', chapter)
      .eq('verse', verse);

    return !error;
  } catch (err) {
    console.error('Error deleting note from cloud:', err);
    return false;
  }
};

// History Sync
export interface CloudHistoryItem {
  id?: string;
  user_id?: string;
  book: string;
  chapter: number;
  verse: number;
  last_read_at?: string;
}

export const fetchCloudHistory = async (userId: string): Promise<CloudHistoryItem | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('reading_history')
      .select('*')
      .eq('user_id', userId)
      .order('last_read_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  } catch (err) {
    console.error('Error fetching cloud reading history:', err);
    return null;
  }
};

export const upsertCloudHistory = async (
  userId: string,
  book: string,
  chapter: number,
  verse: number = 1
): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('reading_history').upsert(
      {
        user_id: userId,
        book,
        chapter,
        verse,
        last_read_at: new Date().toISOString()
      },
      { onConflict: 'user_id,book,chapter,verse' }
    );
    return !error;
  } catch (err) {
    console.error('Error updating reading history in cloud:', err);
    return false;
  }
};

// Progress Sync
export const fetchCloudProgress = async (userId: string): Promise<ReadingProgress | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  } catch (err) {
    console.error('Error fetching reading progress:', err);
    return null;
  }
};

export const upsertCloudProgress = async (
  userId: string,
  book: string,
  chapter: number,
  verse: number,
  scrollPosition: number
): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('reading_progress').upsert(
      {
        user_id: userId,
        book,
        chapter,
        verse,
        scroll_position: scrollPosition,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id,book,chapter' }
    );
    return !error;
  } catch (err) {
    console.error('Error updating reading progress in cloud:', err);
    return false;
  }
};
