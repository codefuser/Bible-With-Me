import { getStoredBookmarks, saveStoredBookmarks } from './bookmarkService';
import { getStoredHighlights, saveHighlight, HighlightColor } from './highlightService';
import { getStoredHistory, updateReadingHistory } from './historyService';
import { getStoredPreferences, savePreferences } from './preferencesService';
import { getStoredNotes, saveNote } from './noteService';
import {
  upsertCloudBookmark,
  upsertCloudHighlight,
  upsertCloudNote,
  upsertCloudSettings,
  upsertCloudHistory,
  fetchCloudBookmarks,
  fetchCloudHighlights,
  fetchCloudNotes,
  fetchCloudSettings,
  fetchCloudHistory
} from './userDataService';
import { Bookmark } from '../types/bible';
import { ALL_BIBLE_BOOKS, fetchChapterVerses } from './bibleService';

/**
 * Migrates all local guest data (localStorage) to Supabase Cloud for a newly logged in user.
 */
export const syncGuestDataToCloud = async (userId: string): Promise<boolean> => {
  try {
    // 1. Sync Settings
    const localPrefs = getStoredPreferences();
    await upsertCloudSettings(userId, localPrefs);

    // 2. Sync Bookmarks
    const localBookmarks = getStoredBookmarks();
    for (const bm of localBookmarks) {
      const bookCode = ALL_BIBLE_BOOKS.find((b) => b.id === bm.book_id)?.code || String(bm.book_id);
      await upsertCloudBookmark(userId, bookCode, bm.chapter, bm.verse);
    }

    // 3. Sync Highlights
    const localHighlights = getStoredHighlights();
    for (const [key, color] of Object.entries(localHighlights)) {
      const [bookIdStr, chStr, vStr] = key.split('_');
      const bookId = parseInt(bookIdStr, 10);
      const bookCode = ALL_BIBLE_BOOKS.find((b) => b.id === bookId)?.code || bookIdStr;
      await upsertCloudHighlight(userId, bookCode, parseInt(chStr, 10), parseInt(vStr, 10), color as HighlightColor);
    }

    // 4. Sync Notes
    const localNotes = getStoredNotes();
    for (const note of localNotes) {
      await upsertCloudNote(userId, note.book, note.chapter, note.verse, note.content);
    }

    // 5. Sync Reading History
    const localHistory = getStoredHistory();
    if (localHistory) {
      const bookCode = ALL_BIBLE_BOOKS.find((b) => b.id === localHistory.book_id)?.code || String(localHistory.book_id);
      await upsertCloudHistory(userId, bookCode, localHistory.chapter, localHistory.verse);
    }

    return true;
  } catch (err) {
    console.error('Error during guest data cloud migration:', err);
    return false;
  }
};

/**
 * Loads cloud bookmarks from Supabase, maps them to local Bible metadata & CSV text,
 * and returns the array of Bookmark objects.
 *
 * IMPORTANT: For authenticated users, NEVER falls back to localStorage.
 * Returning stale localStorage data would mix data between users on shared devices.
 * Returns an empty array on error instead.
 */
export const loadCloudBookmarksToLocal = async (userId: string): Promise<Bookmark[]> => {
  // Guest: use localStorage
  if (!userId) return getStoredBookmarks();

  try {
    const cloudBms = await fetchCloudBookmarks(userId);

    // cloudBms is always an array (empty on error). Map it — never fall back to localStorage.
    const mappedBookmarks: Bookmark[] = [];
    const books = ALL_BIBLE_BOOKS;

    for (const cb of cloudBms) {
      const matchedBook = books.find(
        (b) => b.code.toUpperCase() === cb.book.toUpperCase() || String(b.id) === cb.book
      );

      const bookId = matchedBook ? matchedBook.id : parseInt(cb.book, 10) || 1;
      const bookNameEn = matchedBook ? matchedBook.name_en : cb.book;
      const bookNameTa = matchedBook ? matchedBook.name_ta : cb.book;

      let textEn = '';
      let textTa = '';

      try {
        const chapterVerses = await fetchChapterVerses(bookId, cb.chapter);
        const vObj = chapterVerses.find((v) => v.verse === cb.verse);
        if (vObj) {
          textEn = vObj.text_en;
          textTa = vObj.text_ta;
        }
      } catch (err) {
        console.warn(`Could not resolve verse text for cloud bookmark ${cb.book} ${cb.chapter}:${cb.verse}`, err);
      }

      mappedBookmarks.push({
        id: cb.id || `bm_${cb.book}_${cb.chapter}_${cb.verse}`,
        book_id: bookId,
        chapter: cb.chapter,
        verse: cb.verse,
        language: 'en',
        book_name_en: bookNameEn,
        book_name_ta: bookNameTa,
        text_en: textEn,
        text_ta: textTa,
        created_at: cb.created_at || new Date().toISOString()
      });
    }

    // Persist to localStorage so offline reads still work, but this is a cache — not the source of truth
    saveStoredBookmarks(mappedBookmarks);
    console.log(`[Cloud Load] Loaded ${mappedBookmarks.length} bookmarks from Supabase for user: ${userId}`);
    return mappedBookmarks;
  } catch (err) {
    // Return empty array for authenticated users — do NOT return another user's localStorage data
    console.error('[Cloud Load Error] loadCloudBookmarksToLocal failed. Returning empty array to prevent data contamination:', err);
    return [];
  }
};

/**
 * Fetches cloud data from Supabase and merges/updates local cache.
 */
export const loadCloudDataToLocal = async (userId: string): Promise<void> => {
  try {
    // 1. Merge Cloud Settings
    const cloudPrefs = await fetchCloudSettings(userId);
    if (cloudPrefs) {
      const currentLocal = getStoredPreferences();
      savePreferences({ ...currentLocal, ...cloudPrefs });
    }

    // 2. Load Cloud Bookmarks into Local Cache
    await loadCloudBookmarksToLocal(userId);

    // 3. Load Cloud Highlights into Local Cache
    const cloudHighlights = await fetchCloudHighlights(userId);
    for (const hl of cloudHighlights) {
      const matchedBook = ALL_BIBLE_BOOKS.find((b) => b.code.toUpperCase() === hl.book.toUpperCase() || String(b.id) === hl.book);
      const bookId = matchedBook ? matchedBook.id : parseInt(hl.book, 10) || 1;
      await saveHighlight(bookId, hl.chapter, hl.verse, hl.color as HighlightColor);
    }

    // 4. Load Cloud Notes into Local Storage
    const cloudNotes = await fetchCloudNotes(userId);
    for (const note of cloudNotes) {
      await saveNote(note.book, note.chapter, note.verse, note.content);
    }

    // 5. Load Cloud History into Local Storage
    const cloudHistory = await fetchCloudHistory(userId);
    if (cloudHistory) {
      const matchedBook = ALL_BIBLE_BOOKS.find((b) => b.code.toUpperCase() === cloudHistory.book.toUpperCase() || String(b.id) === cloudHistory.book);
      if (matchedBook) {
        await updateReadingHistory(matchedBook, cloudHistory.chapter, cloudHistory.verse);
      }
    }

  } catch (err) {
    console.error('Error loading cloud data into local cache:', err);
  }
};
