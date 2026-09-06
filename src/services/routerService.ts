import { getBookMetaByCode, getBookMetaById, getBookMetaByIndex } from './csvBibleService';
import { BibleBook } from '../types/bible';

export interface RouteState {
  bookCode: string;
  chapter: number;
  verse?: number;
}

/** Check if current URL is the admin route (/admin or legacy #admin) */
export const isAdminRoute = (): boolean => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return path === '/admin' || path.startsWith('/admin/') || hash === '#admin';
};

/**
 * Parse path or hash route (e.g. "/JOHN/3/16", "/GEN/1", "/43/3/16", or legacy "#JOHN/3/16")
 */
export const parseRoute = (books: BibleBook[]): RouteState | null => {
  if (typeof window === 'undefined') return null;

  // If in admin route, this is not a reader route
  if (isAdminRoute()) return null;

  // 1. Check pathname first (e.g. /GEN/1/1 or /JOHN/3/16)
  let raw = window.location.pathname.replace(/^\/+|\/+$/g, '').trim();

  // If pathname is empty or root '/', check legacy hash (e.g. #GEN/1/1)
  if (!raw && window.location.hash) {
    raw = window.location.hash.replace(/^#\/?/, '').trim();
  }

  if (!raw) return null;

  const parts = raw.split('/');
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
  if (!meta && books && books.length > 0) {
    const norm = rawBook.toUpperCase();
    const foundBook = books.find(
      (b) => b.name_en.toUpperCase() === norm || b.name_ta.toUpperCase() === norm
    );
    if (foundBook) {
      meta = getBookMetaById(foundBook.id);
    }
  }

  if (meta) {
    // If route was triggered from hash, smoothly replace with clean path
    if (window.location.hash) {
      const cleanPath = verse
        ? `/${meta.code}/${chapter}/${verse}`
        : `/${meta.code}/${chapter}`;
      window.history.replaceState({ bookCode: meta.code, chapter, verse }, '', cleanPath);
    }

    return {
      bookCode: meta.code,
      chapter,
      verse
    };
  }

  return null;
};

// Backwards compatibility alias
export const parseHashRoute = parseRoute;

/**
 * Update location route using clean HTML5 path (e.g. /GEN/1/1 or /GEN/1) without page reload
 */
export const updateRoute = (bookCode: string, chapter: number, verse?: number): void => {
  if (typeof window === 'undefined') return;
  if (isAdminRoute()) return;

  const newPath = verse
    ? `/${bookCode.toUpperCase()}/${chapter}/${verse}`
    : `/${bookCode.toUpperCase()}/${chapter}`;

  if (window.location.pathname !== newPath || window.location.hash) {
    window.history.replaceState({ bookCode, chapter, verse }, '', newPath);
  }
};

// Backwards compatibility alias
export const updateHashRoute = updateRoute;

/**
 * Navigate to Admin panel using clean path (/admin)
 */
export const navigateToAdmin = (): void => {
  if (typeof window === 'undefined') return;
  if (window.location.pathname !== '/admin') {
    window.history.pushState({ view: 'admin' }, '', '/admin');
  }
  // If there was a hash, clear it
  if (window.location.hash) {
    window.history.replaceState({ view: 'admin' }, '', '/admin');
  }
  window.dispatchEvent(new CustomEvent('app-route-change', { detail: { view: 'admin' } }));
};

/**
 * Navigate to Bible Reader using clean path (/ or /GEN/1)
 */
export const navigateToReader = (bookCode?: string, chapter?: number, verse?: number): void => {
  if (typeof window === 'undefined') return;
  const targetPath = bookCode
    ? `/${bookCode.toUpperCase()}/${chapter || 1}${verse ? `/${verse}` : ''}`
    : '/';

  window.history.pushState({ view: 'reader', bookCode, chapter, verse }, '', targetPath);
  // Clear any trailing hash
  if (window.location.hash) {
    window.history.replaceState({ view: 'reader', bookCode, chapter, verse }, '', targetPath);
  }
  window.dispatchEvent(new CustomEvent('app-route-change', { detail: { view: 'reader', bookCode, chapter, verse } }));
};
