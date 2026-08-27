import { supabase } from '../lib/supabase';
import { ReadingPreferences, VerseNote, ReadingProgress } from '../types/bible';
import { HighlightColor } from './highlightService';

// ─── Settings ────────────────────────────────────────────────────────────────

export const fetchCloudSettings = async (userId: string): Promise<Partial<ReadingPreferences> | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[Supabase Error] fetchCloudSettings failed:', error.message, error.details, error.code);
      return null;
    }
    if (!data) return null;

    return {
      fontSize: data.font_size,
      lineHeight: data.line_height,
      maxWidth: data.reading_width,
      theme: data.theme,
      language: data.language,
      fontFamilyTa: data.font_family_ta,
      fontFamilyEn: data.font_family_en
    };
  } catch (err) {
    console.error('[Supabase Exception] fetchCloudSettings threw:', err);
    return null;
  }
};

export const upsertCloudSettings = async (userId: string, prefs: ReadingPreferences): Promise<boolean> => {
  if (!supabase) {
    console.warn('[Supabase] Client not configured. Cannot upsert cloud settings.');
    return false;
  }
  try {
    const { error } = await supabase.from('user_settings').upsert(
      {
        user_id: userId,
        theme: prefs.theme,
        font_size: prefs.fontSize,
        line_height: prefs.lineHeight,
        reading_width: prefs.maxWidth,
        language: prefs.language,
        font_family_ta: prefs.fontFamilyTa || 'noto',
        font_family_en: prefs.fontFamilyEn || 'lora',
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id' }
    );
    if (error) {
      console.error('[Supabase Error] upsertCloudSettings failed:', error.message, error.details, error.hint, error.code);
      return false;
    }
    console.log('[Cloud Sync Success] Settings saved to Supabase for user:', userId);
    return true;
  } catch (err) {
    console.error('[Supabase Exception] upsertCloudSettings threw:', err);
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
  if (!supabase) {
    console.warn('[Supabase] Client not configured. Cannot fetch cloud bookmarks.');
    return [];
  }
  try {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase Error] fetchCloudBookmarks failed:', error.message, error.details, error.hint, error.code);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('[Supabase Exception] Error fetching bookmarks:', err);
    return [];
  }
};

export const upsertCloudBookmark = async (userId: string, book: string, chapter: number, verse: number): Promise<boolean> => {
  if (!supabase) {
    console.warn('[Supabase] Client not configured. Cannot upsert cloud bookmark.');
    return false;
  }
  try {
    const normalizedBook = book.toUpperCase();
    const payload = {
      user_id: userId,
      book: normalizedBook,
      chapter,
      verse,
      created_at: new Date().toISOString()
    };

    // 1. Try standard upsert
    const { error } = await supabase.from('bookmarks').upsert(payload, { onConflict: 'user_id,book,chapter,verse' });

    if (error) {
      console.warn('[Supabase Upsert Warning] Upsert returned error, trying fallback insert:', error.message, error.code);
      // 2. Fallback: try direct insert
      const { error: insertErr } = await supabase.from('bookmarks').insert(payload);
      if (insertErr && !insertErr.message?.includes('duplicate key') && !insertErr.message?.includes('unique constraint')) {
        console.error('[Supabase Error] upsertCloudBookmark fallback insert failed:', insertErr.message, insertErr.details);
        return false;
      }
    }

    console.log(`[Cloud Sync Success] Saved bookmark to Supabase: ${normalizedBook} ${chapter}:${verse} (user: ${userId})`);
    return true;
  } catch (err) {
    console.error('[Supabase Exception] Error saving bookmark to cloud:', err);
    return false;
  }
};

export const deleteCloudBookmark = async (userId: string, book: string, chapter: number, verse: number): Promise<boolean> => {
  if (!supabase) {
    console.warn('[Supabase] Client not configured. Cannot delete cloud bookmark.');
    return false;
  }
  try {
    const normalizedBook = book.toUpperCase();
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('book', normalizedBook)
      .eq('chapter', chapter)
      .eq('verse', verse);

    if (error) {
      console.error('[Supabase Error] deleteCloudBookmark failed:', error.message, error.details, error.hint, error.code);
      return false;
    }
    console.log(`[Cloud Sync Success] Deleted bookmark from Supabase: ${normalizedBook} ${chapter}:${verse} (user: ${userId})`);
    return true;
  } catch (err) {
    console.error('[Supabase Exception] Error deleting bookmark from cloud:', err);
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
  if (!supabase) {
    console.warn('[Supabase] Client not configured. Cannot fetch cloud highlights.');
    return [];
  }
  try {
    const { data, error } = await supabase
      .from('highlights')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('[Supabase Error] fetchCloudHighlights failed:', error.message, error.details, error.hint, error.code);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('[Supabase Exception] fetchCloudHighlights threw:', err);
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
  if (!supabase) {
    console.warn('[Supabase] Client not configured. Cannot upsert cloud highlight.');
    return false;
  }
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
    if (error) {
      console.error('[Supabase Error] upsertCloudHighlight failed:', error.message, error.details, error.hint, error.code);
      return false;
    }
    console.log(`[Cloud Sync Success] Saved highlight to Supabase: ${book} ${chapter}:${verse} color=${color} (user: ${userId})`);
    return true;
  } catch (err) {
    console.error('[Supabase Exception] upsertCloudHighlight threw:', err);
    return false;
  }
};

export const deleteCloudHighlight = async (userId: string, book: string, chapter: number, verse: number): Promise<boolean> => {
  if (!supabase) {
    console.warn('[Supabase] Client not configured. Cannot delete cloud highlight.');
    return false;
  }
  try {
    const { error } = await supabase
      .from('highlights')
      .delete()
      .eq('user_id', userId)
      .eq('book', book)
      .eq('chapter', chapter)
      .eq('verse', verse);

    if (error) {
      console.error('[Supabase Error] deleteCloudHighlight failed:', error.message, error.details, error.hint, error.code);
      return false;
    }
    console.log(`[Cloud Sync Success] Deleted highlight from Supabase: ${book} ${chapter}:${verse} (user: ${userId})`);
    return true;
  } catch (err) {
    console.error('[Supabase Exception] deleteCloudHighlight threw:', err);
    return false;
  }
};

// Notes Sync
export const fetchCloudNotes = async (userId: string): Promise<VerseNote[]> => {
  if (!supabase) {
    console.warn('[Supabase] Client not configured. Cannot fetch cloud notes.');
    return [];
  }
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('[Supabase Error] fetchCloudNotes failed:', error.message, error.details, error.hint, error.code);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('[Supabase Exception] fetchCloudNotes threw:', err);
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
  if (!supabase) {
    console.warn('[Supabase] Client not configured. Cannot upsert cloud note.');
    return false;
  }
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
    if (error) {
      console.error('[Supabase Error] upsertCloudNote failed:', error.message, error.details, error.hint, error.code);
      return false;
    }
    console.log(`[Cloud Sync Success] Saved note to Supabase: ${book} ${chapter}:${verse} (user: ${userId})`);
    return true;
  } catch (err) {
    console.error('[Supabase Exception] upsertCloudNote threw:', err);
    return false;
  }
};

export const deleteCloudNote = async (userId: string, book: string, chapter: number, verse: number): Promise<boolean> => {
  if (!supabase) {
    console.warn('[Supabase] Client not configured. Cannot delete cloud note.');
    return false;
  }
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('user_id', userId)
      .eq('book', book)
      .eq('chapter', chapter)
      .eq('verse', verse);

    if (error) {
      console.error('[Supabase Error] deleteCloudNote failed:', error.message, error.details, error.hint, error.code);
      return false;
    }
    console.log(`[Cloud Sync Success] Deleted note from Supabase: ${book} ${chapter}:${verse} (user: ${userId})`);
    return true;
  } catch (err) {
    console.error('[Supabase Exception] deleteCloudNote threw:', err);
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
  if (!supabase) {
    console.warn('[Supabase] Client not configured. Cannot fetch cloud history.');
    return null;
  }
  try {
    const { data, error } = await supabase
      .from('reading_history')
      .select('*')
      .eq('user_id', userId)
      .order('last_read_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[Supabase Error] fetchCloudHistory failed:', error.message, error.details, error.hint, error.code);
      return null;
    }
    return data || null;
  } catch (err) {
    console.error('[Supabase Exception] fetchCloudHistory threw:', err);
    return null;
  }
};

/**
 * Fetches all recent reading history items for a user (up to 50 records).
 * Used to populate the full history list modal.
 */
export const fetchAllCloudHistory = async (userId: string): Promise<CloudHistoryItem[]> => {
  if (!supabase) {
    console.warn('[Supabase] Client not configured. Cannot fetch cloud history list.');
    return [];
  }
  try {
    const { data, error } = await supabase
      .from('reading_history')
      .select('*')
      .eq('user_id', userId)
      .order('last_read_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[Supabase Error] fetchAllCloudHistory failed:', error.message, error.details, error.hint, error.code);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('[Supabase Exception] fetchAllCloudHistory threw:', err);
    return [];
  }
};

export const upsertCloudHistory = async (
  userId: string,
  book: string,
  chapter: number,
  verse: number = 1
): Promise<boolean> => {
  if (!supabase) {
    console.warn('[Supabase] Client not configured. Cannot upsert cloud history.');
    return false;
  }
  try {
    const payload = {
      user_id: userId,
      book,
      chapter,
      verse,
      last_read_at: new Date().toISOString()
    };

    const { error } = await supabase.from('reading_history').upsert(payload, { onConflict: 'user_id,book,chapter' });

    if (error) {
      console.warn('[Supabase History Upsert Warning] Trying fallback insert:', error.message);
      const { error: insertErr } = await supabase.from('reading_history').insert(payload);
      if (insertErr && !insertErr.message?.includes('duplicate key') && !insertErr.message?.includes('unique constraint')) {
        console.error('[Supabase Error] upsertCloudHistory failed:', insertErr.message);
        return false;
      }
    }

    console.log(`[Cloud Sync Success] Saved reading history to Supabase: ${book} ${chapter}:${verse} (user: ${userId})`);
    return true;
  } catch (err) {
    console.error('[Supabase Exception] upsertCloudHistory threw:', err);
    return false;
  }
};

// ─── Reading Progress ─────────────────────────────────────────────────────────

export const fetchCloudProgress = async (userId: string): Promise<ReadingProgress | null> => {
  if (!supabase) {
    console.warn('[Supabase] Client not configured. Cannot fetch cloud progress.');
    return null;
  }
  try {
    const { data, error } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[Supabase Error] fetchCloudProgress failed:', error.message, error.details, error.hint, error.code);
      return null;
    }
    return data || null;
  } catch (err) {
    console.error('[Supabase Exception] fetchCloudProgress threw:', err);
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
  if (!supabase) {
    console.warn('[Supabase] Client not configured. Cannot upsert cloud progress.');
    return false;
  }
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
    if (error) {
      console.error('[Supabase Error] upsertCloudProgress failed:', error.message, error.details, error.hint, error.code);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase Exception] upsertCloudProgress threw:', err);
    return false;
  }
};

// ─── Search History & Opened Verses Cloud Sync ──────────────────────────────

export const fetchCloudSearchData = async (
  userId: string
): Promise<{ searchHistory: string[]; openedVerses: any[] }> => {
  if (!supabase || !userId) return { searchHistory: [], openedVerses: [] };

  const historySet = new Set<string>();
  const openedList: any[] = [];

  try {
    // 1. Fetch from user_activity table (guaranteed to exist across Supabase DBs)
    const { data: actData, error: actErr } = await supabase
      .from('user_activity')
      .select('metadata, activity_type, created_at')
      .eq('user_id', userId)
      .in('activity_type', ['SEARCH_PERFORMED', 'SEARCH_RESULT_OPENED'])
      .order('created_at', { ascending: false })
      .limit(60);

    if (!actErr && actData && actData.length > 0) {
      actData.forEach((act) => {
        if (act.activity_type === 'SEARCH_PERFORMED' && act.metadata?.query) {
          const q = String(act.metadata.query).trim();
          if (q.length >= 2) historySet.add(q);
        } else if (act.activity_type === 'SEARCH_RESULT_OPENED' && act.metadata?.verse) {
          const v = act.metadata.verse;
          const exists = openedList.some(
            (item) => item.book_id === v.book_id && item.chapter === v.chapter && item.verse === v.verse
          );
          if (!exists) openedList.push(v);
        }
      });
    }

    // 2. Fetch from user_settings table
    const { data: setObj } = await supabase
      .from('user_settings')
      .select('search_history, opened_verses')
      .eq('user_id', userId)
      .maybeSingle();

    if (setObj) {
      if (Array.isArray(setObj.search_history)) {
        setObj.search_history.forEach((term: string) => {
          if (typeof term === 'string' && term.trim().length >= 2) {
            historySet.add(term.trim());
          }
        });
      }
      if (Array.isArray(setObj.opened_verses)) {
        setObj.opened_verses.forEach((v: any) => {
          if (
            v &&
            v.book_id &&
            !openedList.some(
              (item) => item.book_id === v.book_id && item.chapter === v.chapter && item.verse === v.verse
            )
          ) {
            openedList.push(v);
          }
        });
      }
    }
  } catch (err) {
    console.error('[Supabase Exception] fetchCloudSearchData threw:', err);
  }

  return {
    searchHistory: Array.from(historySet).slice(0, 10),
    openedVerses: openedList.slice(0, 15)
  };
};

export const saveCloudSearchHistory = async (
  userId: string,
  history: string[]
): Promise<boolean> => {
  if (!supabase || !userId) return false;
  try {
    // 1. Log latest search in user_activity
    const latestQuery = history[0];
    if (latestQuery) {
      await supabase.from('user_activity').insert({
        user_id: userId,
        activity_type: 'SEARCH_PERFORMED',
        metadata: { query: latestQuery, full_history: history },
        created_at: new Date().toISOString()
      });
    }

    // 2. Upsert in user_settings
    await supabase.from('user_settings').upsert(
      {
        user_id: userId,
        search_history: history,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id' }
    );

    console.log('[Cloud Sync Success] Search history saved to Supabase for user:', userId);
    return true;
  } catch (err) {
    console.error('[Supabase Exception] saveCloudSearchHistory failed:', err);
    return false;
  }
};

export const saveCloudOpenedVerses = async (
  userId: string,
  openedVerses: any[]
): Promise<boolean> => {
  if (!supabase || !userId) return false;
  try {
    // 1. Log latest opened verse in user_activity
    const latestVerse = openedVerses[0];
    if (latestVerse) {
      await supabase.from('user_activity').insert({
        user_id: userId,
        activity_type: 'SEARCH_RESULT_OPENED',
        book: String(latestVerse.book_name_en || latestVerse.book_id).toUpperCase(),
        chapter: latestVerse.chapter,
        verse: latestVerse.verse,
        metadata: { verse: latestVerse, full_opened: openedVerses },
        created_at: new Date().toISOString()
      });
    }

    // 2. Upsert in user_settings
    await supabase.from('user_settings').upsert(
      {
        user_id: userId,
        opened_verses: openedVerses,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id' }
    );

    console.log('[Cloud Sync Success] Opened verses history saved to Supabase for user:', userId);
    return true;
  } catch (err) {
    console.error('[Supabase Exception] saveCloudOpenedVerses failed:', err);
    return false;
  }
};
