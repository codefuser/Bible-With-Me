import { ReadingPreferences } from '../types/bible';

const PREFERENCES_KEY = 'bible_app_preferences';

export const defaultPreferences: ReadingPreferences = {
  fontSize: 'md',
  lineHeight: 'relaxed',
  maxWidth: 'standard',
  theme: 'light',
  language: 'en'
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

export const savePreferences = (prefs: ReadingPreferences): void => {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  } catch (err) {
    console.error('Error saving preferences to storage:', err);
  }
};
