export type Testament = 'OT' | 'NT';
export type Language = 'en' | 'ta' | 'parallel';

export interface BibleBook {
  id: number;          // 1-based unique ID (1..66)
  bookIndex: number;   // 0-based dataset index (0..65)
  book_number: number; // Canonical biblical order (1..66)
  testament: Testament;
  name_en: string;
  name_ta: string;
  code: string;
  total_chapters: number;
}

export interface BibleVerse {
  id: number;
  book_id: number;
  chapter: number;
  verse: number;
  text_en: string;
  text_ta: string;
  norm_ta?: string;
  lower_en?: string;
}

export interface SearchResult {
  id: number;
  book_id: number;
  book_name_en: string;
  book_name_ta: string;
  chapter: number;
  verse: number;
  text_en: string;
  text_ta: string;
}

export type FontSizeOption = 'sm' | 'md' | 'lg' | 'xl';
export type LineHeightOption = 'normal' | 'relaxed' | 'loose';
export type MaxWidthOption = 'compact' | 'standard' | 'wide';
export type ThemeOption =
  | 'light'
  | 'dark'
  | 'sepia'
  | 'nordic'
  | 'forest'
  | 'royal'
  | 'sunset'
  | 'oled'
  | 'custom';

export interface CustomThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  bgSurface: string;
  textPrimary: string;
  textSecondary: string;
  accentColor: string;
}

export type TamilFontOption = 'noto' | 'mukta' | 'catamaran' | 'arima' | 'hind' | 'anek' | 'serif' | 'kavi' | 'baloo' | 'coiny' | 'pavanam' | 'system';
export type EnglishFontOption = 'lora' | 'inter' | 'merriweather' | 'outfit' | 'playfair' | 'roboto' | 'georgia' | 'cinzel' | 'opensans' | 'montserrat' | 'poppins' | 'baskerville';
export type VerseOptionsStyleOption = 'dropdown' | 'buttons';

export interface ReadingPreferences {
  fontSize: FontSizeOption;
  lineHeight: LineHeightOption;
  maxWidth: MaxWidthOption;
  customFontSizePx?: number;
  customLineHeightVal?: number;
  customMaxWidthPx?: number;
  theme: ThemeOption;
  language: Language;
  fontFamilyTa?: TamilFontOption;
  fontFamilyEn?: EnglishFontOption;
  verseOptionsStyle?: VerseOptionsStyleOption;
  customThemeColors?: CustomThemeColors;
  dailyGoalMinutes?: number;
  reminderTime?: string;
  notificationsEnabled?: boolean;
  onboardingCompleted?: boolean;
}

export interface Bookmark {
  id: string;
  book_id: number;
  chapter: number;
  verse: number;
  language: Language;
  book_name_en: string;
  book_name_ta: string;
  text_en: string;
  text_ta: string;
  created_at: string;
}

export interface ReadingHistoryItem {
  book_id: number;
  chapter: number;
  verse: number;
  language: Language;
  book_name_en: string;
  book_name_ta: string;
  updated_at: string;
}

// User Profile & Role Types (Phase 10)
export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

// Verse Note (Phase 10)
export interface VerseNote {
  id?: string;
  book: string;
  chapter: number;
  verse: number;
  content: string;
  created_at?: string;
  updated_at?: string;
}

// Reading Progress (Phase 10)
export interface ReadingProgress {
  id?: string;
  book: string;
  chapter: number;
  verse: number;
  scroll_position: number;
  updated_at?: string;
}

// User Activity Types (Phase 11)
export type ActivityType =
  | 'BOOKMARK_ADDED'
  | 'BOOKMARK_REMOVED'
  | 'HIGHLIGHT_ADDED'
  | 'HIGHLIGHT_REMOVED'
  | 'NOTE_CREATED'
  | 'NOTE_UPDATED'
  | 'NOTE_DELETED'
  | 'CHAPTER_READ'
  | 'READING_PROGRESS_UPDATED'
  | 'SEARCH_PERFORMED'
  | 'DAILY_VERSE_VIEWED'
  | 'VERSE_EXPLORATION_OPENED'
  | 'CHAPTER_EXPLORATION_OPENED'
  | 'SETTINGS_CHANGED'
  | 'LANGUAGE_CHANGED';

export interface UserActivity {
  id?: string;
  user_id: string;
  activity_type: ActivityType;
  book?: string;
  chapter?: number;
  verse?: number;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface StreakData {
  streak: number;
  bestStreak: number;
  lastReadDate: string | null;
  dailyGoal: number;
  todayCount: number;
  totalChapters: number;
  calendarMap: Record<string, number>;
}

