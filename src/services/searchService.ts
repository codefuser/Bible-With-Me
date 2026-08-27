import { SearchResult, Language, Testament } from '../types/bible';
import { loadBibleDatasets, isDatasetLoaded } from './csvBibleService';
import { executeTanglishSearch, getBibleWordSuggestions as getSuggestions } from './tanglishSearch';

export { TANGLISH_MAP } from './tanglishSearch';

export const searchBibleVerses = async (
  query: string,
  language: Language = 'en',
  testamentFilter?: Testament,
  fromBookId?: number,
  toBookId?: number
): Promise<SearchResult[]> => {
  if (!isDatasetLoaded()) {
    await loadBibleDatasets();
  }
  return executeTanglishSearch(query, language, testamentFilter, fromBookId, toBookId);
};

export const getBibleWordSuggestions = (prefix: string, limit: number = 8): string[] => {
  if (!isDatasetLoaded()) return [];
  return getSuggestions(prefix, limit);
};
