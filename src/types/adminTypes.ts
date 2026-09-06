export interface AnnouncementConfig {
  enabled: boolean;
  text_ta: string;
  text_en: string;
  level: 'info' | 'warning' | 'success';
  dismissible: boolean;
}

export interface AdminGlobalConfig {
  verseStudyEnabled: boolean;
  chapterStudyEnabled: boolean;
  dailyRevivalWordEnabled: boolean;
  prayerWallEnabled: boolean;
  audioNarrationEnabled: boolean;
  allowUserCustomNotes: boolean;
  announcementBanner: AnnouncementConfig;
  updatedAt: string;
  updatedBy: string;
}

export interface AdminUserDetails {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user' | 'moderator';
  createdAt: string;
  lastActive: string;
  bookmarksCount: number;
  highlightsCount: number;
  notesCount: number;
  readingProgressDays: number;
  isSuspended?: boolean;
}

export interface CustomVerseMeditation {
  book_id: number;
  chapter: number;
  verse: number;
  simple_explanation_ta?: string;
  simple_explanation_en?: string;
  deep_meaning_ta?: string;
  deep_meaning_en?: string;
  practical_application_ta?: string;
  practical_application_en?: string;
  prayer_ta?: string;
  prayer_en?: string;
  reflection_question_ta?: string;
  reflection_question_en?: string;
  pastoral_note?: string;
  updated_at: string;
  updated_by: string;
}

export interface AdminRevivalWord {
  id: string;
  date: string; // YYYY-MM-DD
  book_id: number;
  chapter: number;
  verse: number;
  category: string;
  prompt_ta: string;
  prompt_en: string;
  special_theme?: string;
  status: 'active' | 'scheduled' | 'archived';
  created_at: string;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  action: string;
  category: 'config' | 'user' | 'content' | 'security';
  details: string;
  adminEmail: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsersToday: number;
  totalBookmarks: number;
  totalHighlights: number;
  totalStudiesConducted: number;
  customMeditationsCount: number;
  scheduledRevivalWordsCount: number;
  recentActivities: AdminAuditLog[];
}
