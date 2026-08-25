import { SearchResult, Language, Testament } from '../types/bible';
import { getAllLoadedVerses, BOOK_METADATA_LIST } from './csvBibleService';

// Expanded Phonetic Transliteration & Typo-Tolerance Dictionary (Tanglish -> Tamil)
export const TANGLISH_MAP: Record<string, string> = {
  // Love / Affection
  anbu: 'அன்பு',
  anbhu: 'அன்பு',
  anp: 'அன்பு',
  love: 'அன்பு',

  // God / Lord
  thevan: 'தேவன்',
  devan: 'தேவன்',
  devn: 'தேவன்',
  god: 'தேவன்',
  karthar: 'கர்த்தர்',
  karththa: 'கர்த்தர்',
  karththar: 'கர்த்தர்',
  lord: 'கர்த்தர்',

  // Jesus / Christ / Savior
  yesu: 'இயேசு',
  yeasu: 'இயேசு',
  yeesu: 'இயேசு',
  jesus: 'இயேசு',
  christu: 'கிறிஸ்து',
  christ: 'கிறிஸ்து',
  ratchagar: 'இரட்சகர்',
  savior: 'இரட்சகர்',
  saviour: 'இரட்சகர்',

  // Faith / Belief
  viswasam: 'விசுவாசம்',
  vishwasam: 'விசுவாசம்',
  visvasam: 'விசுவாசம்',
  faith: 'விசுவாசம்',
  believers: 'விசுவாசிகள்',

  // Blood / Cross / Sacrifice
  ratham: 'இரத்தம்',
  rattham: 'இரத்தம்',
  rathamum: 'இரத்தம்',
  blood: 'இரத்தம்',
  silavai: 'சிலுவை',
  cross: 'சிலுவை',

  // Son / Child / Father
  magan: 'குமாரன்',
  kumaranaar: 'குமாரன்',
  son: 'குமாரன்',
  pitha: 'பிதா',
  father: 'பிதா',

  // Life / Light / Way / Truth
  jeevan: 'ஜீவன்',
  life: 'ஜீவன்',
  velicham: 'வெளிச்சம்',
  light: 'வெளிச்சம்',
  vazhi: 'வழி',
  way: 'வழி',
  sathiyam: 'சத்தியம்',
  truth: 'சத்தியம்',

  // Word / Gospel / Scripture
  vaarthai: 'வார்த்தை',
  word: 'வார்த்தை',
  sundhesham: 'சுவிசேஷம்',
  suvisesham: 'சுவிசேஷம்',
  gospel: 'சுவிசேஷம்',

  // Heaven / Earth / Kingdom
  paralogam: 'பரலோகம்',
  heaven: 'வானம்',
  boomi: 'பூமி',
  earth: 'பூமி',
  rajyam: 'ராஜ்யம்',
  kingdom: 'ராஜ்யம்',

  // Peace / Joy / Grace / Holy / Spirit
  samadhanam: 'சமாதானம்',
  peace: 'சமாதானம்',
  santhosham: 'சந்தோஷம்',
  joy: 'சந்தோஷம்',
  kirubai: 'கிருபை',
  grace: 'கிருபை',
  parisutha: 'பரிசுத்த',
  holy: 'பரிசுத்த',
  aavi: 'ஆவி',
  spirit: 'ஆவி',

  // Prayer / Praise / Worship
  jebam: 'ஜெபம்',
  prarthanai: 'பிரார்த்தனை',
  prayer: 'ஜெபம்',
  thuthi: 'துதி',
  praise: 'துதி',
  aaradhana: 'ஆராதனை',
  worship: 'ஆராதனை',

  // Blessing / Mercy / Sin / Forgiveness
  aaseervatham: 'ஆசீர்வாதம்',
  blessing: 'ஆசீர்வாதம்',
  irakkam: 'இரக்கம்',
  mercy: 'இரக்கம்',
  pavam: 'பாவம்',
  sin: 'பாவம்',
  mannippu: 'மன்னிப்பு',
  forgiveness: 'மன்னிப்பு',

  // Books
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
  proverbs: 'நீதிமொழிகள்',
  samuel: 'சாமுவேல்'
};

// Normalize Unicode strings to NFC canonical composition
export const normalizeString = (str: string): string => {
  return str ? str.normalize('NFC').trim() : '';
};

interface ParsedReference {
  bookIndex: number;
  chapter: number;
  verse?: number;
}

// Unicode-aware Reference Parser (e.g., "John 3:16", "1 Samuel 7:1", "1 சாமுவேல் 7:1", "1sam 7", "sangitham 23 1")
export const parseBibleReference = (query: string): ParsedReference | null => {
  const normalized = normalizeString(query).toLowerCase();

  // Unicode regex: optional book number (1-3) + book title (English or Tamil) + chapter + optional verse
  const match = normalized.match(/^((?:[1-3]\s*)?[\p{L}\s]+?)\s+(\d+)(?:[:\s]+(\d+))?$/iu);
  if (!match) return null;

  const rawBook = match[1].trim();
  const chapter = parseInt(match[2], 10);
  const verse = match[3] ? parseInt(match[3], 10) : undefined;

  const compactBook = rawBook.replace(/\s+/g, '');
  const mappedTanglish = TANGLISH_MAP[compactBook] || TANGLISH_MAP[rawBook];

  const foundBook = BOOK_METADATA_LIST.find((b) => {
    const nameEn = b.name_en.toLowerCase();
    const nameTa = b.name_ta.toLowerCase();
    const code = b.code.toLowerCase();
    const codeNoSpaces = code.replace(/\s+/g, '');

    return (
      nameEn === rawBook ||
      nameEn.startsWith(rawBook) ||
      nameEn.replace(/\s+/g, '') === compactBook ||
      nameTa === rawBook ||
      nameTa.startsWith(rawBook) ||
      nameTa.replace(/\s+/g, '') === compactBook ||
      code === rawBook ||
      codeNoSpaces === compactBook ||
      (mappedTanglish && (nameTa.includes(mappedTanglish) || nameEn.includes(rawBook)))
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

/**
 * Executes multi-tier search across the ENTIRE Bible dataset.
 * - Never truncates results artificially (scans all 31,102 verses).
 * - Matches direct Tamil substring, English substring, Tanglish transliteration, and reference lookup.
 * - Filters by testament if specified.
 */
export const executeTanglishSearch = (
  query: string,
  _language: Language = 'en',
  testamentFilter?: Testament
): SearchResult[] => {
  const normQuery = normalizeString(query);
  if (!normQuery || normQuery.length < 1) return [];

  const allVerses = getAllLoadedVerses();
  const lowerQuery = normQuery.toLowerCase();

  // Tier 1: Reference Match ("John 3:16", "1 Samuel 7:1", "1 சாமுவேல் 7:1", "yovan 3 16")
  const parsedRef = parseBibleReference(normQuery);
  if (parsedRef) {
    const refResults: SearchResult[] = [];
    const bookMeta = BOOK_METADATA_LIST[parsedRef.bookIndex];

    if (bookMeta && (!testamentFilter || bookMeta.testament === testamentFilter)) {
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

      if (refResults.length > 0) return refResults;
    }
  }

  // Tier 2: Complete Dataset Search Across Every Verse
  const results: SearchResult[] = [];
  const tokens = lowerQuery.split(/\s+/).filter((t) => t.length > 0);

  for (const v of allVerses) {
    const bookMeta = BOOK_METADATA_LIST[v.book_id - 1];
    if (!bookMeta) continue;
    if (testamentFilter && bookMeta.testament !== testamentFilter) continue;

    const enText = v.text_en.toLowerCase();
    const taText = normalizeString(v.text_ta);

    // Direct Tamil substring match (NFC normalized)
    const directTaMatch = taText.includes(normQuery);
    // Direct English substring match
    const directEnMatch = enText.includes(lowerQuery);

    // Multi-word Token match (all tokens match in English or mapped Tamil)
    const allTokensMatch =
      tokens.length > 1 &&
      tokens.every((tok) => {
        const mapped = TANGLISH_MAP[tok];
        const matchTa = mapped ? taText.includes(mapped) : taText.includes(tok);
        const matchEn = enText.includes(tok);
        return matchTa || matchEn;
      });

    // Single Tanglish word match
    const singleTanglishMatch =
      tokens.length === 1 && TANGLISH_MAP[tokens[0]] && taText.includes(TANGLISH_MAP[tokens[0]]);

    if (directTaMatch || directEnMatch || allTokensMatch || singleTanglishMatch) {
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
    }
  }

  return results;
};
