import { SearchResult, Language, Testament } from '../types/bible';
import { loadBibleDatasets, isDatasetLoaded } from './csvBibleService';
import { executeTanglishSearch } from './tanglishSearch';

export const searchBibleVerses = async (
  query: string,
  language: Language = 'en',
  testamentFilter?: Testament
): Promise<SearchResult[]> => {
  if (!isDatasetLoaded()) {
    await loadBibleDatasets();
  }
  return executeTanglishSearch(query, language, testamentFilter);
};
