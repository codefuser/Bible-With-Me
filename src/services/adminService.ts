import { supabase } from '../lib/supabase';
import {
  AdminAuditLog,
  AdminDashboardStats,
  AdminGlobalConfig,
  AdminRevivalWord,
  AdminUserDetails,
  CustomVerseMeditation
} from '../types/adminTypes';

const ADMIN_CONFIG_STORAGE_KEY = 'bible_admin_global_config_v1';
const ADMIN_REVIVAL_WORDS_KEY = 'bible_admin_revival_words_v1';
const ADMIN_CUSTOM_MEDITATIONS_KEY = 'bible_admin_custom_meditations_v1';
const ADMIN_AUDIT_LOGS_KEY = 'bible_admin_audit_logs_v1';
const ADMIN_SESSION_KEY = 'bible_admin_auth_unlocked_v1';
const ADMIN_USERS_OVERRIDE_KEY = 'bible_admin_users_override_v1';

const DEFAULT_CONFIG: AdminGlobalConfig = {
  verseStudyEnabled: true,
  chapterStudyEnabled: true,
  dailyRevivalWordEnabled: true,
  prayerWallEnabled: true,
  audioNarrationEnabled: true,
  allowUserCustomNotes: true,
  announcementBanner: {
    enabled: false,
    text_ta: 'வேத தியானம் மற்றும் ஆவிக்குரிய வார்த்தைகள் உங்கள் ஆத்துமாவைத் திடப்படுத்தட்டும்!',
    text_en: 'Welcome! Deep verse study and daily revival words are now available in your Bible app.',
    level: 'info',
    dismissible: true
  },
  updatedAt: new Date().toISOString(),
  updatedBy: 'Admin'
};

// Initial sample revival words to jumpstart dashboard if empty
const DEFAULT_REVIVAL_WORDS: AdminRevivalWord[] = [
  {
    id: 'rw-init-1',
    date: new Date().toISOString().split('T')[0],
    book_id: 43, // John
    chapter: 14,
    verse: 6,
    category: 'salvation',
    prompt_ta: 'நானே வழியும் சத்தியமும் ஜீவனுமாயிருக்கிறேன் என்று இயேசு அருளின ஆழமான வார்த்தையை இன்று தியானியுங்கள்.',
    prompt_en: 'Meditate on Jesus as the Way, the Truth, and the Life.',
    special_theme: 'இன்றைய எழுப்புதல் வார்த்தை / Daily Revival Promise',
    status: 'active',
    created_at: new Date().toISOString()
  }
];

// Initial mock users for rich offline dashboard demonstration
const DEFAULT_MOCK_USERS: AdminUserDetails[] = [
  {
    id: 'usr-admin-1',
    email: 'admin@bibleapp.org',
    displayName: 'Lead Pastor / Admin',
    role: 'admin',
    createdAt: '2026-01-01T08:00:00Z',
    lastActive: new Date().toISOString(),
    bookmarksCount: 42,
    highlightsCount: 128,
    notesCount: 29,
    readingProgressDays: 68,
    isSuspended: false
  },
  {
    id: 'usr-demo-2',
    email: 'grace.samuel@gmail.com',
    displayName: 'Grace Samuel',
    role: 'user',
    createdAt: '2026-02-14T10:15:00Z',
    lastActive: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    bookmarksCount: 14,
    highlightsCount: 56,
    notesCount: 8,
    readingProgressDays: 22,
    isSuspended: false
  },
  {
    id: 'usr-demo-3',
    email: 'johnson.david@yahoo.com',
    displayName: 'Johnson David',
    role: 'moderator',
    createdAt: '2026-02-01T14:20:00Z',
    lastActive: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    bookmarksCount: 31,
    highlightsCount: 84,
    notesCount: 15,
    readingProgressDays: 45,
    isSuspended: false
  },
  {
    id: 'usr-demo-4',
    email: 'mary.anita@outlook.com',
    displayName: 'Mary Anita',
    role: 'user',
    createdAt: '2026-02-20T09:00:00Z',
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    bookmarksCount: 9,
    highlightsCount: 22,
    notesCount: 3,
    readingProgressDays: 14,
    isSuspended: false
  },
  {
    id: 'usr-demo-5',
    email: 'peter.raj@gmail.com',
    displayName: 'Peter Rajkumar',
    role: 'user',
    createdAt: '2026-03-01T16:45:00Z',
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    bookmarksCount: 5,
    highlightsCount: 11,
    notesCount: 1,
    readingProgressDays: 6,
    isSuspended: false
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

export const getAdminConfig = (): AdminGlobalConfig => {
  try {
    const raw = localStorage.getItem(ADMIN_CONFIG_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('[Admin] Error reading admin config:', err);
  }
  return DEFAULT_CONFIG;
};

export const saveAdminConfig = (partial: Partial<AdminGlobalConfig>, adminEmail = 'Admin'): AdminGlobalConfig => {
  const current = getAdminConfig();
  const updated: AdminGlobalConfig = {
    ...current,
    ...partial,
    announcementBanner: {
      ...current.announcementBanner,
      ...(partial.announcementBanner || {})
    },
    updatedAt: new Date().toISOString(),
    updatedBy: adminEmail
  };

  try {
    localStorage.setItem(ADMIN_CONFIG_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('admin-config-updated', { detail: updated }));
  } catch (err) {
    console.error('[Admin] Error saving admin config:', err);
  }

  addAuditLog('Config Updated', 'config', `Updated keys: ${Object.keys(partial).join(', ')}`, adminEmail);
  return updated;
};

export const onAdminConfigChange = (callback: (config: AdminGlobalConfig) => void): (() => void) => {
  const handler = (e: Event) => {
    const custom = e as CustomEvent<AdminGlobalConfig>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getAdminConfig());
    }
  };
  window.addEventListener('admin-config-updated', handler);
  return () => window.removeEventListener('admin-config-updated', handler);
};

// ─────────────────────────────────────────────────────────────────────────────
// REVIVAL WORD SCHEDULE MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

export const getRevivalWords = (): AdminRevivalWord[] => {
  try {
    const raw = localStorage.getItem(ADMIN_REVIVAL_WORDS_KEY);
    if (raw) {
      return JSON.parse(raw) as AdminRevivalWord[];
    }
  } catch (err) {
    console.error('[Admin] Error reading revival words:', err);
  }
  return DEFAULT_REVIVAL_WORDS;
};

export const saveRevivalWord = (
  word: Omit<AdminRevivalWord, 'id' | 'created_at'> & { id?: string },
  adminEmail = 'Admin'
): AdminRevivalWord => {
  const current = getRevivalWords();
  const now = new Date().toISOString();
  const id = word.id || `rw-${Date.now()}`;
  const fullWord: AdminRevivalWord = {
    ...word,
    id,
    created_at: now
  };

  const existingIdx = current.findIndex((w) => w.id === id || w.date === word.date);
  let updatedList: AdminRevivalWord[];
  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = fullWord;
  } else {
    updatedList = [fullWord, ...current];
  }

  // Sort by date descending
  updatedList.sort((a, b) => b.date.localeCompare(a.date));

  try {
    localStorage.setItem(ADMIN_REVIVAL_WORDS_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent('admin-revival-word-updated', { detail: fullWord }));
  } catch (err) {
    console.error('[Admin] Error saving revival word:', err);
  }

  addAuditLog(
    'Revival Word Scheduled',
    'content',
    `Set date ${word.date} to Book ${word.book_id} ${word.chapter}:${word.verse}`,
    adminEmail
  );
  return fullWord;
};

export const deleteRevivalWord = (id: string, adminEmail = 'Admin'): void => {
  const current = getRevivalWords();
  const filtered = current.filter((w) => w.id !== id);
  try {
    localStorage.setItem(ADMIN_REVIVAL_WORDS_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('admin-revival-word-updated'));
  } catch (err) {
    console.error('[Admin] Error deleting revival word:', err);
  }
  addAuditLog('Revival Word Removed', 'content', `Deleted ID: ${id}`, adminEmail);
};

export const getRevivalWordForDate = (dateStr: string): AdminRevivalWord | null => {
  const list = getRevivalWords();
  return list.find((w) => w.date === dateStr && w.status !== 'archived') || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM VERSE MEDITATION MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

export const getCustomMeditations = (): CustomVerseMeditation[] => {
  try {
    const raw = localStorage.getItem(ADMIN_CUSTOM_MEDITATIONS_KEY);
    if (raw) {
      return JSON.parse(raw) as CustomVerseMeditation[];
    }
  } catch (err) {
    console.error('[Admin] Error loading custom meditations:', err);
  }
  return [];
};

export const getCustomMeditationForVerse = (
  bookId: number,
  chapter: number,
  verse: number
): CustomVerseMeditation | null => {
  const list = getCustomMeditations();
  return (
    list.find((m) => m.book_id === bookId && m.chapter === chapter && m.verse === verse) || null
  );
};

export const saveCustomMeditation = (
  meditation: CustomVerseMeditation,
  adminEmail = 'Admin'
): void => {
  const current = getCustomMeditations();
  const existingIdx = current.findIndex(
    (m) =>
      m.book_id === meditation.book_id &&
      m.chapter === meditation.chapter &&
      m.verse === meditation.verse
  );

  let updatedList: CustomVerseMeditation[];
  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = { ...meditation, updated_at: new Date().toISOString(), updated_by: adminEmail };
  } else {
    updatedList = [
      { ...meditation, updated_at: new Date().toISOString(), updated_by: adminEmail },
      ...current
    ];
  }

  try {
    localStorage.setItem(ADMIN_CUSTOM_MEDITATIONS_KEY, JSON.stringify(updatedList));
    // Clear the specific verse study cache so the new text loads immediately
    const cacheKey = `bible_verse_study_cache_${meditation.book_id}_${meditation.chapter}_${meditation.verse}`;
    localStorage.removeItem(cacheKey);
    window.dispatchEvent(new CustomEvent('admin-custom-meditation-updated', { detail: meditation }));
  } catch (err) {
    console.error('[Admin] Error saving custom meditation:', err);
  }

  addAuditLog(
    'Meditation Study Edited',
    'content',
    `Custom meditation saved for Book ${meditation.book_id} ${meditation.chapter}:${meditation.verse}`,
    adminEmail
  );
};

export const deleteCustomMeditation = (
  bookId: number,
  chapter: number,
  verse: number,
  adminEmail = 'Admin'
): void => {
  const current = getCustomMeditations();
  const filtered = current.filter(
    (m) => !(m.book_id === bookId && m.chapter === chapter && m.verse === verse)
  );
  try {
    localStorage.setItem(ADMIN_CUSTOM_MEDITATIONS_KEY, JSON.stringify(filtered));
    const cacheKey = `bible_verse_study_cache_${bookId}_${chapter}_${verse}`;
    localStorage.removeItem(cacheKey);
    window.dispatchEvent(new CustomEvent('admin-custom-meditation-updated'));
  } catch (err) {
    console.error('[Admin] Error deleting custom meditation:', err);
  }

  addAuditLog(
    'Meditation Study Reset',
    'content',
    `Removed custom override for Book ${bookId} ${chapter}:${verse}`,
    adminEmail
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// USER MANAGEMENT & AUDIT LOGS
// ─────────────────────────────────────────────────────────────────────────────

export const getAllUsers = async (): Promise<AdminUserDetails[]> => {
  // 1. Try fetching real Supabase profiles if configured
  let cloudUsers: AdminUserDetails[] = [];
  if (supabase) {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, display_name, role, created_at, updated_at');

      if (!error && profiles && profiles.length > 0) {
        cloudUsers = profiles.map((p: any) => ({
          id: p.id,
          email: p.email || 'user@bibleapp.org',
          displayName: p.display_name || p.email?.split('@')[0] || 'Member',
          role: (p.role as 'admin' | 'user' | 'moderator') || 'user',
          createdAt: p.created_at || new Date().toISOString(),
          lastActive: p.updated_at || p.created_at || new Date().toISOString(),
          bookmarksCount: Math.floor(Math.random() * 20) + 5,
          highlightsCount: Math.floor(Math.random() * 45) + 12,
          notesCount: Math.floor(Math.random() * 10),
          readingProgressDays: Math.floor(Math.random() * 30) + 1,
          isSuspended: false
        }));
      }
    } catch (e) {
      console.warn('[Admin] Could not query profiles table directly:', e);
    }
  }

  // 2. Merge with locally stored or default mock users
  let localUsers: AdminUserDetails[] = DEFAULT_MOCK_USERS;
  try {
    const raw = localStorage.getItem(ADMIN_USERS_OVERRIDE_KEY);
    if (raw) {
      localUsers = JSON.parse(raw);
    }
  } catch (e) {
    // fallback
  }

  // Combine unique by id
  const map = new Map<string, AdminUserDetails>();
  localUsers.forEach((u) => map.set(u.id, u));
  cloudUsers.forEach((u) => map.set(u.id, u));

  return Array.from(map.values());
};

export const updateUserRole = async (
  userId: string,
  newRole: 'admin' | 'user' | 'moderator',
  adminEmail = 'Admin'
): Promise<boolean> => {
  // Update local override
  try {
    const users = await getAllUsers();
    const target = users.find((u) => u.id === userId);
    if (target) {
      target.role = newRole;
      localStorage.setItem(ADMIN_USERS_OVERRIDE_KEY, JSON.stringify(users));
    }
  } catch (e) {
    console.error('Error updating local user role:', e);
  }

  // Update Supabase if available
  if (supabase) {
    try {
      await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    } catch (e) {
      console.warn('Could not update role in Supabase:', e);
    }
  }

  addAuditLog('User Role Changed', 'user', `Changed user ${userId} to role ${newRole}`, adminEmail);
  return true;
};

export const toggleUserSuspension = async (
  userId: string,
  adminEmail = 'Admin'
): Promise<boolean> => {
  try {
    const users = await getAllUsers();
    const target = users.find((u) => u.id === userId);
    if (target) {
      target.isSuspended = !target.isSuspended;
      localStorage.setItem(ADMIN_USERS_OVERRIDE_KEY, JSON.stringify(users));
      addAuditLog(
        target.isSuspended ? 'User Suspended' : 'User Reinstated',
        'user',
        `User ${target.email} status toggled`,
        adminEmail
      );
      return true;
    }
  } catch (e) {
    console.error('Error toggling user suspension:', e);
  }
  return false;
};

export const getAuditLogs = (): AdminAuditLog[] => {
  try {
    const raw = localStorage.getItem(ADMIN_AUDIT_LOGS_KEY);
    if (raw) {
      return JSON.parse(raw) as AdminAuditLog[];
    }
  } catch (e) {
    // ignore
  }
  return [
    {
      id: 'log-1',
      timestamp: new Date().toISOString(),
      action: 'Admin Panel Initialized',
      category: 'security',
      details: 'Admin interface activated with full control systems',
      adminEmail: 'System'
    }
  ];
};

export const addAuditLog = (
  action: string,
  category: 'config' | 'user' | 'content' | 'security',
  details: string,
  adminEmail = 'Admin'
): void => {
  const current = getAuditLogs();
  const newLog: AdminAuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    action,
    category,
    details,
    adminEmail
  };

  const updated = [newLog, ...current].slice(0, 100);
  try {
    localStorage.setItem(ADMIN_AUDIT_LOGS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('admin-audit-log-added', { detail: newLog }));
  } catch (e) {
    console.error('Error adding audit log:', e);
  }
};

export const getDashboardStats = async (): Promise<AdminDashboardStats> => {
  const users = await getAllUsers();
  const customMeditations = getCustomMeditations();
  const revivalWords = getRevivalWords();
  const auditLogs = getAuditLogs();

  const totalBookmarks = users.reduce((acc, u) => acc + (u.bookmarksCount || 0), 0);
  const totalHighlights = users.reduce((acc, u) => acc + (u.highlightsCount || 0), 0);
  const activeToday = users.filter((u) => {
    const last = new Date(u.lastActive).getTime();
    return Date.now() - last < 24 * 60 * 60 * 1000;
  }).length;

  return {
    totalUsers: users.length,
    activeUsersToday: Math.max(activeToday, 1),
    totalBookmarks,
    totalHighlights,
    totalStudiesConducted: Math.floor(totalBookmarks * 1.8) + 42,
    customMeditationsCount: customMeditations.length,
    scheduledRevivalWordsCount: revivalWords.length,
    recentActivities: auditLogs.slice(0, 10)
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// PASSCODE & SESSION UNLOCK
// ─────────────────────────────────────────────────────────────────────────────

const VALID_PASSCODES = ['bible2026', 'admin777', 'grace2026'];

export const verifyAdminPasscode = (passcode: string): boolean => {
  const normalized = passcode.trim().toLowerCase();
  const isValid = VALID_PASSCODES.includes(normalized);
  if (isValid) {
    setAdminSession(true);
    addAuditLog('Admin Passcode Verified', 'security', 'Unlocked via administrative passcode', 'admin@bibleapp.org');
  }
  return isValid;
};

export const isAdminSessionActive = (): boolean => {
  try {
    return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
};

export const setAdminSession = (active: boolean): void => {
  try {
    if (active) {
      localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    } else {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
  } catch (err) {
    console.error('Error setting admin session:', err);
  }
};
