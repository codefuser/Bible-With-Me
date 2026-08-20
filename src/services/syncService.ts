import { getStoredBookmarks } from './bookmarkService';
import { getStoredHighlights, saveHighlight, HighlightColor } from './highlightService';
import { getStoredHistory } from './historyService';
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
import { Bookmark, ReadingHistoryItem } from '../types/bible';
import { ALL_BIBLE_BOOKS } from './bibleService';

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

    // 2. Load Cloud Highlights into Local Cache
    const cloudHighlights = await fetchCloudHighlights(userId);
    for (const hl of cloudHighlights) {
      const matchedBook = ALL_BIBLE_BOOKS.find((b) => b.code.toUpperCase() === hl.book.toUpperCase() || String(b.id) === hl.book);
      const bookId = matchedBook ? matchedBook.id : parseInt(hl.book, 10) || 1;
      saveHighlight(bookId, hl.chapter, hl.verse, hl.color as HighlightColor);
    }

    // 3. Load Cloud Notes into Local Storage
    const cloudNotes = await fetchCloudNotes(userId);
    for (const note of cloudNotes) {
      saveNote(note.book, note.chapter, note.verse, note.content);
    }

  } catch (err) {
    console.error('Error loading cloud data into local cache:', err);
  }
};
