import { BibleVerse } from '../types/bible';
import {
  ChapterSection,
  ChapterStudy,
  CharacterProfile,
  VersePerspective,
  VerseStudy
} from '../types/studyTypes';
import {
  getBookMetaById,
  getChapterVerses,
  getVerseByLocation,
  loadBibleDatasets
} from './csvBibleService';
import { getCustomMeditationForVerse } from './adminService';

const VERSE_STUDY_CACHE_KEY_PREFIX = 'bible_verse_study_cache_';
const CHAPTER_STUDY_CACHE_KEY_PREFIX = 'bible_chapter_study_cache_';

// ----------------------------------------------------------------------
// VERSE STUDY GENERATOR & SERVICE
// ----------------------------------------------------------------------

export const generateVerseStudyContent = (
  verse: BibleVerse,
  bookNameTa: string,
  bookNameEn: string,
  surroundingVerses: BibleVerse[]
): VerseStudy => {
  const refTa = `${bookNameTa} ${verse.chapter}:${verse.verse}`;
  const refEn = `${bookNameEn} ${verse.chapter}:${verse.verse}`;

  // Surrounding context summary from CSV
  const prevVerse = surroundingVerses.find((v) => v.verse === verse.verse - 1);
  const nextVerse = surroundingVerses.find((v) => v.verse === verse.verse + 1);

  const prevTextTa = prevVerse ? `முந்தைய வசனம் (${prevVerse.verse}): "${prevVerse.text_ta}"` : '';
  const nextTextTa = nextVerse ? `அடுத்த வசனம் (${nextVerse.verse}): "${nextVerse.text_ta}"` : '';

  const prevTextEn = prevVerse ? `Preceding verse (${prevVerse.verse}): "${prevVerse.text_en}"` : '';
  const nextTextEn = nextVerse ? `Following verse (${nextVerse.verse}): "${nextVerse.text_en}"` : '';

  const surroundingSummaryTa = [prevTextTa, nextTextTa].filter(Boolean).join('\n');
  const surroundingSummaryEn = [prevTextEn, nextTextEn].filter(Boolean).join('\n');

  // Perspectives breakdown
  const perspectives: VersePerspective[] = [
    {
      id: 'average',
      title_ta: 'சாதாரண மனித பார்வை',
      title_en: 'Average Person Perspective',
      badge_ta: 'சாதாரண பார்வை',
      badge_en: 'General View',
      description_ta: `ஒரு சாதாரண வாசகர் ${refTa} வசனத்தைப் படிக்கும்போது, இதை ஒரு நல்ல அறிவுரையாகவோ அல்லது தேவனின் வார்த்தையாகவோ பார்க்கக்கூடும்.`,
      description_en: `An average reader encountering ${refEn} sees a comforting biblical promise or foundational instruction.`
    },
    {
      id: 'selfish',
      title_ta: 'சுயநல பார்வை (தவறான புரிதல்)',
      title_en: 'Self-Centered Misinterpretation',
      badge_ta: 'எச்சரிக்கை',
      badge_en: 'Misconception Warning',
      description_ta: 'இந்த வசனத்தை சொந்த சுயநல ஆசைகளுக்காகவோ அல்லது எவ்வித கீழ்ப்படிதலும் இன்றி நன்மைகளை மட்டும் பெற பயன்படும் வாக்குத்தத்தமாக தவறாகப் புரிந்துகொள்ளும் அபாயம் உள்ளது.',
      description_en: 'Taking this verse isolated from context to claim personal benefits without personal repentance or commitment.'
    },
    {
      id: 'world',
      title_ta: 'உலக பார்வை (நவீன சமூகம்)',
      title_en: 'Modern Society / Worldview',
      badge_ta: 'சமூக பார்வை',
      badge_en: 'Societal View',
      description_ta: 'நவீன உலகம் இந்த போதனையை நடைமுறைக்கு சாத்தியமற்றதாகவோ அல்லது தனிநபர் சுதந்திரத்திற்கு சவாலாகவோ பார்க்கக்கூடும்.',
      description_en: 'Modern culture may view this spiritual principle through the lens of self-reliance or skepticism.'
    },
    {
      id: 'faith',
      title_ta: 'விசுவாச பார்வை',
      title_en: 'Perspective of Faith',
      badge_ta: 'விசுவாசம்',
      badge_en: 'Faith View',
      description_ta: 'தேவனின் வாக்குத்தத்தங்கள் மாறாதவை என்றும், அவருடைய இரக்கமும் வல்லமையும் நம் வாழ்க்கையை மாற்றவல்லது என்றும் முழு மனதோடு நம்புவது.',
      description_en: 'Believing wholeheartedly that God is faithful and His promises stand secure regardless of outward circumstances.'
    },
    {
      id: 'meditative',
      title_ta: 'தியான பார்வை',
      title_en: 'Meditative Perspective',
      badge_ta: 'தியானம்',
      badge_en: 'Deep Reflection',
      description_ta: 'வசனத்தில் உள்ள ஒவ்வொரு வார்த்தையையும் ஆழமாக சிந்தித்து, தேவனுடைய உள்ளத்தின் விருப்பத்தையும் அன்பையும் உணர்தல்.',
      description_en: 'Contemplating every word carefully, letting the truth sink into the core of one’s spirit.'
    },
    {
      id: 'practical',
      title_ta: 'நடைமுறை பார்வை',
      title_en: 'Practical Application Perspective',
      badge_ta: 'செயல் வடிவம்',
      badge_en: 'Action View',
      description_ta: 'இந்த வசனத்தின் போதனையை இன்றே நம் குடும்பம், வேலை மற்றும் அன்றாட தொடர்புகளில் நடைமுறைப்படுத்துவது.',
      description_en: 'Translating this divine insight into concrete, actionable steps in daily interactions and decision making.'
    },
    {
      id: 'spiritual',
      title_ta: 'ஆழமான ஆன்மீக பார்வை',
      title_en: 'Deep Spiritual Perspective',
      badge_ta: 'ஆன்மீகம்',
      badge_en: 'Spiritual Depth',
      description_ta: 'இயேசு கிறிஸ்துவின் மீட்பின் திட்டம் மற்றும் நித்திய ஜீவனின் ஒளியில் இந்த வசனத்தின் தெய்வீக நோக்கம்.',
      description_en: 'Viewing the passage through Christ’s redemptive work, grace, and eternal spiritual significance.'
    }
  ];

  return {
    book_id: verse.book_id,
    chapter: verse.chapter,
    verse: verse.verse,
    book_name_ta: bookNameTa,
    book_name_en: bookNameEn,
    text_ta: verse.text_ta,
    text_en: verse.text_en,

    // 2. எளிய விளக்கம்
    simple_explanation_ta: `${refTa} வசனம் நமக்குத் தருவது தேவனுடைய மாறாத சத்தியமும் வழிகாட்டுதலுமாகும். இந்த வசனத்தின் முக்கியமான செய்தி: தேவனைச் சார்ந்து வாழும்போது நமது ஆன்மீக வாழ்க்கையும் சிந்தனையும் சீரடைகிறது.`,
    simple_explanation_en: `${refEn} offers timeless guidance and divine truth. At its core, it encourages believers to lean on God’s grace and align their hearts with His eternal purpose.`,
    key_takeaway_ta: 'தேவனின் அன்பிலும் சத்தியத்திலும் நிலைத்திருப்பது வாழ்க்கைக்கு உறுதியான அஸ்திபாரமாகும்.',
    key_takeaway_en: 'Abiding in God’s truth and love provides an unshakable foundation for daily life.',

    // 3. ஆழமான அர்த்தம்
    deep_meaning_ta: `இந்த வசனத்தில் குறிப்பிடப்பட்டுள்ள முக்கிய கருத்துக்கள் தேவனுடைய பரிசுத்தம், விசுவாசம் மற்றும் கீழ்ப்படிதலை வலியுறுத்துகின்றன. இது வெறும் வார்த்தைகள் அல்ல, மாறாக நமது இருதயத்தின் சிந்தனைகளையும் செயல்களையும் மாற்றியமைக்கும் தேவ வல்லமையாகும்.`,
    deep_meaning_en: `This passage emphasizes God’s sovereignty, absolute faithfulness, and our daily call to trust Him. It calls for an inner heart transformation rather than superficial religious formality.`,
    key_terms_ta: [
      { term: 'விசுவாசம் / விசுவாசித்தல்', meaning: 'தேவனுடைய வார்த்தையின் மீது உறுதியான நம்பிக்கை வைத்து முழுவதுமாக அவரைச் சார்ந்திருத்தல்.' },
      { term: 'தேவனின் கிருபை', meaning: 'நாம் தகுதியில்லாதபோதிலும் நமக்குக் கொடுக்கப்படும் தேவனுடைய அளவற்ற அன்பு.' },
      { term: 'நித்திய ஜீவன் / அமைதி', meaning: 'தேவனோடு உலக எல்லைகளைத் தாண்டி இருக்கும் ஆவியின் சமாதானமும் உறவும்.' }
    ],
    key_terms_en: [
      { term: 'Faith / Trust', meaning: 'Complete reliance on God’s promises and character regardless of physical evidence.' },
      { term: 'Grace', meaning: 'Unmerited divine favor and strength extended to us freely by God.' },
      { term: 'Eternal Peace / Life', meaning: 'Unbroken fellowship with God, extending from now into eternity.' }
    ],
    what_it_emphasizes_ta: 'தேவனுக்கும் நமக்குமான தனிப்பட்ட உறவு, இருதயத்தின் தூய்மை, மற்றும் தினசரி கீழ்ப்படிதல்.',
    what_it_emphasizes_en: 'Personal relationship with God, purity of motives, and daily walk of obedience.',
    what_it_does_not_mean_ta: 'வாழ்க்கையில் கஷ்டங்களே வராது என்றோ அல்லது முயற்சி செய்யாமல் எல்லாம் தானாக நடக்கும் என்றோ இது பொருள்படாது.',
    what_it_does_not_mean_en: 'It does not promise an exemption from earthly trials, nor does it replace personal responsibility.',

    // 4. சூழ்நிலை (Context)
    context_speaker_ta: `${bookNameTa} புத்தகத்தின் ${verse.chapter}-ஆம் அதிகாரத்தின் வரலாற்றுச் பின்னணியில் பேசப்பட்ட வசனம்.`,
    context_speaker_en: `Spoken within the narrative context of ${bookNameEn} chapter ${verse.chapter}.`,
    context_audience_ta: 'அக்கால தேவ ஜனங்களுக்கும், உண்மையைத் தேடும் ஒவ்வொரு வாசகருக்கும்.',
    context_audience_en: 'Addressed to seekers of truth and the community of faith.',
    context_situation_ta: 'வாழ்க்கையின் சவால்கள், நம்பிக்கையின்மை அல்லது ஆன்மீகத் தேவைகள் இருந்த சூழ்நிலையில் அளிக்கப்பட்ட செய்தி.',
    context_situation_en: 'Given during a defining moment of spiritual instruction, confronting doubt, fear, or spiritual apathy.',
    surrounding_verses_summary_ta: surroundingSummaryTa || 'இந்த வசனம் அதிகாரத்தின் மையக் கருத்தை வெளிப்படுத்தும் பகுதியில் அமைந்துள்ளது.',
    surrounding_verses_summary_en: surroundingSummaryEn || 'Positioned within the central climax of the chapter’s theme.',

    // 5. நிஜ வாழ்க்கையில் (Real-world Scenarios)
    real_world_scenarios_ta: [
      {
        scenario_title: 'வேலை மற்றும் தொழில் அழுத்தம் (Workplace & Career Pressure)',
        example: 'அலுவலகத்தில் கடினமான சூழ்நிலை அல்லது எதிர்காலம் பற்றிய பயம் வரும்போது, இந்த வசனம் தேவனுடைய கட்டுப்பாட்டையும் சமாதானத்தையும் நினைவூட்டுகிறது.'
      },
      {
        scenario_title: 'குடும்ப உறவுகள் மற்றும் சவால்கள் (Family & Relationships)',
        example: 'குடும்பத்தில் கருத்து வேறுபாடு அல்லது மன்னிக்க வேண்டிய கட்டாயம் ஏற்படும்போது, தேவனுடைய அன்பின் வழியில் பொறுமையைக் கடைப்பிடிக்க உதவுகிறது.'
      },
      {
        scenario_title: 'கல்லூரி மற்றும் மாணவர்கள் (College & Young Adult Life)',
        example: 'சமூக அழுத்தம் மற்றும் எதிர்கால முடிவுகள் எடுக்கும் தருணத்தில், தேவனுடைய வழிகாட்டுதலைத் தேட தூண்டுகிறது.'
      }
    ],
    real_world_scenarios_en: [
      {
        scenario_title: 'Workplace & Financial Stress',
        example: 'When faced with job insecurity or heavy workloads, this verse reminds us to anchor our security in God rather than temporary circumstances.'
      },
      {
        scenario_title: 'Family & Relational Conflicts',
        example: 'In moments of tension with loved ones, this truth prompts patience, forgiveness, and selfless love.'
      },
      {
        scenario_title: 'Students & Young Adults',
        example: 'Amid peer pressure and decision-making crossroads, it provides clear moral and spiritual orientation.'
      }
    ],

    // 6. Multiple Perspectives
    perspectives,

    // 7. நான் இதிலிருந்து என்ன கற்றுக்கொள்ளலாம்?
    learnings_ta: {
      what_to_understand: 'தேவன் எனது வாழ்க்கையின் ஒவ்வொரு சூழ்நிலையையும் அறிவார் மற்றும் அவர் உண்மையுள்ளவர்.',
      what_to_change: 'என் சொந்த சுய பலத்தை மட்டும் நம்பும் பழக்கத்தை மாற்றி, தேவனிடம் ஜெபத்தில் ஒப்புக்கொடுக்க வேண்டும்.',
      attitude_to_build: 'பயத்திற்குப் பதிலாக விசுவாசத்தையும், முணுமுணுப்பிற்குப் பதிலாக நன்றியுள்ள இருதயத்தையும் வளர்த்துக் கொள்ள வேண்டும்.',
      today_practice: 'இன்று சந்திக்கும் நபர்களிடம் தேவ அன்பையும் சாந்தத்தையும் வெளிப்படுத்துவது.'
    },
    learnings_en: {
      what_to_understand: 'God knows every detail of my life and His promises are trustworthy.',
      what_to_change: 'Replace self-reliant anxiety with active prayer and surrender.',
      attitude_to_build: 'Cultivate a heart of gratitude and quiet trust instead of complaints.',
      today_practice: 'Practice intentional kindness and patience with someone challenging today.'
    },

    // 8. Self-Reflection Questions
    reflection_questions_ta: [
      `இந்த வசனம் (${refTa}) எனது தற்போதைய வாழ்க்கையின் எந்தப் பகுதிக்கு மிகவும் தேவைப்படுகிறது?`,
      'நான் தேவனை முழுமையாக நம்புகிறேனா அல்லது சில விஷயங்களை நானே கட்டுப்படுத்த முயற்சிக்கிறேனா?',
      'இந்த வசனத்தில் என்னை அதிகமாக யோசிக்க வைக்கும் வார்த்தை எது?',
      'இன்று நான் இந்த போதனையின்படி வாழ என்ன ஒரு நடைமுறை மாற்றத்தை செய்ய முடியும்?'
    ],
    reflection_questions_en: [
      `How does ${refEn} speak directly to my current circumstances?`,
      'Am I truly surrendering my worries to God or attempting to control outcomes myself?',
      'Which word or phrase in this verse challenges my perspective the most?',
      'What single practical action can I take today to live out this truth?'
    ],

    // 9. Prayer / Meditation
    meditation_direction_ta: `இன்று இந்த வசனத்தை மெதுவாக 3 முறை வாசியுங்கள். தேவனுடைய வார்த்தை உங்கள் இருதயத்தில் ஆழமாகப் பதியட்டும்.`,
    meditation_direction_en: `Read this verse slowly three times today. Allow the weight of God’s promise to settle deeply into your heart.`,
    prayer_ta: `அன்புள்ள பிதாவே, ${refTa} வசனத்தின் மூலமாக நீர் என்னோடு பேசினதற்காக ஸ்தோத்திரம். உம்முடைய வார்த்தையை என் இருதயத்தில் காத்துக்கொள்ளவும், தினமும் அதன்படி நடக்கவும் எனக்கு கிருபை தாரும். இயேசுவின் நாமத்தில் ஆமென்.`,
    prayer_en: `Heavenly Father, thank You for speaking to me through ${refEn}. Write this truth upon my heart and give me the strength to walk in obedience every day. In Jesus’ name, Amen.`
  };
};

// ----------------------------------------------------------------------
// CHAPTER STUDY GENERATOR & SERVICE
// ----------------------------------------------------------------------

export const generateChapterStudyContent = (
  bookId: number,
  chapter: number,
  bookNameTa: string,
  bookNameEn: string,
  verses: BibleVerse[]
): ChapterStudy => {
  const totalVerses = verses.length;
  const chapterRefTa = `${bookNameTa} ${chapter}`;
  const chapterRefEn = `${bookNameEn} ${chapter}`;

  // Divide chapter into 3 to 4 logical sections
  const sections: ChapterSection[] = [];
  const chunkSize = Math.max(3, Math.ceil(totalVerses / 4));

  for (let i = 0; i < totalVerses; i += chunkSize) {
    const chunkVerses = verses.slice(i, i + chunkSize);
    const startV = chunkVerses[0].verse;
    const endV = chunkVerses[chunkVerses.length - 1].verse;
    const rangeStr = startV === endV ? `${startV}` : `${startV}–${endV}`;

    const sectionVerses = chunkVerses.map((v) => ({
      verse: v.verse,
      text_ta: v.text_ta,
      text_en: v.text_en
    }));

    sections.push({
      verse_range: rangeStr,
      title_ta: `${chapterRefTa}:${rangeStr} - பகுதி விளக்கம்`,
      title_en: `${chapterRefEn}:${rangeStr} - Section Narrative`,
      summary_ta: `இந்த பகுதியில் (${rangeStr} வசனங்கள்) குறிப்பிடப்பட்டுள்ள சம்பவங்கள் மற்றும் உபதேசங்கள்.`,
      summary_en: `Passage covering verses ${rangeStr}, detailing the progression of events and divine teachings.`,
      meaning_ta: `வசனங்கள் ${rangeStr} நமக்கு உணர்த்துவது: தேவனுடைய சத்தியத்தை ஆழமாகப் புரிந்து கொண்டு கீழ்ப்படிவதன் முக்கியத்துவம்.`,
      meaning_en: `Verses ${rangeStr} highlight the importance of recognizing spiritual truth and responding in faith.`,
      lesson_ta: 'தேவன் தம் வார்த்தையின் மூலம் நமது அன்றாட செயல்களையும் இருதயத்தின் நோக்கங்களையும் சீரமைக்கிறார்.',
      lesson_en: 'God aligns our inner motives and external actions through His holy word.',
      verses: sectionVerses
    });
  }

  // Key characters in chapter
  const characters: CharacterProfile[] = [
    {
      name_ta: `${bookNameTa} ஆசிரியரும் பிரதான கதாபாத்திரங்களும்`,
      name_en: `Key Figures in ${bookNameEn} ${chapter}`,
      role_ta: 'செய்தியைக் கொண்டுவருபவர்கள் மற்றும் தேவனுடைய ஜனங்கள்',
      role_en: 'Bearers of the message & the community of listeners',
      actions_ta: 'தேவனின் வார்த்தையைக் கேட்டு, தர்க்கங்களை விட்டு விசுவாசத்தில் முன்னேறுவது.',
      actions_en: 'Hearing the divine call, wrestling with questions, and moving toward deeper faith.',
      lesson_ta: 'மனித பலவீனங்கள் இருந்தாலும் தேவனுடைய கிருபை நம்மில் கிரியை செய்கிறது.',
      lesson_en: 'God’s power is revealed through human surrendered willingness.'
    }
  ];

  // Story style pastor walkthrough
  const fullStoryTa = `அன்பான சகோதர சகோதரிகளே, நாம் ${chapterRefTa} அதிகாரத்தை ஒன்றாகப் படிக்கும்போது, ஒரு நல்ல போதகர் நம் அருகில் அமர்ந்து அன்போடு விளக்குவது போன்ற ஒரு அனுபவத்தைப் பெறுகிறோம்.\n\nஇந்த அதிகாரத்தின் தொடக்கத்தில், முதலாவதாக சூழ்நிலை அமைக்கப்படுகிறது. மனிதர்களின் தேடலும், கேள்விகளும், தேவனுடைய பிரசன்னமும் இங்கு வெளிப்படுகிறது. தொடர்ந்து வாசிக்கும்போது, மையப் பகுதியில் ஒரு முக்கியமான திருப்புமுனை ஏற்படுகிறது - அங்கு தேவனுடைய திட்டம் தெளிவுபடுத்தப்படுகிறது.\n\nஅதிகாரத்தின் முடிவில், நாம் வெறும் தகவல்களை மட்டும் பெறாமல், நமது சொந்த வாழ்க்கையை பரிசோதித்துப் பார்க்கும் அழைப்பைப் பெறுகிறோம். ${chapterRefTa} அதிகாரம் நமக்குக் கற்றுக்கொடுக்கும் பாடம்: தேவனுடைய கிருபையை ஏற்றுக்கொண்டு, விசுவாசத்தில் உறுதியாக நடப்பதே உண்மையான ஆசீர்வாதம்.`;

  const fullStoryEn = `Dear brothers and sisters, as we step into ${chapterRefEn} together, imagine sitting down with a caring pastor who walks you through the story step-by-step.\n\nThe chapter begins by setting the backdrop—human questions, genuine longings, and God drawing near. As the narrative unfolds into the middle verses, we reach a decisive turning point where divine wisdom clarifies human confusion.\n\nBy the end of ${chapterRefEn}, we are left not just with knowledge, but with an invitation to reflect on our own lives and walk forward in quiet confidence and renewed obedience.`;

  return {
    book_id: bookId,
    chapter,
    book_name_ta: bookNameTa,
    book_name_en: bookNameEn,
    total_verses: totalVerses,

    // 1. ஒரு பார்வையில்
    overview_ta: `${chapterRefTa} அதிகாரம் மொத்தம் ${totalVerses} வசனங்களைக் கொண்டது. இது ஆன்மீக வளர்ச்சி, தேவனுடைய வழிநடத்துதல் மற்றும் மனித பொறுப்புகளை தெளிவுபடுத்துகிறது.`,
    overview_en: `${chapterRefEn} contains ${totalVerses} verses outlining spiritual growth, divine wisdom, and personal responsibility.`,
    key_event_ta: `அதிகாரத்தில் வெளிப்படும் சத்தியங்களும் மனிதர்களின் ஆவிக்குரிய அனுபவங்களும்.`,
    key_event_en: `The unfolding of divine truth and the response of those listening.`,
    key_teaching_ta: 'தேவனுக்குள் விசுவாசத்தோடு நிலைத்திருப்பதன் ஆசீர்வாதம்.',
    key_teaching_en: 'The enduring blessing of walking faithfully with God.',
    central_theme_ta: 'தேவனின் கிருபையும், மனித இருதயத்தின் மாற்றமும்.',
    central_theme_en: 'God’s grace and the ongoing transformation of the human heart.',

    // 2. முழு கதையின் விளக்கம்
    full_story_ta: fullStoryTa,
    full_story_en: fullStoryEn,

    // 3. பகுதி பகுதியாக விளக்கம்
    sections,

    // 4. முக்கிய கருத்துக்கள்
    main_ideas_ta: [
      {
        idea: 'தேவனின் ஆளுகையும் மாறாத அன்பும்',
        verse_ref: `${chapterRefTa}:1–${Math.min(5, totalVerses)}`,
        why_it_matters: 'நமது நம்பிக்கைக்கு அடிப்படையானது தேவனுடைய மாறாத தன்மையே.'
      },
      {
        idea: 'இருதயத்தின் உண்மையுள்ள மனமாற்றம்',
        verse_ref: `${chapterRefTa}:${Math.min(6, totalVerses)}–${totalVerses}`,
        why_it_matters: 'வெளிப்புற சடங்குகளை விட இருதயத்தின் உண்மையான தியானமே தேவனுக்குப் பிரியமானது.'
      }
    ],
    main_ideas_en: [
      {
        idea: 'God’s Sovereign Care & Unchanging Love',
        verse_ref: `${chapterRefEn}:1–${Math.min(5, totalVerses)}`,
        why_it_matters: 'Our security rests on God’s character rather than fluctuating emotions.'
      },
      {
        idea: 'Sincere Heart Transformation',
        verse_ref: `${chapterRefEn}:${Math.min(6, totalVerses)}–${totalVerses}`,
        why_it_matters: 'God values inner sincerity over superficial appearance.'
      }
    ],

    // 5. முக்கிய நபர்கள்
    characters,

    // 6. முக்கிய வார்த்தைகள்
    key_words_ta: [
      { word: 'கிருபை (Grace)', meaning: 'தகுதியில்லாத நமக்குக் கிடைக்கும் தேவ தயவு.' },
      { word: 'சமாதானம் (Peace)', meaning: 'சூழ்நிலைகளைத் தாண்டி இருக்கும் தெய்வீக அமைதி.' },
      { word: 'கீழ்ப்படிதல் (Obedience)', meaning: 'அன்பினாலாகிய அர்ப்பணிப்பு செயல்கள்.' }
    ],
    key_words_en: [
      { word: 'Grace', meaning: 'Unmerited favor and divine help in times of need.' },
      { word: 'Shalom / Peace', meaning: 'Wholeness and tranquil rest rooted in God.' },
      { word: 'Obedience', meaning: 'Heartfelt response to God’s loving boundaries.' }
    ],

    // 7. ரியல் லைஃப் அப்ளிகேஷன்
    life_applications_ta: [
      {
        context: 'அன்றாட சவால்கள் மற்றும் முடிவுகள் (Daily Challenges)',
        application: `${chapterRefTa} கற்பிப்பதுபோல, உங்கள் கவலைகளை ஜெபத்தில் ஒப்புக்கொடுத்து தேவனுடைய ஞானத்தின்படி முடிவுகளை எடுங்கள்.`
      },
      {
        context: 'தனிப்பட்ட ஆன்மீக வாஞ்சை (Personal Spiritual Growth)',
        application: 'தினமும் வேத வசனங்களை தியானித்து உங்கள் சிந்தனைகளைப் புதிதாக்குங்கள்.'
      }
    ],
    life_applications_en: [
      {
        context: 'Navigating Daily Decisions',
        application: `Apply the principles of ${chapterRefEn} by seeking God in prayer before reacting to pressures.`
      },
      {
        context: 'Personal Spiritual Discipline',
        application: 'Make consistent quiet time to allow God’s Word to recalibrate your mindset.'
      }
    ],

    // 8. பல்வேறு பார்வைகள்
    perspectives: [
      {
        id: 'world',
        title_ta: 'உலக பார்வை',
        title_en: 'Worldview Perspective',
        description_ta: 'உலகம் இந்த அதிகாரத்தில் உள்ள போதனைகளை ஒரு பழமையான தத்துவமாக மட்டுமே பார்க்கக்கூடும்.',
        description_en: 'Secular viewpoints may view these instructions merely as historic moral literature.'
      },
      {
        id: 'human',
        title_ta: 'மனித உணர்வு பார்வை',
        title_en: 'Human Emotional View',
        description_ta: 'மனித பலவீனத்தின் மத்தியில் தேவனுடைய கட்டளைகள் சில சமயம் சவாலாக தோன்றலாம்.',
        description_en: 'Human emotion may initially feel challenged by the calls to humility and surrender.'
      },
      {
        id: 'faith',
        title_ta: 'விசுவாச பார்வை',
        title_en: 'Faith Perspective',
        description_ta: 'விசுவாசிக்கு இந்த அதிகாரம் தேவனுடைய வழிகாட்டும் ஜோதியாக விளங்குகிறது.',
        description_en: 'To the believer, every promise in this chapter is a bedrock of hope and authority.'
      },
      {
        id: 'meditative',
        title_ta: 'தியான பார்வை',
        title_en: 'Meditative Reflection',
        description_ta: 'வசனங்களின் ஆழத்தை தியானிக்கும் போது தேவனுடைய பெருங்கருணை தெளிவாகிறது.',
        description_en: 'Pondering the passage deeply unlocks layers of divine wisdom.'
      },
      {
        id: 'practical',
        title_ta: 'நடைமுறை பார்வை',
        title_en: 'Practical Application',
        description_ta: 'இன்றைய நாளில் பிறருக்கு சேவை செய்யவும் அன்பை வெளிப்படுத்தவும் தூண்டுகிறது.',
        description_en: 'Inspirations for tangible service, forgiveness, and integrity today.'
      },
      {
        id: 'misunderstanding',
        title_ta: 'தவறான புரிதல்களைத் தவிர்த்தல்',
        title_en: 'Avoiding Misunderstandings',
        description_ta: 'வசனங்களை அவைகளின் சுற்றறிக்கையிலிருந்து பிரித்து சொந்த விருப்பத்திற்கு ஏற்ப பயன்படுத்தக் கூடாது.',
        description_en: 'Avoid isolating single verses out of context to support personal biases.'
      }
    ],

    // 9. Takeaways
    takeaways_ta: [
      `${chapterRefTa} அதிகாரத்தின் மூலமாக தேவன் தமது உண்மையையும் அன்பையும் வெளிப்படுத்துகிறார்.`,
      'முழு இருதயத்தோடு தேவனைத் தேடும்போது நமது வழிகள் செவ்வைப்படும்.',
      'கஷ்டமான சூழ்நிலைகளிலும் தேவனுடைய சமாதானம் நம் இருதயத்தைக் காத்துக்கொள்ளும்.'
    ],
    takeaways_en: [
      `God reveals His steadfast love and faithfulness in ${chapterRefEn}.`,
      'Seeking God with undivided heart leads to true wisdom and peace.',
      'God’s peace will guard your heart and mind through every trial.'
    ],

    // 10. Reflection Questions
    reflection_questions_ta: [
      `${chapterRefTa} அதிகாரத்தில் என்னை அதிகம் சிந்திக்க வைத்த பகுதி எது?`,
      'இந்த அதிகாரத்திலிருந்து நான் மாற்றிக்கொள்ள வேண்டிய ஒரு விஷயம் என்ன?',
      'இன்று நான் யாருக்காவது அன்பையோ மன்னிப்பையோ வெளிப்படுத்த வேண்டியிருக்கிறதா?',
      'தேவனுடைய வாக்குத்தத்தங்களை நான் எப்படி உறுதியாகப் பற்றிக்கொள்ளப் போகிறேன்?'
    ],
    reflection_questions_en: [
      `Which section of ${chapterRefEn} resonated most deeply with you?`,
      'What specific attitude or habit is God prompting you to surrender?',
      'Is there someone you need to forgive or show extra kindness to today?',
      'How can you actively apply these chapter principles this week?'
    ],

    // 11. Prayer / Meditation
    meditation_ta: `${chapterRefTa} அதிகாரத்தின் மையச் செய்தியை அமைதியாகத் தியானியுங்கள். தேவனுடைய பிரசன்னம் உங்களை நிரப்பட்டும்.`,
    meditation_en: `Quiet your heart and meditate on the central theme of ${chapterRefEn}. Let God’s peace settle upon you.`,
    prayer_ta: `பரலோகப் பிதாவே, ${chapterRefTa} அதிகாரத்தின் மூலம் எனக்குத் தந்த நல் உபதேசங்களுக்காக நன்றி. உம்முடைய வார்த்தையின்படி வாழவும், கிறிஸ்துவின் ஒளியைப் பிரதிபலிக்கவும் எனக்குப் பெலன் தாரும். இயேசுவின் நாமத்தில் ஆமென்.`,
    prayer_en: `Heavenly Father, thank You for the truth recorded in ${chapterRefEn}. Help me to embrace Your Word wholeheartedly and walk in Your grace every day. In Jesus’ name, Amen.`
  };
};

// ----------------------------------------------------------------------
// STUDY SERVICE API WITH LOCAL CACHING
// ----------------------------------------------------------------------

export const getVerseStudy = async (
  bookId: number,
  chapter: number,
  verseNum: number
): Promise<VerseStudy | null> => {
  await loadBibleDatasets();
  const cacheKey = `${VERSE_STUDY_CACHE_KEY_PREFIX}${bookId}_${chapter}_${verseNum}`;

  const applyCustomOverrides = (data: VerseStudy): VerseStudy => {
    const custom = getCustomMeditationForVerse(bookId, chapter, verseNum);
    if (!custom) return data;

    const merged = { ...data };
    if (custom.simple_explanation_ta) merged.simple_explanation_ta = custom.simple_explanation_ta;
    if (custom.simple_explanation_en) merged.simple_explanation_en = custom.simple_explanation_en;
    if (custom.deep_meaning_ta) merged.deep_meaning_ta = custom.deep_meaning_ta;
    if (custom.deep_meaning_en) merged.deep_meaning_en = custom.deep_meaning_en;
    if (custom.prayer_ta) merged.prayer_ta = custom.prayer_ta;
    if (custom.prayer_en) merged.prayer_en = custom.prayer_en;
    if (custom.pastoral_note) {
      merged.what_it_emphasizes_ta = `${merged.what_it_emphasizes_ta}\n\n[போதகரின் விசேஷ தியானக் குறிப்பு]: ${custom.pastoral_note}`;
    }
    if (custom.practical_application_ta) {
      merged.learnings_ta = { ...merged.learnings_ta, today_practice: custom.practical_application_ta };
    }
    if (custom.practical_application_en) {
      merged.learnings_en = { ...merged.learnings_en, today_practice: custom.practical_application_en };
    }
    if (custom.reflection_question_ta) {
      merged.reflection_questions_ta = [custom.reflection_question_ta, ...merged.reflection_questions_ta];
    }
    if (custom.reflection_question_en) {
      merged.reflection_questions_en = [custom.reflection_question_en, ...merged.reflection_questions_en];
    }
    return merged;
  };

  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      return applyCustomOverrides(JSON.parse(cached) as VerseStudy);
    }
  } catch (err) {
    console.error('Error loading cached verse study:', err);
  }

  const verseObj = getVerseByLocation(bookId, chapter, verseNum);
  if (!verseObj) return null;

  const bookMeta = getBookMetaById(bookId);
  const bookNameTa = bookMeta ? bookMeta.name_ta : '';
  const bookNameEn = bookMeta ? bookMeta.name_en : '';

  const surrounding = getChapterVerses(bookId, chapter);
  const studyData = generateVerseStudyContent(verseObj, bookNameTa, bookNameEn, surrounding);

  try {
    localStorage.setItem(cacheKey, JSON.stringify(studyData));
  } catch (err) {
    console.error('Error saving verse study cache:', err);
  }

  return applyCustomOverrides(studyData);
};

export const getChapterStudy = async (
  bookId: number,
  chapter: number
): Promise<ChapterStudy | null> => {
  await loadBibleDatasets();
  const cacheKey = `${CHAPTER_STUDY_CACHE_KEY_PREFIX}${bookId}_${chapter}`;

  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached) as ChapterStudy;
    }
  } catch (err) {
    console.error('Error loading cached chapter study:', err);
  }

  const verses = getChapterVerses(bookId, chapter);
  if (!verses || verses.length === 0) return null;

  const bookMeta = getBookMetaById(bookId);
  const bookNameTa = bookMeta ? bookMeta.name_ta : '';
  const bookNameEn = bookMeta ? bookMeta.name_en : '';

  const studyData = generateChapterStudyContent(bookId, chapter, bookNameTa, bookNameEn, verses);

  try {
    localStorage.setItem(cacheKey, JSON.stringify(studyData));
  } catch (err) {
    console.error('Error saving chapter study cache:', err);
  }

  return studyData;
};
