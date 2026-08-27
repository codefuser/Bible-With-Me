import Papa from 'papaparse';
import { BibleBook, BibleVerse, Testament } from '../types/bible';

// Canonical Book Metadata Mappings for 0-indexed book numbers (0 to 65)
export interface BookMeta {
  bookIndex: number; // 0..65 (CSV 0-indexed column value)
  id: number;        // 1..66 (Canonical 1-based ID)
  testament: Testament;
  name_en: string;
  name_ta: string;
  code: string;
}

export const BOOK_METADATA_LIST: BookMeta[] = [
  // OT (0..38)
  { bookIndex: 0, id: 1, testament: 'OT', name_en: 'Genesis', name_ta: 'ஆதியாகமம்', code: 'GEN' },
  { bookIndex: 1, id: 2, testament: 'OT', name_en: 'Exodus', name_ta: 'யாத்திராகமம்', code: 'EXO' },
  { bookIndex: 2, id: 3, testament: 'OT', name_en: 'Leviticus', name_ta: 'லேவியராகமம்', code: 'LEV' },
  { bookIndex: 3, id: 4, testament: 'OT', name_en: 'Numbers', name_ta: 'எண்ணாகமம்', code: 'NUM' },
  { bookIndex: 4, id: 5, testament: 'OT', name_en: 'Deuteronomy', name_ta: 'உபாகமம்', code: 'DEU' },
  { bookIndex: 5, id: 6, testament: 'OT', name_en: 'Joshua', name_ta: 'யோசுவா', code: 'JOSH' },
  { bookIndex: 6, id: 7, testament: 'OT', name_en: 'Judges', name_ta: 'நியாயாதிபதிகள்', code: 'JUDG' },
  { bookIndex: 7, id: 8, testament: 'OT', name_en: 'Ruth', name_ta: 'ரூத்', code: 'RUTH' },
  { bookIndex: 8, id: 9, testament: 'OT', name_en: '1 Samuel', name_ta: '1 சாமுவேல்', code: '1SAM' },
  { bookIndex: 9, id: 10, testament: 'OT', name_en: '2 Samuel', name_ta: '2 சாமுவேல்', code: '2SAM' },
  { bookIndex: 10, id: 11, testament: 'OT', name_en: '1 Kings', name_ta: '1 இராஜாக்கள்', code: '1KNG' },
  { bookIndex: 11, id: 12, testament: 'OT', name_en: '2 Kings', name_ta: '2 இராஜாக்கள்', code: '2KNG' },
  { bookIndex: 12, id: 13, testament: 'OT', name_en: '1 Chronicles', name_ta: '1 நாளாகமம்', code: '1CHR' },
  { bookIndex: 13, id: 14, testament: 'OT', name_en: '2 Chronicles', name_ta: '2 நாளாகமம்', code: '2CHR' },
  { bookIndex: 14, id: 15, testament: 'OT', name_en: 'Ezra', name_ta: 'எஸ்றா', code: 'EZRA' },
  { bookIndex: 15, id: 16, testament: 'OT', name_en: 'Nehemiah', name_ta: 'நெகேமியா', code: 'NEH' },
  { bookIndex: 16, id: 17, testament: 'OT', name_en: 'Esther', name_ta: 'எஸ்தர்', code: 'ESTH' },
  { bookIndex: 17, id: 18, testament: 'OT', name_en: 'Job', name_ta: 'யோபு', code: 'JOB' },
  { bookIndex: 18, id: 19, testament: 'OT', name_en: 'Psalms', name_ta: 'சங்கீதம்', code: 'PSA' },
  { bookIndex: 19, id: 20, testament: 'OT', name_en: 'Proverbs', name_ta: 'நீதிமொழிகள்', code: 'PROV' },
  { bookIndex: 20, id: 21, testament: 'OT', name_en: 'Ecclesiastes', name_ta: 'பிரசங்கி', code: 'ECCL' },
  { bookIndex: 21, id: 22, testament: 'OT', name_en: 'Song of Solomon', name_ta: 'உன்னதப்பாட்டு', code: 'SONG' },
  { bookIndex: 22, id: 23, testament: 'OT', name_en: 'Isaiah', name_ta: 'ஏசாயா', code: 'ISA' },
  { bookIndex: 23, id: 24, testament: 'OT', name_en: 'Jeremiah', name_ta: 'எரேமியா', code: 'JER' },
  { bookIndex: 24, id: 25, testament: 'OT', name_en: 'Lamentations', name_ta: 'புலம்பல்', code: 'LAM' },
  { bookIndex: 25, id: 26, testament: 'OT', name_en: 'Ezekiel', name_ta: 'எசேக்கியேல்', code: 'EZEK' },
  { bookIndex: 26, id: 27, testament: 'OT', name_en: 'Daniel', name_ta: 'தானியேல்', code: 'DAN' },
  { bookIndex: 27, id: 28, testament: 'OT', name_en: 'Hosea', name_ta: 'ஓசியா', code: 'HOS' },
  { bookIndex: 28, id: 29, testament: 'OT', name_en: 'Joel', name_ta: 'யோவேல்', code: 'JOEL' },
  { bookIndex: 29, id: 30, testament: 'OT', name_en: 'Amos', name_ta: 'ஆமோஸ்', code: 'AMOS' },
  { bookIndex: 30, id: 31, testament: 'OT', name_en: 'Obadiah', name_ta: 'ஒபதியா', code: 'OBAD' },
  { bookIndex: 31, id: 32, testament: 'OT', name_en: 'Jonah', name_ta: 'யோனா', code: 'JONAH' },
  { bookIndex: 32, id: 33, testament: 'OT', name_en: 'Micah', name_ta: 'மீகா', code: 'MIC' },
  { bookIndex: 33, id: 34, testament: 'OT', name_en: 'Nahum', name_ta: 'நாகூம்', code: 'NAH' },
  { bookIndex: 34, id: 35, testament: 'OT', name_en: 'Habakkuk', name_ta: 'அபகூக்', code: 'HAB' },
  { bookIndex: 35, id: 36, testament: 'OT', name_en: 'Zephaniah', name_ta: 'செப்பனியா', code: 'ZEPH' },
  { bookIndex: 36, id: 37, testament: 'OT', name_en: 'Haggai', name_ta: 'ஆகாய்', code: 'HAG' },
  { bookIndex: 37, id: 38, testament: 'OT', name_en: 'Zechariah', name_ta: 'சகரியா', code: 'ZECH' },
  { bookIndex: 38, id: 39, testament: 'OT', name_en: 'Malachi', name_ta: 'மல்கியா', code: 'MAL' },

  // NT (39..65)
  { bookIndex: 39, id: 40, testament: 'NT', name_en: 'Matthew', name_ta: 'மத்தேயு', code: 'MATT' },
  { bookIndex: 40, id: 41, testament: 'NT', name_en: 'Mark', name_ta: 'மாற்கு', code: 'MARK' },
  { bookIndex: 41, id: 42, testament: 'NT', name_en: 'Luke', name_ta: 'லூக்கா', code: 'LUKE' },
  { bookIndex: 42, id: 43, testament: 'NT', name_en: 'John', name_ta: 'யோவான்', code: 'JOHN' },
  { bookIndex: 43, id: 44, testament: 'NT', name_en: 'Acts', name_ta: 'அப்போஸ்தலர்', code: 'ACTS' },
  { bookIndex: 44, id: 45, testament: 'NT', name_en: 'Romans', name_ta: 'ரோமர்', code: 'ROM' },
  { bookIndex: 45, id: 46, testament: 'NT', name_en: '1 Corinthians', name_ta: '1 கொரிந்தியர்', code: '1COR' },
  { bookIndex: 46, id: 47, testament: 'NT', name_en: '2 Corinthians', name_ta: '2 கொரிந்தியர்', code: '2COR' },
  { bookIndex: 47, id: 48, testament: 'NT', name_en: 'Galatians', name_ta: 'கலாத்தியர்', code: 'GAL' },
  { bookIndex: 48, id: 49, testament: 'NT', name_en: 'Ephesians', name_ta: 'எபேசியர்', code: 'EPH' },
  { bookIndex: 49, id: 50, testament: 'NT', name_en: 'Philippians', name_ta: 'பிலிப்பியர்', code: 'PHIL' },
  { bookIndex: 50, id: 51, testament: 'NT', name_en: 'Colossians', name_ta: 'கொலோசெயர்', code: 'COL' },
  { bookIndex: 51, id: 52, testament: 'NT', name_en: '1 Thessalonians', name_ta: '1 தெசலோனிக்கேயர்', code: '1THES' },
  { bookIndex: 52, id: 53, testament: 'NT', name_en: '2 Thessalonians', name_ta: '2 தெசலோனிக்கேயர்', code: '2THES' },
  { bookIndex: 53, id: 54, testament: 'NT', name_en: '1 Timothy', name_ta: '1 தீமோத்தேவு', code: '1TIM' },
  { bookIndex: 54, id: 55, testament: 'NT', name_en: '2 Timothy', name_ta: '2 தீமோத்தேவு', code: '2TIM' },
  { bookIndex: 55, id: 56, testament: 'NT', name_en: 'Titus', name_ta: 'தீத்து', code: 'TITUS' },
  { bookIndex: 56, id: 57, testament: 'NT', name_en: 'Philemon', name_ta: 'பிலேமோன்', code: 'PHILEM' },
  { bookIndex: 57, id: 58, testament: 'NT', name_en: 'Hebrews', name_ta: 'எபிரெயர்', code: 'HEB' },
  { bookIndex: 58, id: 59, testament: 'NT', name_en: 'James', name_ta: 'யாக்கோபு', code: 'JAS' },
  { bookIndex: 59, id: 60, testament: 'NT', name_en: '1 Peter', name_ta: '1 பேதுரு', code: '1PET' },
  { bookIndex: 60, id: 61, testament: 'NT', name_en: '2 Peter', name_ta: '2 பேதுரு', code: '2PET' },
  { bookIndex: 61, id: 62, testament: 'NT', name_en: '1 John', name_ta: '1 யோவான்', code: '1JOHN' },
  { bookIndex: 62, id: 63, testament: 'NT', name_en: '2 John', name_ta: '2 யோவான்', code: '2JOHN' },
  { bookIndex: 63, id: 64, testament: 'NT', name_en: '3 John', name_ta: '3 யோவான்', code: '3JOHN' },
  { bookIndex: 64, id: 65, testament: 'NT', name_en: 'Jude', name_ta: 'யூதா', code: 'JUDE' },
  { bookIndex: 65, id: 66, testament: 'NT', name_en: 'Revelation', name_ta: 'வெளிப்படுத்தின விசேஷம்', code: 'REV' }
];

// Explicit Canonical Lookup Functions
export const getBookMetaById = (id: number): BookMeta | undefined => {
  return BOOK_METADATA_LIST.find((m) => m.id === id);
};

export const getBookMetaByIndex = (index: number): BookMeta | undefined => {
  return BOOK_METADATA_LIST.find((m) => m.bookIndex === index);
};

export const getBookMetaByCode = (code: string): BookMeta | undefined => {
  const norm = code.trim().toUpperCase();
  return BOOK_METADATA_LIST.find((m) => m.code.toUpperCase() === norm);
};

// Raw CSV Row structure
interface CsvRow {
  id: string;
  book: string;
  chapter: string;
  versecount: string;
  verse: string;
}

// Global In-Memory Stores
let isLoaded = false;
let loadPromise: Promise<void> | null = null;

export interface IndexedWord {
  word: string;
  lower: string;
  count: number;
}

// Map key format: `${bookIndex}_${chapter}_${verseNumber}`
const verseStore = new Map<string, BibleVerse>();
// Array of all verses for fast search iteration
const allVersesStore: BibleVerse[] = [];
// Pre-indexed unique Bible words sorted by frequency
let indexedBibleWords: IndexedWord[] = [];
// Bucket index mapping 1st character of word -> array of IndexedWords for 0ms prefix lookup
const wordPrefixMap = new Map<string, IndexedWord[]>();
// Dynamic max chapter map: `bookIndex -> maxChapter`
const bookMaxChapters = new Map<number, number>();

export const getPreindexedBibleWords = () => indexedBibleWords;
export const getBibleWordsForPrefix = (prefixChar: string): IndexedWord[] => {
  if (!prefixChar) return indexedBibleWords;
  return wordPrefixMap.get(prefixChar.toLowerCase()) || indexedBibleWords;
};

export const loadBibleDatasets = (): Promise<void> => {
  if (isLoaded) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      // 1. Fetch both CSV files concurrently
      const [enRes, taRes] = await Promise.all([
        fetch('/bible-datasets/english-bible.csv'),
        fetch('/bible-datasets/tamil-bible.csv')
      ]);

      const [enCsvText, taCsvText] = await Promise.all([
        enRes.text(),
        taRes.text()
      ]);

      // 2. Parse CSVs using PapaParse
      const enParsed = Papa.parse<CsvRow>(enCsvText, { header: true, skipEmptyLines: true });
      const taParsed = Papa.parse<CsvRow>(taCsvText, { header: true, skipEmptyLines: true });

      const enRows = enParsed.data;
      const taRows = taParsed.data;

      const totalCount = Math.min(enRows.length, taRows.length);

      for (let i = 0; i < totalCount; i++) {
        const enRow = enRows[i];
        const taRow = taRows[i];

        const bookIndex = parseInt(enRow.book, 10);
        const chapter = parseInt(enRow.chapter, 10);
        const verseNum = parseInt(enRow.versecount, 10);
        const verseId = parseInt(enRow.id, 10);

        if (isNaN(bookIndex) || isNaN(chapter) || isNaN(verseNum)) continue;

        // Track max chapter count per book
        const currentMax = bookMaxChapters.get(bookIndex) || 0;
        if (chapter > currentMax) {
          bookMaxChapters.set(bookIndex, chapter);
        }

        const bookMeta = getBookMetaByIndex(bookIndex);
        const canonicalBookId = bookMeta ? bookMeta.id : bookIndex + 1;

        const textEn = enRow.verse ? enRow.verse.trim() : '';
        const textTa = taRow.verse ? taRow.verse.trim() : '';

        const verseObj: BibleVerse = {
          id: verseId,
          book_id: canonicalBookId, // 1-based canonical ID (e.g. Genesis=1, John=43)
          chapter,
          verse: verseNum,
          text_en: textEn,
          text_ta: textTa,
          norm_ta: textTa ? textTa.normalize('NFC') : '',
          lower_en: textEn ? textEn.toLowerCase() : ''
        };

        const key = `${bookIndex}_${chapter}_${verseNum}`;
        verseStore.set(key, verseObj);
        allVersesStore.push(verseObj);
      }

      // Pre-index unique words for 0ms lag-free auto-complete suggestions
      const wordCountMap = new Map<string, number>();
      for (const v of allVersesStore) {
        const cleanedTa = (v.norm_ta || v.text_ta).replace(/[.,!?:;""''()\[\]\-«»—‘’“”]/g, ' ');
        const cleanedEn = (v.lower_en || v.text_en).replace(/[^a-zA-Z0-9\s]/g, ' ');

        const taWords = cleanedTa.split(/\s+/);
        for (const w of taWords) {
          if (w.length >= 2) {
            wordCountMap.set(w, (wordCountMap.get(w) || 0) + 1);
          }
        }

        const enWords = cleanedEn.split(/\s+/);
        for (const w of enWords) {
          if (w.length >= 2) {
            const titleCase = w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
            wordCountMap.set(titleCase, (wordCountMap.get(titleCase) || 0) + 1);
          }
        }
      }

      indexedBibleWords = Array.from(wordCountMap.entries())
        .map(([word, count]) => ({ word, lower: word.toLowerCase(), count }))
        .sort((a, b) => b.count - a.count);

      wordPrefixMap.clear();
      for (const item of indexedBibleWords) {
        const firstChar = item.lower[0];
        if (firstChar) {
          let bucket = wordPrefixMap.get(firstChar);
          if (!bucket) {
            bucket = [];
            wordPrefixMap.set(firstChar, bucket);
          }
          bucket.push(item);
        }
      }

      isLoaded = true;
      console.log(`Successfully loaded ${allVersesStore.length} verses and ${indexedBibleWords.length} indexed words into prefix buckets!`);
    } catch (err) {
      console.error('Failed loading Bible CSV datasets:', err);
      throw err;
    }
  })();

  return loadPromise;
};

// Return all 66 books with dynamically calculated chapter counts
export const getBibleBooks = (): BibleBook[] => {
  return BOOK_METADATA_LIST.map((meta) => ({
    id: meta.id,
    bookIndex: meta.bookIndex,
    book_number: meta.id,
    testament: meta.testament,
    name_en: meta.name_en,
    name_ta: meta.name_ta,
    code: meta.code,
    total_chapters: bookMaxChapters.get(meta.bookIndex) || 1
  }));
};

// Fetch verses for a specific book by 1-based bookId or 0-based bookIndex
export const getChapterVerses = (bookIdOrIndex: number, chapter: number): BibleVerse[] => {
  let meta = getBookMetaById(bookIdOrIndex);
  if (!meta) {
    meta = getBookMetaByIndex(bookIdOrIndex);
  }
  if (!meta) return [];

  const bookIndex = meta.bookIndex;
  const results: BibleVerse[] = [];
  let verseNum = 1;

  while (true) {
    const key = `${bookIndex}_${chapter}_${verseNum}`;
    const found = verseStore.get(key);
    if (!found) break;
    results.push(found);
    verseNum++;
  }

  return results;
};

// Fetch individual verse by bookId and chapter/verse
export const getVerseByLocation = (bookIdOrIndex: number, chapter: number, verse: number): BibleVerse | null => {
  let meta = getBookMetaById(bookIdOrIndex);
  if (!meta) {
    meta = getBookMetaByIndex(bookIdOrIndex);
  }
  if (!meta) return null;

  const key = `${meta.bookIndex}_${chapter}_${verse}`;
  return verseStore.get(key) || null;
};

// Access all loaded verses for in-memory search
export const getAllLoadedVerses = (): BibleVerse[] => {
  return allVersesStore;
};

// Check if dataset is ready
export const isDatasetLoaded = (): boolean => isLoaded;
