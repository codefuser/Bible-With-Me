import { getBookMetaByCode, getBookMetaById, getBookMetaByIndex } from './csvBibleService';
import { BibleBook } from '../types/bible';

export interface RouteState {
  bookCode: string;
  chapter: number;
  verse?: number;
}

// Parse location hash (e.g. "#JOHN/3/16" or "#GEN/1" or "#43/3/16")
export const parseHashRoute = (books: BibleBook[]): RouteState | null => {
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  if (!hash) return null;

  const parts = hash.split('/');
  if (parts.length < 2) return null;

  const rawBook = parts[0].trim();
  const chapter = parseInt(parts[1], 10);
  const verse = parts[2] ? parseInt(parts[2], 10) : undefined;

  if (isNaN(chapter)) return null;

  // 1. Try matching by uppercase code (e.g. JOHN, GEN, MATT)
  let meta = getBookMetaByCode(rawBook);

  // 2. Try matching by numeric ID if rawBook is a number
  if (!meta && !isNaN(parseInt(rawBook, 10))) {
    const num = parseInt(rawBook, 10);
    meta = getBookMetaById(num) || getBookMetaByIndex(num);
  }

  // 3. Try matching by English or Tamil book name
  if (!meta) {
    const norm = rawBook.toUpperCase();
    const foundBook = books.find(
      (b) => b.name_en.toUpperCase() === norm || b.name_ta.toUpperCase() === norm
    );
    if (foundBook) {
      meta = getBookMetaById(foundBook.id);
    }
  }

  if (meta) {
    return {
      bookCode: meta.code,
      chapter,
      verse
    };
  }

  return null;
};

// Update location hash without full page reload
export const updateHashRoute = (bookCode: string, chapter: number, verse?: number): void => {
  const hash = verse ? `#${bookCode}/${chapter}/${verse}` : `#${bookCode}/${chapter}`;
  if (window.location.hash !== hash) {
    window.history.replaceState(null, '', hash);
  }
};
