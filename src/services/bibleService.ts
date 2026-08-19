import { BibleBook, BibleVerse } from '../types/bible';
import {
  loadBibleDatasets,
  getBibleBooks,
  getChapterVerses,
  isDatasetLoaded
} from './csvBibleService';

export const ALL_BIBLE_BOOKS = getBibleBooks();

// Ensure dataset is loaded before returning Bible books
export const fetchBibleBooks = async (): Promise<BibleBook[]> => {
  if (!isDatasetLoaded()) {
    await loadBibleDatasets();
  }
  return getBibleBooks();
};

// Fetch verses for a given book and chapter from the local CSV dataset
export const fetchChapterVerses = async (bookId: number, chapter: number): Promise<BibleVerse[]> => {
  if (!isDatasetLoaded()) {
    await loadBibleDatasets();
  }
  return getChapterVerses(bookId, chapter);
};
