// ==========================================================================
// DAILY BIBLE READING NATIVE & LOCAL NOTIFICATIONS SERVICE
// Supports Offline Scheduled Reminders, Android System Alarms & App Language
// Multiple Custom Times, Verse with Reference (Erupidam) & App Logo
// ==========================================================================

import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { AppLanguage } from '../types/bible';
import { CURATED_DAILY_VERSES } from './dailyVerseService';
import { getBookMetaById, getVerseByLocation } from './csvBibleService';

const NOTIFICATION_SETTINGS_KEY = 'bible_notification_settings_v3';
const LAST_APP_OPEN_NOTIF_KEY = 'bible_last_app_open_notif_time';

export interface ReminderSlot {
  id: number;
  key: 'morning' | 'afternoon' | 'night' | 'custom';
  nameEn: string;
  nameTa: string;
  time: string; // "HH:MM" 24h
  enabled: boolean;
}

export interface CustomReminderTime {
  id: number;
  time: string; // "HH:MM" e.g. "07:30"
  labelEn: string;
  labelTa: string;
  enabled: boolean;
}

export interface NotificationScheduleConfig {
  enabled: boolean;
  goalMinutes: number;
  appOpenReminderEnabled: boolean;
  appOpenFrequencyHours: number; // e.g. 2 or 3 hours
  slots: {
    morning: ReminderSlot;
    afternoon: ReminderSlot;
    night: ReminderSlot;
    custom: ReminderSlot;
  };
  customTimes: CustomReminderTime[];
}

export const DEFAULT_NOTIFICATION_CONFIG: NotificationScheduleConfig = {
  enabled: false,
  goalMinutes: 15,
  appOpenReminderEnabled: false,
  appOpenFrequencyHours: 3,
  slots: {
    morning: {
      id: 101,
      key: 'morning',
      nameEn: 'Morning Devotional',
      nameTa: 'விடியற்காலை வேத வாசிப்பு',
      time: '06:00',
      enabled: true
    },
    afternoon: {
      id: 102,
      key: 'afternoon',
      nameEn: 'Midday Meditation',
      nameTa: 'மதிய வேத தியானம்',
      time: '12:30',
      enabled: false
    },
    night: {
      id: 103,
      key: 'night',
      nameEn: 'Night Devotional',
      nameTa: 'இரவு வேத தியானம்',
      time: '21:00',
      enabled: true
    },
    custom: {
      id: 104,
      key: 'custom',
      nameEn: 'Custom Reminder',
      nameTa: 'தனிப்பயன் நேரம்',
      time: '08:00',
      enabled: false
    }
  },
  customTimes: []
};

export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const isNotificationSupported = (): boolean => {
  if (isNativePlatform()) return true;
  return typeof window !== 'undefined' && 'Notification' in window;
};

/**
 * Checks current notification permission state
 */
export const getNotificationPermission = async (): Promise<'granted' | 'denied' | 'prompt'> => {
  if (isNativePlatform()) {
    try {
      const status = await LocalNotifications.checkPermissions();
      if (status.display === 'granted') return 'granted';
      if (status.display === 'denied') return 'denied';
      return 'prompt';
    } catch {
      return 'prompt';
    }
  }

  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
  }
  return 'prompt';
};

/**
 * Requests permission from Android / Browser
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (isNativePlatform()) {
    try {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch (err) {
      console.error('[NotificationService] Native permission request failed:', err);
      return false;
    }
  }

  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      const res = await Notification.requestPermission();
      return res === 'granted';
    } catch (err) {
      console.error('[NotificationService] Web permission request failed:', err);
      return false;
    }
  }

  return false;
};

/**
 * Loads saved notification settings
 */
export const getNotificationSchedule = (): NotificationScheduleConfig => {
  try {
    const raw = localStorage.getItem(NOTIFICATION_SETTINGS_KEY) || localStorage.getItem('bible_notification_settings_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_NOTIFICATION_CONFIG,
        ...parsed,
        slots: {
          ...DEFAULT_NOTIFICATION_CONFIG.slots,
          ...(parsed.slots || {})
        },
        customTimes: Array.isArray(parsed.customTimes) ? parsed.customTimes : []
      };
    }
  } catch {
    // fallback
  }
  return DEFAULT_NOTIFICATION_CONFIG;
};

/**
 * Saves and re-schedules notifications
 */
export const saveNotificationSchedule = async (
  config: Partial<NotificationScheduleConfig>,
  appLang: AppLanguage = 'ta'
): Promise<NotificationScheduleConfig> => {
  const current = getNotificationSchedule();
  const updated: NotificationScheduleConfig = {
    ...current,
    ...config,
    slots: {
      ...current.slots,
      ...(config.slots || {})
    },
    customTimes: Array.isArray(config.customTimes) ? config.customTimes : current.customTimes
  };

  try {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('[NotificationService] Failed to save config:', err);
  }

  // Re-schedule alarms
  await rescheduleAllNotifications(updated, appLang);
  return updated;
};

/**
 * Adds a new custom reminder time to the user schedule
 */
export const addCustomReminderTime = async (
  time: string,
  appLang: AppLanguage = 'ta'
): Promise<NotificationScheduleConfig> => {
  const current = getNotificationSchedule();
  const newId = 300 + current.customTimes.length + 1;
  const newCustom: CustomReminderTime = {
    id: newId,
    time,
    labelEn: `Reminder ${current.customTimes.length + 1}`,
    labelTa: `தியான நேரம் ${current.customTimes.length + 1}`,
    enabled: true
  };

  const updatedCustomTimes = [...current.customTimes, newCustom];
  return saveNotificationSchedule({ customTimes: updatedCustomTimes }, appLang);
};

/**
 * Removes a custom reminder time
 */
export const removeCustomReminderTime = async (
  id: number,
  appLang: AppLanguage = 'ta'
): Promise<NotificationScheduleConfig> => {
  const current = getNotificationSchedule();
  const updatedCustomTimes = current.customTimes.filter((item) => item.id !== id);
  return saveNotificationSchedule({ customTimes: updatedCustomTimes }, appLang);
};

/**
 * Helper to fetch a devotional verse with reference (erupidam) and text
 */
export const getVerseForNotification = (indexOffset: number = 0, isTa: boolean = true) => {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const targetIndex = (dayOfYear + indexOffset) % CURATED_DAILY_VERSES.length;
  const ref = CURATED_DAILY_VERSES[targetIndex];

  const meta = getBookMetaById(ref.book_id);
  const bookName = meta ? (isTa ? meta.name_ta : meta.name_en) : '';
  const verseRef = `${bookName} ${ref.chapter}:${ref.verse}`;

  const loadedVerse = getVerseByLocation(ref.book_id, ref.chapter, ref.verse);
  let text = '';
  if (loadedVerse) {
    text = isTa ? loadedVerse.text_ta : loadedVerse.text_en;
  } else {
    text = isTa ? ref.prompt_ta : ref.prompt_en;
  }

  return {
    verseRef,
    verseText: text,
    bookId: ref.book_id,
    chapter: ref.chapter,
    verse: ref.verse
  };
};

/**
 * Completely cancels and re-schedules active daily alarms
 * Uses native Android AlarmManager via @capacitor/local-notifications
 * Works 100% offline, when app is closed, and survives device reboots.
 */
export const rescheduleAllNotifications = async (
  config: NotificationScheduleConfig,
  appLang: AppLanguage = 'ta'
): Promise<void> => {
  // Cancel slot IDs (101-104), app open (201), and custom slot range (300-350)
  const allPossibleIds = [101, 102, 103, 104, 201];
  for (let i = 301; i <= 350; i++) {
    allPossibleIds.push(i);
  }

  if (isNativePlatform()) {
    try {
      await LocalNotifications.cancel({
        notifications: allPossibleIds.map((id) => ({ id }))
      });

      if (!config.enabled) {
        console.log('[NotificationService] Notifications disabled; all canceled.');
        return;
      }

      const permission = await getNotificationPermission();
      if (permission !== 'granted') {
        console.log('[NotificationService] Permission not granted; skip scheduling.');
        return;
      }

      const notificationsToSchedule = [];
      const isTa = appLang === 'ta';

      // 1. Standard Daily Slots
      const slots = Object.values(config.slots);
      let offset = 0;

      for (const slot of slots) {
        if (!slot.enabled) continue;

        const [hourStr, minStr] = slot.time.split(':');
        const hour = parseInt(hourStr, 10);
        const minute = parseInt(minStr, 10);

        if (isNaN(hour) || isNaN(minute)) continue;

        const { verseRef, verseText, bookId, chapter, verse } = getVerseForNotification(offset, isTa);
        offset++;

        const title = `📖 ${verseRef}`;
        const body = `${verseText}\n${isTa ? 'இன்றைய வேத வாசிப்பு நேரம் · தட்டவும்' : 'Today\'s Scripture reading time · Tap to read'}`;

        notificationsToSchedule.push({
          id: slot.id,
          title,
          body,
          schedule: {
            on: { hour, minute },
            allowWhileIdle: true
          },
          sound: undefined,
          smallIcon: 'ic_launcher',
          largeIcon: 'res://icon',
          extra: {
            slotKey: slot.key,
            bookId,
            chapter,
            verse,
            goalMinutes: config.goalMinutes
          }
        });
      }

      // 2. Custom Multiple Times
      if (Array.isArray(config.customTimes)) {
        for (const customSlot of config.customTimes) {
          if (!customSlot.enabled) continue;

          const [hourStr, minStr] = customSlot.time.split(':');
          const hour = parseInt(hourStr, 10);
          const minute = parseInt(minStr, 10);

          if (isNaN(hour) || isNaN(minute)) continue;

          const { verseRef, verseText, bookId, chapter, verse } = getVerseForNotification(offset, isTa);
          offset++;

          const label = isTa ? customSlot.labelTa : customSlot.labelEn;
          const title = `📖 ${verseRef} · ${label}`;
          const body = `${verseText}\n${isTa ? 'உங்கள் வேத தியான நேரம் · தட்டவும்' : 'Your personal Scripture time · Tap to read'}`;

          notificationsToSchedule.push({
            id: customSlot.id,
            title,
            body,
            schedule: {
              on: { hour, minute },
              allowWhileIdle: true
            },
            sound: undefined,
            smallIcon: 'ic_launcher',
            largeIcon: 'res://icon',
            extra: {
              slotKey: 'custom-multiple',
              bookId,
              chapter,
              verse,
              goalMinutes: config.goalMinutes
            }
          });
        }
      }

      if (notificationsToSchedule.length > 0) {
        await LocalNotifications.schedule({
          notifications: notificationsToSchedule
        });
        console.log(`[NotificationService] Scheduled ${notificationsToSchedule.length} native offline daily reminders.`);
      }
    } catch (err) {
      console.error('[NotificationService] Failed to schedule native local notifications:', err);
    }
  } else {
    console.log('[NotificationService] Web environment active; web intervals scheduled.');
  }
};

/**
 * Triggers an immediate notification for Admin push broadcasts or test alerts
 */
export const triggerInstantNotification = async (
  title: string,
  body: string,
  bookId?: number,
  chapter?: number,
  verse?: number
): Promise<void> => {
  const notifId = Math.floor(Math.random() * 800000) + 100000;

  if (isNativePlatform()) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notifId,
            title,
            body,
            schedule: { at: new Date(Date.now() + 500) },
            smallIcon: 'ic_launcher',
            largeIcon: 'res://icon',
            extra: { bookId, chapter, verse }
          }
        ]
      });
    } catch (err) {
      console.warn('Instant native notification error:', err);
    }
  } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        data: { bookId, chapter, verse }
      });
    } catch {
      // ignore
    }
  }
};

/**
 * Throttled App-Open reminder:
 * Triggers a subtle notification when user opens the app,
 * at most once every configured period (e.g. 2-3 hours),
 * without spamming the user.
 */
export const checkAppOpenReminder = async (appLang: AppLanguage = 'ta'): Promise<void> => {
  const config = getNotificationSchedule();
  if (!config.enabled || !config.appOpenReminderEnabled) return;

  const now = Date.now();
  const rawLast = localStorage.getItem(LAST_APP_OPEN_NOTIF_KEY);
  const lastTime = rawLast ? parseInt(rawLast, 10) : 0;
  const throttleMs = (config.appOpenFrequencyHours || 3) * 60 * 60 * 1000;

  if (now - lastTime < throttleMs) {
    return; // Throttled
  }

  localStorage.setItem(LAST_APP_OPEN_NOTIF_KEY, now.toString());

  const isTa = appLang === 'ta';
  const { verseRef, verseText, bookId, chapter, verse } = getVerseForNotification(0, isTa);

  const title = `📖 ${verseRef}`;
  const body = `${verseText}\n${isTa ? `இன்றைய ${config.goalMinutes} நிமிட வேத வாசிப்பை தொடங்குங்கள்.` : `Start your ${config.goalMinutes}-min Scripture reading today.`}`;

  if (isNativePlatform()) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 201,
            title,
            body,
            schedule: { at: new Date(Date.now() + 1500) },
            smallIcon: 'ic_launcher',
            largeIcon: 'res://icon',
            extra: { bookId, chapter, verse }
          }
        ]
      });
    } catch (e) {
      console.warn('App open notif failed:', e);
    }
  } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        data: { bookId, chapter, verse }
      });
    } catch {
      // ignore
    }
  }
};

/**
 * Web fallback background scheduler for desktop browsers
 */
let webInterval: any = null;

export const initNotificationScheduler = (appLang: AppLanguage = 'ta'): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  if (webInterval) clearInterval(webInterval);

  // Trigger app open check once on startup
  checkAppOpenReminder(appLang);

  // Setup Notification Click listener on native platform
  if (isNativePlatform()) {
    try {
      LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
        const extra = notificationAction.notification.extra;
        if (extra && extra.bookId && extra.chapter) {
          window.location.hash = `#/${extra.bookId}/${extra.chapter}${extra.verse ? `/${extra.verse}` : ''}`;
        }
      });
    } catch {
      // ignore
    }
  }

  if (!isNativePlatform()) {
    webInterval = setInterval(() => {
      const config = getNotificationSchedule();
      if (!config.enabled) return;
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();

      // Check standard slots
      for (const slot of Object.values(config.slots)) {
        if (!slot.enabled) continue;
        const [h, m] = slot.time.split(':').map(Number);
        if (h === currentH && m === currentM && now.getSeconds() < 10) {
          const isTa = appLang === 'ta';
          const { verseRef, verseText } = getVerseForNotification(0, isTa);
          try {
            new Notification(`📖 ${verseRef}`, {
              body: `${verseText}\n${isTa ? `இன்றைய ${config.goalMinutes} நிமிட வாசிப்பு நேரம் வந்துவிட்டது.` : `Your ${config.goalMinutes}-min Scripture time is here.`}`,
              icon: '/icon-192.png',
              badge: '/icon-192.png'
            });
          } catch {
            // ignore
          }
        }
      }

      // Check custom slots
      if (Array.isArray(config.customTimes)) {
        for (const customSlot of config.customTimes) {
          if (!customSlot.enabled) continue;
          const [h, m] = customSlot.time.split(':').map(Number);
          if (h === currentH && m === currentM && now.getSeconds() < 10) {
            const isTa = appLang === 'ta';
            const { verseRef, verseText } = getVerseForNotification(1, isTa);
            try {
              new Notification(`📖 ${verseRef}`, {
                body: `${verseText}\n${isTa ? 'தனிப்பயன் தியான நேரம் வந்துவிட்டது.' : 'Your custom meditation time is here.'}`,
                icon: '/icon-192.png',
                badge: '/icon-192.png'
              });
            } catch {
              // ignore
            }
          }
        }
      }
    }, 30000);
  }

  return () => {
    if (webInterval) clearInterval(webInterval);
  };
};
