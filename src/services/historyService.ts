import { ReadingHistoryItem, Language, BibleBook } from '../types/bible';
import { upsertCloudHistory } from './userDataService';

const HISTORY_KEY = 'bible_app_reading_history';
const HISTORY_LIST_KEY = 'bible_app_reading_history_list';
const MAX_LOCAL_HISTORY = 30;

export const getStoredHistory = (): ReadingHistoryItem | null => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading reading history:', err);
    return null;
  }
};

/**
 * Returns a list of recently-read chapters from localStorage (guest mode cache).
 * For authenticated users, the cloud list takes precedence.
 */
export const getStoredHistoryList = (): ReadingHistoryItem[] => {
  try {
    const raw = localStorage.getItem(HISTORY_LIST_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading reading history list:', err);
    return [];
  }
};

/**
 * Adds or updates an entry in the local history list.
 * Keeps the list capped at MAX_LOCAL_HISTORY items, sorted newest-first.
 */
export const addToLocalHistoryList = (item: ReadingHistoryItem): ReadingHistoryItem[] => {
  try {
    const existing = getStoredHistoryList();
    // Remove any existing entry for the same book+chapter to avoid duplicates
    const filtered = existing.filter(
      (h) => !(h.book_id === item.book_id && h.chapter === item.chapter)
    );
    // Prepend new item and cap at max
    const updated = [item, ...filtered].slice(0, MAX_LOCAL_HISTORY);
    localStorage.setItem(HISTORY_LIST_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error updating local history list:', err);
    return [];
  }
};

export const updateReadingHistory = async (
  book: BibleBook,
  chapter: number,
  verse: number = 1,
  language: Language = 'en',
  userId?: string | null
): Promise<ReadingHistoryItem> => {
  const item: ReadingHistoryItem = {
    book_id: book.id,
    chapter,
    verse,
    language,
    book_name_en: book.name_en,
    book_name_ta: book.name_ta,
    updated_at: new Date().toISOString()
  };

  try {
    // Save current position (single item for "continue reading" banner)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(item));
    // Also add to the history list
    addToLocalHistoryList(item);
  } catch (err) {
    console.error('Failed saving local reading history', err);
  }

  // Database sync via upsert if user is logged in
  if (userId) {
    await upsertCloudHistory(userId, book.code, chapter, verse);
  }

  return item;
};

