import { ReadingPreferences } from '../types/bible';
import { upsertCloudSettings } from './userDataService';

const PREFERENCES_KEY = 'bible_app_preferences';

export const defaultPreferences: ReadingPreferences = {
  fontSize: 'md',
  lineHeight: 'relaxed',
  maxWidth: 'standard',
  theme: 'light',
  language: 'ta',
  fontFamilyTa: 'noto',
  fontFamilyEn: 'lora',
  verseOptionsStyle: 'dropdown'
};

export const getStoredPreferences = (): ReadingPreferences => {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (!raw) return defaultPreferences;
    const parsed = JSON.parse(raw);
    return { ...defaultPreferences, ...parsed };
  } catch (err) {
    console.error('Error reading preferences from storage:', err);
    return defaultPreferences;
  }
};

let syncTimer: any = null;

export const savePreferences = (prefs: ReadingPreferences, userId?: string | null): void => {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  } catch (err) {
    console.error('Error saving preferences to storage:', err);
  }

  if (userId) {
    // Debounce cloud update by 1000ms to avoid constant DB writes during rapid UI slider adjustments
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      upsertCloudSettings(userId, prefs);
    }, 1000);
  }
};
