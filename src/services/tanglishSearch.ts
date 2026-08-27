import { SearchResult, Language, Testament } from '../types/bible';
import { getAllLoadedVerses, getBibleWordsForPrefix, BOOK_METADATA_LIST } from './csvBibleService';

// Comprehensive Phonetic Transliteration & Typo-Tolerance Dictionary (Tanglish -> Tamil)
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

  // Expanded Bible Book Phonetic & Prefix Map (e.g., aathiyahamam, aathi, aadhi, aa -> ஆதியாகமம்)
  aathiyahamam: 'ஆதியாகமம்',
  aathiyagamam: 'ஆதியாகமம்',
  aathigamam: 'ஆதியாகமம்',
  aathiyakamam: 'ஆதியாகமம்',
  aathi: 'ஆதியாகமம்',
  aadhi: 'ஆதியாகமம்',
  aadhiyagamam: 'ஆதியாகமம்',
  aa: 'ஆதியாகமம்',
  gen: 'ஆதியாகமம்',
  genesis: 'ஆதியாகமம்',

  yaathiraagamam: 'யாத்திராகமம்',
  yaathiragamam: 'யாத்திராகமம்',
  yathiragamam: 'யாத்திராகமம்',
  yaathri: 'யாத்திராகமம்',
  yathri: 'யாத்திராகமம்',
  yaat: 'யாத்திராகமம்',
  ex: 'யாத்திராகமம்',
  exodus: 'யாத்திராகமம்',

  leviyaraagmam: 'லேவியராகமம்',
  leviyaragamam: 'லேவியராகமம்',
  levi: 'லேவியராகமம்',
  lev: 'லேவியராகமம்',
  leviticus: 'லேவியராகமம்',

  ennagamam: 'எண்ணாகமம்',
  ennagmam: 'எண்ணாகமம்',
  enni: 'எண்ணாகமம்',
  num: 'எண்ணாகமம்',
  numbers: 'எண்ணாகமம்',

  ubaagamam: 'உபாகமம்',
  ubagamam: 'உபாகமம்',
  ubaa: 'உபாகமம்',
  deut: 'உபாகமம்',
  deuteronomy: 'உபாகமம்',

  yosuva: 'யோசுவா',
  yoshuva: 'யோசுவா',
  joshua: 'யோசுவா',

  niyayathipathigal: 'நியாயாதிபதிகள்',
  niyaya: 'நியாயாதிபதிகள்',
  judges: 'நியாயாதிபதிகள்',

  rooth: 'ரூத்',
  ruth: 'ரூத்',

  samuel: 'சாமுவேல்',
  samuvel: 'சாமுவேல்',
  samvel: 'சாமுவேல்',
  sam: 'சாமுவேல்',

  rajakkal: 'இராஜாக்கள்',
  raajakkal: 'இராஜாக்கள்',
  kings: 'இராஜாக்கள்',

  naalagamam: 'நாளாகமம்',
  naala: 'நாளாகமம்',
  chronicles: 'நாளாகமம்',

  esra: 'எஸ்றா',
  ezra: 'எஸ்றா',
  negamiya: 'நெகேமியா',
  nehemiah: 'நெகேமியா',
  esther: 'எஸ்தர்',
  yobu: 'யோபு',
  job: 'யோபு',

  sangitham: 'சங்கீதம்',
  sangeetham: 'சங்கீதம்',
  sangi: 'சங்கீதம்',
  psalms: 'சங்கீதம்',
  psalm: 'சங்கீதம்',
  ps: 'சங்கீதம்',

  neethimozhikal: 'நீதிமொழிகள்',
  neethimozhi: 'நீதிமொழிகள்',
  proverbs: 'நீதிமொழிகள்',

  pirasanggi: 'பிரசங்கி',
  pirasangi: 'பிரசங்கி',
  ecclesiastes: 'பிரசங்கி',
  unnathapattu: 'உன்னதப்பாட்டு',
  esaya: 'ஏசாயா',
  isaiah: 'ஏசாயா',
  eremiya: 'எரேமியா',
  jeremiah: 'எரேமியா',
  pulambal: 'புலம்பல்',
  lamentations: 'புலம்பல்',
  esekiyel: 'எசேக்கியேல்',
  ezekiel: 'எசேக்கியேல்',
  dhaniyel: 'தானியேல்',
  daniel: 'தானியேல்',

  maththeyu: 'மத்தேயு',
  mattheyu: 'மத்தேயு',
  mathew: 'மத்தேயு',
  matthew: 'மத்தேயு',
  matt: 'மத்தேயு',

  marku: 'மாற்கு',
  mark: 'மாற்கு',
  lookka: 'லூக்கா',
  lukka: 'லூக்கா',
  luke: 'லூக்கா',

  yovan: 'யோவான்',
  yohvan: 'யோவான்',
  yohaan: 'யோவான்',
  john: 'யோவான்',

  apposthalar: 'அப்போஸ்தலர்',
  acts: 'அப்போஸ்தலர்',
  romar: 'ரோமர்',
  romans: 'ரோமர்',
  rom: 'ரோமர்',

  korinthiyar: 'கொரிந்தியர்',
  corinthians: 'கொரிந்தியர்',
  galathiyar: 'கலாத்தியர்',
  galatians: 'கலாத்தியர்',
  ephesiyar: 'எபேசியர்',
  ephesians: 'எபேசியர்',
  filippiayar: 'பிலிப்பியர்',
  philippians: 'பிலிப்பியர்',
  koloseyar: 'கொலோசெயர்',
  colossians: 'கொலோசெயர்',
  thesalonikeyar: 'தெசலோனிக்கேயர்',
  thessalonians: 'தெசலோனிக்கேயர்',
  themathayu: 'தீமோத்தேயு',
  timothy: 'தீமோத்தேயு',
  theethu: 'தீத்து',
  titus: 'தீத்து',
  pilemon: 'பிலேமோன்',
  philemon: 'பிலேமோன்',
  hebreyar: 'எபிரெயர்',
  hebrews: 'எபிரெயர்',
  yacobu: 'யாக்கோபு',
  james: 'யாக்கோபு',
  pedhuru: 'பேதுரு',
  peter: 'பேதுரு',
  yutha: 'யூதா',
  utha: 'யூதா',
  yuta: 'யூதா',
  uda: 'யூதா',
  jude: 'யூதா',
  velippaduthina: 'வெளிப்படுத்தின',
  revelation: 'வெளிப்படுத்தின',
  rev: 'வெளிப்படுத்தின'
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

// Unicode-aware Reference Parser with Fuzzy Tanglish & Prefix Support
export const parseBibleReference = (query: string): ParsedReference | null => {
  const normalized = normalizeString(query).toLowerCase();

  // Match pattern: optional book number (1-3) + book title (English, Tamil, or Tanglish) + chapter + optional verse
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
      (mappedTanglish && (nameTa.includes(mappedTanglish) || nameEn.includes(rawBook))) ||
      // Prefix matching for short Tanglish terms like "aathi", "aadhi", "aa" -> Genesis
      (mappedTanglish && (nameTa.startsWith(mappedTanglish) || mappedTanglish.startsWith(nameTa)))
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
 * Generates live Bible word suggestions for auto-complete using pre-indexed dictionary.
 */
export const getBibleWordSuggestions = (prefix: string, limit: number = 12): string[] => {
  const norm = normalizeString(prefix);
  if (!norm || norm.length < 1) return [];

  const lowerPrefix = norm.toLowerCase();
  const candidates = getBibleWordsForPrefix(lowerPrefix[0]);

  const startsMatches: string[] = [];
  const includesMatches: string[] = [];

  for (const item of candidates) {
    if (item.word.startsWith(norm) || item.lower.startsWith(lowerPrefix)) {
      startsMatches.push(item.word);
      if (startsMatches.length >= limit) break;
    } else if (item.word.includes(norm) || item.lower.includes(lowerPrefix)) {
      includesMatches.push(item.word);
    }
  }

  const combined = [...startsMatches, ...includesMatches];
  return Array.from(new Set(combined)).slice(0, limit);
};

/**
 * Executes multi-tier search across the ENTIRE Bible dataset.
 */
export const executeTanglishSearch = (
  query: string,
  _language: Language = 'en',
  testamentFilter?: Testament,
  fromBookId?: number,
  toBookId?: number
): SearchResult[] => {
  const normQuery = normalizeString(query);
  if (!normQuery || normQuery.length < 1) return [];

  const allVerses = getAllLoadedVerses();
  const lowerQuery = normQuery.toLowerCase();

  // Tier 1: Reference Match ("John 3:16", "1 Samuel 7:1", "1 சாமுவேல் 7:1", "yovan 3 16", "aathi 1 1", "aathiyahamam 1:1")
  const parsedRef = parseBibleReference(normQuery);
  if (parsedRef) {
    const refResults: SearchResult[] = [];
    const bookMeta = BOOK_METADATA_LIST[parsedRef.bookIndex];

    if (
      bookMeta &&
      (!testamentFilter || bookMeta.testament === testamentFilter) &&
      (!fromBookId || bookMeta.id >= fromBookId) &&
      (!toBookId || bookMeta.id <= toBookId)
    ) {
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
  const tokenMapInfo = tokens.map((tok) => ({
    tok,
    mapped: TANGLISH_MAP[tok] || null
  }));

  const singleTanglishMapped = tokens.length === 1 ? TANGLISH_MAP[tokens[0]] || null : null;

  for (const v of allVerses) {
    const bookMeta = BOOK_METADATA_LIST[v.book_id - 1];
    if (!bookMeta) continue;
    if (testamentFilter && bookMeta.testament !== testamentFilter) continue;
    if (fromBookId && v.book_id < fromBookId) continue;
    if (toBookId && v.book_id > toBookId) continue;

    const enText = v.lower_en || v.text_en.toLowerCase();
    const taText = v.norm_ta || normalizeString(v.text_ta);

    // Direct Tamil substring match (NFC normalized)
    const directTaMatch = taText.includes(normQuery);
    // Direct English substring match
    const directEnMatch = enText.includes(lowerQuery);

    // Multi-word Token match (all tokens match in English or mapped Tamil)
    const allTokensMatch =
      tokens.length > 1 &&
      tokenMapInfo.every(({ tok, mapped }) => {
        const matchTa = mapped ? taText.includes(mapped) : taText.includes(tok);
        const matchEn = enText.includes(tok);
        return matchTa || matchEn;
      });

    // Single Tanglish word match
    const singleTanglishMatch = singleTanglishMapped !== null && taText.includes(singleTanglishMapped);

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
