import { SearchResult, Language, Testament } from '../types/bible';
import { getAllLoadedVerses, BOOK_METADATA_LIST } from './csvBibleService';

// Expanded Phonetic Transliteration & Typo-Tolerance Dictionary (Tanglish -> Tamil)
const TANGLISH_MAP: Record<string, string> = {
  anbu: 'அன்பு',
  anbhu: 'அன்பு',
  anp: 'அன்பு',
  love: 'அன்பு',
  thevan: 'தேவன்',
  devan: 'தேவன்',
  devn: 'தேவன்',
  god: 'தேவன்',
  yesu: 'இயேசு',
  yeasu: 'இயேசு',
  yeesu: 'இயேசு',
  jesus: 'இயேசு',
  karthar: 'கர்த்தர்',
  karththa: 'கர்த்தர்',
  lord: 'கர்த்தர்',
  viswasam: 'விசுவாசம்',
  vishwasam: 'விசுவாசம்',
  visvasam: 'விசுவாசம்',
  faith: 'விசுவாசம்',
  ratham: 'இரத்தம்',
  rathamum: 'இரத்தம்',
  blood: 'இரத்தம்',
  magan: 'குமாரன்',
  kumaranaar: 'குமாரன்',
  son: 'குமாரன்',
  jeevan: 'ஜீவன்',
  life: 'ஜீவன்',
  vaarthai: 'வார்த்தை',
  word: 'வார்த்தை',
  paralogam: 'பரலோகம்',
  heaven: 'வானம்',
  vazhi: 'வழி',
  way: 'வழி',
  yovan: 'யோவான்',
  yohvan: 'யோவான்',
  yohaan: 'யோவான்',
  john: 'யோவான்',
  maththeyu: 'மத்தேயு',
  mmatheyya: 'மத்தேயு',
  matthew: 'மத்தேயு',
  marku: 'மாற்கு',
  mark: 'மாற்கு',
  lookka: 'லூக்கா',
  luke: 'லூக்கா',
  adhiyagamam: 'ஆதியாகமம்',
  genesis: 'ஆதியாகமம்',
  sangitham: 'சங்கீதம்',
  sangeetham: 'சங்கீதம்',
  psalm: 'சங்கீதம்',
  psalms: 'சங்கீதம்',
  neethimozhikal: 'நீதிமொழிகள்',
  proverbs: 'நீதிமொழிகள்'
};

// Normalize Unicode strings to NFC canonical composition
const normalizeString = (str: string): string => {
  return str ? str.normalize('NFC').trim() : '';
};

// Reference parser (e.g. "John 3:16", "yovan 3 16", "gen 1:1", "sangitham 23 1")
interface ParsedReference {
  bookIndex: number;
  chapter: number;
  verse?: number;
}

export const parseBibleReference = (query: string): ParsedReference | null => {
  const normalized = normalizeString(query).toLowerCase();
  const match = normalized.match(/^([a-z0-9\s]+?)\s+(\d+)(?:[:\s]+(\d+))?$/i);
  if (!match) return null;

  const bookPart = match[1].trim();
  const chapter = parseInt(match[2], 10);
  const verse = match[3] ? parseInt(match[3], 10) : undefined;

  const foundBook = BOOK_METADATA_LIST.find((b) => {
    const nameEn = b.name_en.toLowerCase();
    const nameTa = b.name_ta.toLowerCase();
    const code = b.code.toLowerCase();
    const tanglishName = TANGLISH_MAP[bookPart];

    return (
      nameEn.includes(bookPart) ||
      nameTa.includes(bookPart) ||
      code.startsWith(bookPart) ||
      (tanglishName && (nameTa.includes(tanglishName) || nameEn.includes(bookPart)))
    );
  });

  if (foundBook && !isNaN(chapter)) {
    return {
      bookIndex: foundBook.bookIndex,
      chapter,
      verse
    };
  }

  return null;
};

// Multi-tier Search Engine
export const executeTanglishSearch = (
  query: string,
  language: Language = 'en',
  testamentFilter?: Testament
): SearchResult[] => {
  const normQuery = normalizeString(query);
  if (!normQuery || normQuery.length < 2) return [];

  const allVerses = getAllLoadedVerses();
  const lowerQuery = normQuery.toLowerCase();
  const tanglishEquivalent = TANGLISH_MAP[lowerQuery] || '';

  // Tier 1: Reference Match ("John 3:16" or "yovan 3 16")
  const parsedRef = parseBibleReference(normQuery);
  if (parsedRef) {
    const refResults: SearchResult[] = [];
    const bookMeta = BOOK_METADATA_LIST[parsedRef.bookIndex];

    for (const v of allVerses) {
      if (v.book_id === bookMeta.id && v.chapter === parsedRef.chapter) {
        if (!parsedRef.verse || v.verse === parsedRef.verse) {
          refResults.push({
            id: v.id,
            book_id: v.book_id,
            book_name_en: bookMeta.name_en,
            book_name_ta: bookMeta.name_ta,
            chapter: v.chapter,
            verse: v.verse,
            text_en: v.text_en,
            text_ta: v.text_ta
          });
        }
      }
    }

    if (refResults.length > 0) return refResults.slice(0, 30);
  }

  // Tier 2: Text Matching (Exact, Tanglish Transliterated, Typo Tolerance)
  const results: SearchResult[] = [];

  for (const v of allVerses) {
    const bookMeta = BOOK_METADATA_LIST[v.book_id - 1];
    if (!bookMeta) continue;
    if (testamentFilter && bookMeta.testament !== testamentFilter) continue;

    const enText = v.text_en.toLowerCase();
    const taText = normalizeString(v.text_ta);

    const matchesEn = enText.includes(lowerQuery);
    const matchesTa = taText.includes(normQuery);
    const matchesTanglish = tanglishEquivalent ? taText.includes(tanglishEquivalent) : false;

    if (matchesEn || matchesTa || matchesTanglish) {
      results.push({
        id: v.id,
        book_id: v.book_id,
        book_name_en: bookMeta.name_en,
        book_name_ta: bookMeta.name_ta,
        chapter: v.chapter,
        verse: v.verse,
        text_en: v.text_en,
        text_ta: v.text_ta
      });

      if (results.length >= 45) break;
    }
  }

  return results;
};
