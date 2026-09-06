import { BibleVerse } from '../types/bible';
import { CuratedVerseRef, DailyVerseHistoryItem } from '../types/studyTypes';
import { getBookMetaById, getVerseByLocation, loadBibleDatasets } from './csvBibleService';
import { getRevivalWordForDate } from './adminService';

const DAILY_VERSE_HISTORY_KEY = 'bible_daily_verse_history_v1';
const TEST_DATE_OVERRIDE_KEY = 'bible_daily_verse_test_date';

// High-impact curated verse reference list across OT and NT
export const CURATED_DAILY_VERSES: CuratedVerseRef[] = [
  { book_id: 43, chapter: 3, verse: 16, category: 'love', prompt_ta: 'இன்று தேவனுடைய ஒப்பற்ற அன்பை தியானியுங்கள்.', prompt_en: 'Meditate on God’s boundless love today.' },
  { book_id: 19, chapter: 23, verse: 1, category: 'faith', prompt_ta: 'இன்று கர்த்தருடைய வழிநடத்துதலை சிந்தித்து அமைதி பெறுங்கள்.', prompt_en: 'Rest in the shepherd’s care and guidance today.' },
  { book_id: 23, chapter: 40, verse: 31, category: 'encouragement', prompt_ta: 'இன்று உங்கள் உள்ளத்தில் புதிய பெலனைப் பெற்றுக்கொள்ளுங்கள்.', prompt_en: 'Renew your strength and hope in the Lord today.' },
  { book_id: 50, chapter: 4, verse: 13, category: 'perseverance', prompt_ta: 'கிறிஸ்துவின் பெலத்தால் எதையும் எதிர்கொள்ள தியானியுங்கள்.', prompt_en: 'Be confident through the strength Christ provides.' },
  { book_id: 24, chapter: 29, verse: 11, category: 'hope', prompt_ta: 'உங்கள் எதிர்காலத்தைக் குறித்து தேவனுக்குள்ள நன்மை தரும் திட்டத்தை நம்புங்கள்.', prompt_en: 'Trust in God’s purposeful thoughts for your future.' },
  { book_id: 20, chapter: 3, verse: 5, category: 'wisdom', prompt_ta: 'உங்கள் சொந்த புத்தியின் மேல் சாயாமல் கர்த்தரில் முழு நம்பிக்கை வையுங்கள்.', prompt_en: 'Trust in the Lord with all your heart today.' },
  { book_id: 40, chapter: 6, verse: 33, category: 'spiritual growth', prompt_ta: 'முதலாவது தேவனுடைய ராஜ்யத்தையும் நீதியையும் நாடுங்கள்.', prompt_en: 'Seek first the kingdom of God and His righteousness.' },
  { book_id: 45, chapter: 8, verse: 28, category: 'faith', prompt_ta: 'தேவனில் அன்புகூருகிறவர்களுக்கு எல்லாம் நன்மைக்கேதுவாக நடக்கும்.', prompt_en: 'Remember that all things work together for good.' },
  { book_id: 6, chapter: 1, verse: 9, category: 'courage', prompt_ta: 'திடன்கொண்டு பலத்திருங்கள்; பயப்படாமலும் கலங்காமலும் இருங்கள்.', prompt_en: 'Be strong and courageous; do not be afraid.' },
  { book_id: 19, chapter: 46, verse: 1, category: 'refuge', prompt_ta: 'தேவன் நமக்கு அடைக்கலமும் பெலனும், ஆபத்துக்காலத்தில் அநுகூலமான துணையுமானவர்.', prompt_en: 'God is our refuge and strength, an ever-present help.' },
  { book_id: 23, chapter: 41, verse: 10, category: 'fear', prompt_ta: 'நீ பயப்படாதே, நான் உன்னுடனே இருக்கிறேன்; திகையாதே, நான் உன் தேவன்.', prompt_en: 'Do not fear, for God is with you and holds your hand.' },
  { book_id: 40, chapter: 11, verse: 28, category: 'peace', prompt_ta: 'வருத்தப்பட்டு பாரஞ்சுமக்கிறவர்களே, நீங்கள் எல்லாரும் என்னிடத்தில் வாருங்கள்.', prompt_en: 'Come to Me all who are weary, and I will give you rest.' },
  { book_id: 14, chapter: 7, verse: 14, category: 'prayer', prompt_ta: 'தாழ்மைப்பட்டு ஜெபம் பண்ணி தேவனுடைய முகத்தைத் தேடுங்கள்.', prompt_en: 'Humble yourself and seek God’s face in earnest prayer.' },
  { book_id: 20, chapter: 16, verse: 3, category: 'obedience', prompt_ta: 'உன் கிரியைகளைக் கர்த்தருக்கு ஒப்புவி, அப்பொழுது உன் யோசனைகள் உறுதிப்படும்.', prompt_en: 'Commit your actions to the Lord and your plans will succeed.' },
  { book_id: 19, chapter: 119, verse: 105, category: 'guidance', prompt_ta: 'உம்முடைய வசனம் என் கால்களுக்கு தீபமும், என் பாதைக்கு வெளிச்சமுமாய் இருக்கிறது.', prompt_en: 'God’s word is a lamp for your feet and a light on your path.' },
  { book_id: 43, chapter: 14, verse: 27, category: 'peace', prompt_ta: 'சமாதானத்தை உங்களுக்கு வைத்துப்போகிறேன்; என் சமாதானத்தையே உங்களுக்குக் கொடுக்கிறேன்.', prompt_en: 'Receive the deep peace that only Christ can give.' },
  { book_id: 48, chapter: 5, verse: 22, category: 'spiritual growth', prompt_ta: 'ஆவியின் கனி: அன்பு, சந்தோஷம், சமாதானம், நீடிய பொறுமை.', prompt_en: 'Reflect on cultivating the fruit of the Holy Spirit.' },
  { book_id: 49, chapter: 2, verse: 8, category: 'grace', prompt_ta: 'கிருபையினாலே விசுவாசத்தைக் கொண்டு இரட்சிக்கப்பட்டீர்கள்.', prompt_en: 'You are saved by grace through faith, a gift from God.' },
  { book_id: 46, chapter: 13, verse: 4, category: 'love', prompt_ta: 'அன்பு நீடிய சாந்தமும் தயவுமுள்ளது; அன்பு பொறாமைப்படாது.', prompt_en: 'Love is patient, love is kind; practice genuine love today.' },
  { book_id: 58, chapter: 11, verse: 1, category: 'faith', prompt_ta: 'விசுவாசமானது நம்பப்படுகிறவைகளின் உறுதியும், காணப்படாதவைகளின் நிச்சயமுமாய் இருக்கிறது.', prompt_en: 'Faith is confidence in what we hope for and assurance of what we do not see.' },
  { book_id: 59, chapter: 1, verse: 5, category: 'wisdom', prompt_ta: 'உங்களில் ஒருவன் ஞானத்தில் குறைவுள்ளவனாயிருந்தால் தேவனிடத்தில் கேட்கக்கடவன்.', prompt_en: 'If you lack wisdom, ask God who gives generously.' },
  { book_id: 60, chapter: 5, verse: 7, category: 'anxiety', prompt_ta: 'அவர் உங்களை விசாரிக்கிறவரானபடியால், உங்கள் கவலைகளையெல்லாம் அவர்மேல் வைத்துவிடுங்கள்.', prompt_en: 'Cast all your anxiety on Him because He cares for you.' },
  { book_id: 62, chapter: 4, verse: 19, category: 'love', prompt_ta: 'அவர் முதலாவது நம்மிடத்தில் அன்புகூர்ந்தபடியால் நாமும் அவரிடத்தில் அன்புகூருகிறோம்.', prompt_en: 'We love because He first loved us.' },
  { book_id: 19, chapter: 27, verse: 1, category: 'courage', prompt_ta: 'கர்த்தர் என் வெளிச்சமும் என் இரட்சிப்புமானவர், யாருக்குப் பயப்படுவேன்?', prompt_en: 'The Lord is my light and salvation—whom shall I fear?' },
  { book_id: 23, chapter: 26, verse: 3, category: 'peace', prompt_ta: 'உம்மை உறுதியாய்ப் பற்றிக்கொண்ட மனதையுடையவன் பூரண சமாதானத்துடன் இருப்பான்.', prompt_en: 'Keep your mind steadfast on God for perfect peace.' },
  { book_id: 40, chapter: 7, verse: 7, category: 'prayer', prompt_ta: 'கேளுங்கள், அப்பொழுது உங்களுக்குக் கொடுக்கப்படும்; தேடுங்கள், அப்பொழுது கண்டடைவீர்கள்.', prompt_en: 'Ask and it will be given to you; seek and you will find.' },
  { book_id: 43, chapter: 15, verse: 5, category: 'spiritual growth', prompt_ta: 'நானே திராட்சச்செடி, நீங்கள் கொடிகள்; என்னில் நிலைத்திருங்கள்.', prompt_en: 'Abide in Christ, for apart from Him you can do nothing.' },
  { book_id: 45, chapter: 12, verse: 2, category: 'transformation', prompt_ta: 'நீங்கள் இந்தப் பிரபஞ்சத்திற்கு ஒத்தவேஷமிடாமல் மனதி புதிதாகிறதினாலே மறுரூபமாகுங்கள்.', prompt_en: 'Be transformed by the renewing of your mind.' },
  { book_id: 47, chapter: 5, verse: 17, category: 'hope', prompt_ta: 'ஒருவன் கிறிஸ்துவுக்குள்ளிருந்தால் புதிய சிருஷ்டியாயிருக்கிறான்.', prompt_en: 'In Christ you are a new creation; old things have passed away.' },
  { book_id: 50, chapter: 4, verse: 6, category: 'anxiety', prompt_ta: 'நீங்கள் ஒன்றுக்குங்கவலைப்படாமல், எல்லாவற்றையுங்குறித்து உங்கள் விண்ணப்பங்களை தேவனுக்குத் தெரியப்படுத்துங்கள்.', prompt_en: 'Do not be anxious about anything, but in everything present your requests to God.' },
  { book_id: 51, chapter: 3, verse: 23, category: 'work', prompt_ta: 'நீங்கள் எதைச் செய்தாலும், அதை மனுஷர்களுக்கென்று செய்யாமல் கர்த்தருக்கென்றே செய்யுங்கள்.', prompt_en: 'Whatever you do, work at it with all your heart as working for the Lord.' },
  { book_id: 55, chapter: 1, verse: 7, category: 'courage', prompt_ta: 'தேவன் நமக்கு பயமுள்ள ஆவியைக் கொடாமல், பலமும் அன்பும் தெளிந்த புத்தியுமுள்ள ஆவியையே கொடுத்திருக்கிறார்.', prompt_en: 'God has not given us a spirit of fear, but of power, love, and self-discipline.' },
  { book_id: 19, chapter: 34, verse: 8, category: 'goodness', prompt_ta: 'கர்த்தர் நல்லவர் என்பதை ருசித்துப்பாருங்கள்; அவர்மேல் நம்பிக்கையாயிருக்கிற மனுஷன் பாக்கியவான்.', prompt_en: 'Taste and see that the Lord is good; blessed is the one who trusts in Him.' },
  { book_id: 20, chapter: 18, verse: 10, category: 'refuge', prompt_ta: 'கர்த்தரின் நாமம் பலத்த துருகம்; நீதிமான் அதற்குள் ஓடிச் சுகமாயிருப்பான்.', prompt_en: 'The name of the Lord is a fortified tower; the righteous run to it and are safe.' },
  { book_id: 40, chapter: 5, verse: 16, category: 'witness', prompt_ta: 'மனுஷர் உங்கள் நற்கிரியைகளைக் கண்டு பிதாவை மகிமைப்படுத்தும்படி, உங்கள் வெளிச்சம் அவர்கள் முன்பாக பிரகாசிக்கக்கடவது.', prompt_en: 'Let your light shine before others so they may glorify God.' },
  { book_id: 43, chapter: 8, verse: 12, category: 'guidance', prompt_ta: 'நான் உலகத்திற்கு வெளிச்சமாயிருக்கிறேன், என்னைப் பின்பற்றுகிறவன் இருளிலே நடவாமிருப்பான்.', prompt_en: 'Jesus is the light of the world; follow Him and never walk in darkness.' },
  { book_id: 45, chapter: 15, verse: 13, category: 'hope', prompt_ta: 'நம்பிக்கையின் தேவன் பரிசுத்த ஆவியின் பலத்தினாலே உங்களுக்கு நம்பிக்கையைப் பெருகப்பண்ணுவாராக.', prompt_en: 'May the God of hope fill you with all joy and peace as you trust in Him.' },
  { book_id: 49, chapter: 4, verse: 32, category: 'forgiveness', prompt_ta: 'ஒருவருக்கொருவர் தயவாயும் உருக்க இரக்கமாயுமிருந்து, கிறிஸ்து உங்களுக்கு மன்னித்ததுபோல நீங்களும் மன்னியுங்கள்.', prompt_en: 'Be kind and compassionate, forgiving one another just as Christ forgave you.' },
  { book_id: 58, chapter: 4, verse: 16, category: 'prayer', prompt_ta: 'இரக்கத்தைப் பெறவும், ஏற்ற சமயத்தில் சகாயஞ்செய்யும் கிருபையை அடையவும், கிருபாசனத்தண்டையிலே தைரியமாய் சேரக்கடவோம்.', prompt_en: 'Approach God’s throne of grace with confidence to receive mercy.' },
  { book_id: 19, chapter: 91, verse: 1, category: 'protection', prompt_ta: 'உன்னதமானவரின் மறைவிலிருக்கிறவன் சர்வவல்லவருடைய நிழலில் தங்குவான்.', prompt_en: 'Whoever dwells in the shelter of the Most High will rest in His shadow.' },
  { book_id: 19, chapter: 103, verse: 2, category: 'gratitude', prompt_ta: 'என் ஆத்துமாவே, கர்த்தரை ஸ்தோத்தரி; அவர் செய்த சகல உபகாரங்களையும் மறவாதே.', prompt_en: 'Bless the Lord, O my soul, and forget not all His benefits.' },
  { book_id: 20, chapter: 4, verse: 23, category: 'wisdom', prompt_ta: 'எல்லாக் காவலோடும் உன் இருதயத்தைக் காத்துக்கொள், அதினின்றும் ஜீவஊற்று புறப்படும்.', prompt_en: 'Above all else, guard your heart, for everything you do flows from it.' },
  { book_id: 23, chapter: 43, verse: 2, category: 'comfort', prompt_ta: 'நீ தண்ணீர்களைக் கடக்கும்போது நான் உன்னோடு இருப்பேன்; நதிகள் உன்மேல் புரளுவதில்லை.', prompt_en: 'When you pass through the waters, God will be with you.' },
  { book_id: 25, chapter: 3, verse: 22, category: 'mercy', prompt_ta: 'நாம் நிர்மூலமாகாதிருக்கிறது கர்த்தருடைய கிருபையே, அவருடைய இரக்கங்களுக்கு முடிவில்லை.', prompt_en: 'The Lord’s mercies are new every morning; great is His faithfulness.' },
  { book_id: 40, chapter: 6, verse: 14, category: 'forgiveness', prompt_ta: 'மனுஷருடைய தப்புகளை நீங்கள் அவர்களுக்கு மன்னித்தால், உங்கள் பரமபிதா உங்களுக்கும் மன்னிப்பார்.', prompt_en: 'If you forgive others their trespasses, your heavenly Father will forgive you.' },
  { book_id: 42, chapter: 6, verse: 31, category: 'relationships', prompt_ta: 'மனுஷர் உங்களுக்கு எப்படி செய்யவேண்டுமென்று விரும்புகிறீர்களோ, அப்படியே நீங்களும் அவர்களுக்குச் செய்யுங்கள்.', prompt_en: 'Do to others as you would have them do to you.' },
  { book_id: 43, chapter: 10, verse: 10, category: 'abundance', prompt_ta: 'நானோ அவைகளுக்கு ஜீவன் உண்டாயிருக்கவும், அது பரிபூரணப்படவும் வந்தேன்.', prompt_en: 'Christ came that you may have life, and have it to the full.' },
  { book_id: 44, chapter: 1, verse: 8, category: 'power', prompt_ta: 'பரிசுத்த ஆவி உங்களிடத்தில் வரும்போது நீங்கள் பெலனடைந்து எனக்கு சாட்சிகளாயிருப்பீர்கள்.', prompt_en: 'You will receive power when the Holy Spirit comes on you.' },
  { book_id: 45, chapter: 8, verse: 31, category: 'courage', prompt_ta: 'தேவன் நம்முடைய பட்சத்திலிருந்தால் நமக்கு விரோதமாயிருப்பவன் யார்?', prompt_en: 'If God is for us, who can be against us?' },
  { book_id: 46, chapter: 16, verse: 14, category: 'love', prompt_ta: 'உங்கள் கிரியைகளெல்லாம் அன்போடே செய்யப்படக்கடவது.', prompt_en: 'Do everything in love.' },
  { book_id: 47, chapter: 12, verse: 9, category: 'grace', prompt_ta: 'என் கிருபை உனக்குப்போதும்; பலவீனத்திலே என் பலம் பூரணமாய் விளங்கும்.', prompt_en: 'My grace is sufficient for you, for My power is made perfect in weakness.' },
  { book_id: 48, chapter: 6, verse: 9, category: 'perseverance', prompt_ta: 'நன்மைசெய்கிறதில் சோர்ந்துபோகாமல் இருப்போமாக; நாம் தளர்ந்துபோகாதிருந்தால் ஏற்றகாலத்தில் அறுப்போம்.', prompt_en: 'Let us not become weary in doing good, for at the proper time we will reap.' },
  { book_id: 49, chapter: 6, verse: 10, category: 'spiritual warfare', prompt_ta: 'கர்த்தரிலும் அவருடைய வல்லமையின் மகாத்துவத்திலும் பலப்படுங்கள்.', prompt_en: 'Be strong in the Lord and in His mighty power.' },
  { book_id: 50, chapter: 2, verse: 3, category: 'humility', prompt_ta: 'ஒன்றையும் வாதினாலாவது வீண் பெருமையினாலாவது செய்யாமல், மனத்தாழ்மையினாலே மற்றவர்களைத் தங்களிலும் மேன்மையானவர்களாக எண்ணக்கடவீர்கள்.', prompt_en: 'In humility value others above yourselves.' },
  { book_id: 51, chapter: 3, verse: 12, category: 'character', prompt_ta: 'உருக்கமான இரக்கத்தையும், தயவையும், மனத்தாழ்மையையும், சாந்தத்தையும், நீடிய பொறுமையையும் தரித்துக்கொள்ளுங்கள்.', prompt_en: 'Clothe yourselves with compassion, kindness, humility, gentleness and patience.' },
  { book_id: 52, chapter: 5, verse: 16, category: 'joy', prompt_ta: 'எப்பொழுதும் சந்தோஷமாயிருங்கள். இடைவிடாமல் ஜெபம் பண்ணுங்கள். எல்லாவற்றிலேயும் ஸ்தோத்திரஞ்செய்யுங்கள்.', prompt_en: 'Rejoice always, pray continually, give thanks in all circumstances.' },
  { book_id: 54, chapter: 6, verse: 12, category: 'faith', prompt_ta: 'விசுவாசத்தின் நல்ல போராட்டத்தைப்போராடு, நித்திய ஜீவனைப் பற்றிக்கொள்.', prompt_en: 'Fight the good fight of faith; take hold of eternal life.' },
  { book_id: 58, chapter: 12, verse: 2, category: 'focus', prompt_ta: 'விசுவாசத்தைத் துவக்குகிறவரும் முடிக்கிறவருமாயிருக்கிற இயேசுவை நோக்கி, நமக்கு நியமித்திருக்கிற ஓட்டத்தில் பொறுமையோடே ஓடக்கடவோம்.', prompt_en: 'Fix your eyes on Jesus, the pioneer and perfecter of faith.' },
  { book_id: 59, chapter: 4, verse: 8, category: 'prayer', prompt_ta: 'தேவனிடத்தில் சேருங்கள், அப்பொழுது அவர் உங்களிடத்தில் சேருவார்.', prompt_en: 'Draw near to God and He will draw near to you.' },
  { book_id: 60, chapter: 2, verse: 9, category: 'identity', prompt_ta: 'நீங்களோ தெரிந்துகொள்ளப்பட்ட சந்ததியாயும், ராஜரீகமான ஆசாரியக்கூட்டமாயும், பரிசுத்த ஜாதியாயும் இருக்கிறீர்கள்.', prompt_en: 'You are a chosen people, a royal priesthood, a holy nation.' },
  { book_id: 66, chapter: 3, verse: 20, category: 'relationship', prompt_ta: 'இதோ, வாசற்படியிலே நின்று தட்டுகிறேன்; ஒருவன் என் சத்தத்தைக் கேட்டு, கதவைத் திறந்தால், அவனிடத்தில் நான் பிரவேசிப்பேன்.', prompt_en: 'Here I am! I stand at the door and knock. If anyone hears My voice and opens the door, I will come in.' }
];

// Simple String Hash (DJB2) for deterministic seeding based on date string
const hashString = (str: string): number => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
};

// Format Date object to YYYY-MM-DD
export const formatDateKey = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Get current date string, considering test overrides
export const getActiveDateString = (): string => {
  try {
    const override = localStorage.getItem(TEST_DATE_OVERRIDE_KEY);
    if (override && /^\d{4}-\d{2}-\d{2}$/.test(override)) {
      return override;
    }
  } catch {
    // Ignore localStorage errors
  }
  return formatDateKey(new Date());
};

// Set test date override
export const setDailyVerseDateOverride = (dateStr: string | null): void => {
  try {
    if (dateStr) {
      localStorage.setItem(TEST_DATE_OVERRIDE_KEY, dateStr);
    } else {
      localStorage.removeItem(TEST_DATE_OVERRIDE_KEY);
    }
  } catch (err) {
    console.error('Error setting test date override:', err);
  }
};

// Deterministically pick the curated verse reference for a given date string
export const getCuratedVerseForDate = (dateStr: string): CuratedVerseRef => {
  const seed = hashString(dateStr);
  const index = seed % CURATED_DAILY_VERSES.length;
  return CURATED_DAILY_VERSES[index];
};

export const getTodayVerseRef = (): { book_id: number; chapter: number; verse: number } => {
  const dateStr = getActiveDateString();
  const curated = getCuratedVerseForDate(dateStr);
  return { book_id: curated.book_id, chapter: curated.chapter, verse: curated.verse };
};

export interface LoadedDailyVerse {
  date: string;
  verse: BibleVerse;
  book_name_ta: string;
  book_name_en: string;
  prompt_ta: string;
  prompt_en: string;
  category: string;
}

// Fetch the full daily verse from CSV datasets deterministically (with admin override support)
export const getDailyVerse = async (customDateStr?: string): Promise<LoadedDailyVerse | null> => {
  await loadBibleDatasets();
  const dateStr = customDateStr || getActiveDateString();
  const adminOverride = getRevivalWordForDate(dateStr);
  const curated = getCuratedVerseForDate(dateStr);

  const bookId = adminOverride ? adminOverride.book_id : curated.book_id;
  const chapter = adminOverride ? adminOverride.chapter : curated.chapter;
  const verse = adminOverride ? adminOverride.verse : curated.verse;
  const promptTa = adminOverride ? adminOverride.prompt_ta : curated.prompt_ta;
  const promptEn = adminOverride ? adminOverride.prompt_en : curated.prompt_en;
  const category = adminOverride ? adminOverride.category : curated.category;

  const verseObj = getVerseByLocation(bookId, chapter, verse);
  if (!verseObj) return null;

  const bookMeta = getBookMetaById(bookId);

  const loaded: LoadedDailyVerse = {
    date: dateStr,
    verse: verseObj,
    book_name_ta: bookMeta ? bookMeta.name_ta : '',
    book_name_en: bookMeta ? bookMeta.name_en : '',
    prompt_ta: promptTa,
    prompt_en: promptEn,
    category: category
  };

  recordDailyVerseHistory(loaded);
  return loaded;
};

// Local storage history operations
export const getDailyVerseHistory = (): DailyVerseHistoryItem[] => {
  try {
    const raw = localStorage.getItem(DAILY_VERSE_HISTORY_KEY);
    if (raw) {
      return JSON.parse(raw) as DailyVerseHistoryItem[];
    }
  } catch (err) {
    console.error('Error reading daily verse history:', err);
  }
  return [];
};

export const recordDailyVerseHistory = (item: LoadedDailyVerse): void => {
  try {
    const currentHistory = getDailyVerseHistory();
    const existingIndex = currentHistory.findIndex((h) => h.date === item.date);

    const historyRecord: DailyVerseHistoryItem = {
      date: item.date,
      book_id: item.verse.book_id,
      chapter: item.verse.chapter,
      verse: item.verse.verse,
      book_name_ta: item.book_name_ta,
      book_name_en: item.book_name_en,
      text_ta: item.verse.text_ta,
      text_en: item.verse.text_en,
      viewed_at: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      currentHistory[existingIndex] = historyRecord;
    } else {
      currentHistory.unshift(historyRecord);
    }

    // Keep up to 60 days of history
    const trimmed = currentHistory.slice(0, 60);
    localStorage.setItem(DAILY_VERSE_HISTORY_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('Error saving daily verse history:', err);
  }
};
