import { ReadingHistoryItem, Language, BibleBook } from '../types/bible';
import { supabase } from '../lib/supabase';

const HISTORY_KEY = 'bible_app_reading_history';

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

export const updateReadingHistory = async (
  book: BibleBook,
  chapter: number,
  verse: number = 1,
  language: Language = 'en'
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
    localStorage.setItem(HISTORY_KEY, JSON.stringify(item));
  } catch (err) {
    console.error('Failed saving local reading history', err);
  }

  // Attempt database sync if Supabase is connected
  if (supabase) {
    try {
      await supabase.from('user_reading_history').insert({
        book_id: book.id,
        chapter,
        verse,
        language
      });
    } catch (err) {
      console.warn('Supabase history sync skipped:', err);
    }
  }

  return item;
};
