import { Bookmark, Language, BibleBook, BibleVerse } from '../types/bible';
import { upsertCloudBookmark, deleteCloudBookmark } from './userDataService';

const BOOKMARKS_KEY = 'bible_app_bookmarks';

export const getStoredBookmarks = (): Bookmark[] => {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading local bookmarks:', err);
    return [];
  }
};

export const saveStoredBookmarks = (bookmarks: Bookmark[]): void => {
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch (err) {
    console.error('Error saving local bookmarks:', err);
  }
};

export const isVerseBookmarked = (
  bookmarks: Bookmark[],
  bookId: number,
  chapter: number,
  verse: number
): boolean => {
  return bookmarks.some(
    (b) => b.book_id === bookId && b.chapter === chapter && b.verse === verse
  );
};

export const toggleBookmark = async (
  bookmarks: Bookmark[],
  book: BibleBook,
  verseObj: BibleVerse,
  language: Language,
  userId?: string | null
): Promise<Bookmark[]> => {
  const existing = bookmarks.find(
    (b) => b.book_id === book.id && b.chapter === verseObj.chapter && b.verse === verseObj.verse
  );

  if (existing) {
    // Remove bookmark locally
    const updated = bookmarks.filter((b) => b.id !== existing.id);
    saveStoredBookmarks(updated);

    if (userId) {
      const cloudSuccess = await deleteCloudBookmark(userId, book.code, verseObj.chapter, verseObj.verse);
      if (!cloudSuccess) {
        console.error(`[Bookmark Sync Failed] Could not remove bookmark from Supabase for ${book.code} ${verseObj.chapter}:${verseObj.verse}`);
      }
    }
    return updated;
  } else {
    // Add bookmark locally
    const newBookmark: Bookmark = {
      id: crypto.randomUUID ? crypto.randomUUID() : `bm_${Date.now()}_${verseObj.verse}`,
      book_id: book.id,
      chapter: verseObj.chapter,
      verse: verseObj.verse,
      language,
      book_name_en: book.name_en,
      book_name_ta: book.name_ta,
      text_en: verseObj.text_en,
      text_ta: verseObj.text_ta,
      created_at: new Date().toISOString()
    };

    const updated = [newBookmark, ...bookmarks];
    saveStoredBookmarks(updated);

    if (userId) {
      const cloudSuccess = await upsertCloudBookmark(userId, book.code, verseObj.chapter, verseObj.verse);
      if (!cloudSuccess) {
        console.error(`[Bookmark Sync Failed] Could not insert bookmark into Supabase for ${book.code} ${verseObj.chapter}:${verseObj.verse}`);
      }
    }
    return updated;
  }
};
