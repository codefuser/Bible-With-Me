import { ALL_BIBLE_BOOKS } from './bibleService';
import { upsertCloudHighlight, deleteCloudHighlight } from './userDataService';

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'orange';

export interface VerseHighlight {
  book_id: number;
  chapter: number;
  verse: number;
  color: HighlightColor;
  updated_at: string;
}

const HIGHLIGHTS_KEY = 'bible_app_highlights';

// Key format: `${book_id}_${chapter}_${verse}` -> color
export const getStoredHighlights = (): Record<string, HighlightColor> => {
  try {
    const raw = localStorage.getItem(HIGHLIGHTS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading local highlights:', err);
    return {};
  }
};

export const saveHighlight = async (
  bookId: number,
  chapter: number,
  verse: number,
  color: HighlightColor | null,
  userId?: string | null
): Promise<Record<string, HighlightColor>> => {
  const current = getStoredHighlights();
  const key = `${bookId}_${chapter}_${verse}`;

  if (!color) {
    delete current[key];
  } else {
    current[key] = color;
  }

  try {
    localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(current));
  } catch (err) {
    console.error('Error saving local highlights:', err);
  }

  if (userId) {
    const bookCode = ALL_BIBLE_BOOKS.find((b) => b.id === bookId)?.code || String(bookId);
    if (!color) {
      await deleteCloudHighlight(userId, bookCode, chapter, verse);
    } else {
      await upsertCloudHighlight(userId, bookCode, chapter, verse, color);
    }
  }

  return { ...current };
};

export const getVerseHighlightColor = (
  highlights: Record<string, HighlightColor>,
  bookId: number,
  chapter: number,
  verse: number
): HighlightColor | null => {
  const key = `${bookId}_${chapter}_${verse}`;
  return highlights[key] || null;
};
