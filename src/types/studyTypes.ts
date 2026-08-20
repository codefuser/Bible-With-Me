export interface DevotionalPrompt {
  ta: string;
  en: string;
}

export interface CuratedVerseRef {
  book_id: number;
  chapter: number;
  verse: number;
  category: string;
  prompt_ta: string;
  prompt_en: string;
}

export interface DailyVerseHistoryItem {
  date: string; // YYYY-MM-DD
  book_id: number;
  chapter: number;
  verse: number;
  book_name_ta: string;
  book_name_en: string;
  text_ta: string;
  text_en: string;
  viewed_at: string;
}

// ----------------------------------------------------
// VERSE STUDY DATA TYPES
// ----------------------------------------------------
export interface VersePerspective {
  id: 'average' | 'selfish' | 'world' | 'faith' | 'meditative' | 'practical' | 'spiritual';
  title_ta: string;
  title_en: string;
  badge_ta: string;
  badge_en: string;
  description_ta: string;
  description_en: string;
}

export interface VerseStudy {
  book_id: number;
  chapter: number;
  verse: number;
  book_name_ta: string;
  book_name_en: string;
  text_ta: string;
  text_en: string;
  
  // 2. எளிய விளக்கம் (Simple Explanation)
  simple_explanation_ta: string;
  simple_explanation_en: string;
  key_takeaway_ta: string;
  key_takeaway_en: string;

  // 3. ஆழமான அர்த்தம் (Deep Meaning)
  deep_meaning_ta: string;
  deep_meaning_en: string;
  key_terms_ta: { term: string; meaning: string }[];
  key_terms_en: { term: string; meaning: string }[];
  what_it_emphasizes_ta: string;
  what_it_emphasizes_en: string;
  what_it_does_not_mean_ta: string;
  what_it_does_not_mean_en: string;

  // 4. சூழ்நிலை (Context)
  context_speaker_ta: string;
  context_speaker_en: string;
  context_audience_ta: string;
  context_audience_en: string;
  context_situation_ta: string;
  context_situation_en: string;
  surrounding_verses_summary_ta: string;
  surrounding_verses_summary_en: string;

  // 5. நிஜ வாழ்க்கையில் (Real-world Examples)
  real_world_scenarios_ta: { scenario_title: string; example: string }[];
  real_world_scenarios_en: { scenario_title: string; example: string }[];

  // 6. இந்த வசனத்தை எப்படி பார்க்கலாம்? (Multiple Perspectives)
  perspectives: VersePerspective[];

  // 7. நான் இதிலிருந்து என்ன கற்றுக்கொள்ளலாம்? (Personal Takeaways)
  learnings_ta: { what_to_understand: string; what_to_change: string; attitude_to_build: string; today_practice: string };
  learnings_en: { what_to_understand: string; what_to_change: string; attitude_to_build: string; today_practice: string };

  // 8. என்னை நான் கேட்க வேண்டிய கேள்விகள் (Self-Reflection Questions)
  reflection_questions_ta: string[];
  reflection_questions_en: string[];

  // 9. தியானிக்க / ஜெபிக்க (Prayer / Meditation)
  meditation_direction_ta: string;
  meditation_direction_en: string;
  prayer_ta: string;
  prayer_en: string;
}

// ----------------------------------------------------
// CHAPTER STUDY DATA TYPES
// ----------------------------------------------------
export interface ChapterSection {
  verse_range: string; // e.g. "1–5"
  title_ta: string;
  title_en: string;
  summary_ta: string;
  summary_en: string;
  meaning_ta: string;
  meaning_en: string;
  lesson_ta: string;
  lesson_en: string;
  verses: { verse: number; text_ta: string; text_en: string }[];
}

export interface CharacterProfile {
  name_ta: string;
  name_en: string;
  role_ta: string;
  role_en: string;
  actions_ta: string;
  actions_en: string;
  lesson_ta: string;
  lesson_en: string;
}

export interface ChapterPerspective {
  id: 'world' | 'human' | 'faith' | 'meditative' | 'practical' | 'misunderstanding';
  title_ta: string;
  title_en: string;
  description_ta: string;
  description_en: string;
}

export interface ChapterStudy {
  book_id: number;
  chapter: number;
  book_name_ta: string;
  book_name_en: string;
  total_verses: number;

  // 1. ஒரு பார்வையில் (Chapter In One Look)
  overview_ta: string;
  overview_en: string;
  key_event_ta: string;
  key_event_en: string;
  key_teaching_ta: string;
  key_teaching_en: string;
  central_theme_ta: string;
  central_theme_en: string;

  // 2. முழு கதையின் விளக்கம் (Full Story Explanation - Pastor Style Narrative)
  full_story_ta: string;
  full_story_en: string;

  // 3. பகுதி பகுதியாக விளக்கம் (Section-by-Section Explanation)
  sections: ChapterSection[];

  // 4. முக்கிய கருத்துக்கள் (Main Ideas)
  main_ideas_ta: { idea: string; verse_ref: string; why_it_matters: string }[];
  main_ideas_en: { idea: string; verse_ref: string; why_it_matters: string }[];

  // 5. முக்கிய நபர்கள் (Characters)
  characters: CharacterProfile[];

  // 6. முக்கிய வார்த்தைகள் மற்றும் கருத்துக்கள் (Key Words / Concepts)
  key_words_ta: { word: string; meaning: string }[];
  key_words_en: { word: string; meaning: string }[];

  // 7. நம் வாழ்க்கையில் எப்படி பொருந்துகிறது? (Real-Life Chapter Application)
  life_applications_ta: { context: string; application: string }[];
  life_applications_en: { context: string; application: string }[];

  // 8. பல்வேறு பார்வைகள் (Multiple Perspectives for Chapter)
  perspectives: ChapterPerspective[];

  // 9. நான் எடுத்துக்கொள்ள வேண்டியவை (Chapter Takeaways)
  takeaways_ta: string[];
  takeaways_en: string[];

  // 10. சிந்தனை கேள்விகள் (Chapter Reflection Questions)
  reflection_questions_ta: string[];
  reflection_questions_en: string[];

  // 11. தியானம் & ஜெபம் (Chapter Prayer / Meditation)
  meditation_ta: string;
  meditation_en: string;
  prayer_ta: string;
  prayer_en: string;
}
