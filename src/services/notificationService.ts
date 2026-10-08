// ==========================================================================
// DAILY BIBLE READING NATIVE & LOCAL NOTIFICATIONS SERVICE
// Supports Offline Scheduled Reminders, Android System Alarms & App Language
// Multiple Custom Times, Verse with Reference (Erupidam) & App Logo
// ==========================================================================

import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { AppLanguage } from '../types/bible';
import { CURATED_DAILY_VERSES } from './dailyVerseService';
import { getBookMetaById, getVerseByLocation } from './csvBibleService';
import { getRevivalWordForDate } from './adminService';

const NOTIFICATION_SETTINGS_KEY = 'bible_notification_settings_v4';
const LAST_APP_OPEN_NOTIF_KEY = 'bible_last_app_open_notif_time';

export interface ReminderSlot {
  id: number;
  key: string;
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
  slots: Record<string, ReminderSlot>;
  customTimes: CustomReminderTime[];
}

export const DEFAULT_NOTIFICATION_CONFIG: NotificationScheduleConfig = {
  enabled: true,
  goalMinutes: 15,
  appOpenReminderEnabled: false,
  appOpenFrequencyHours: 3,
  slots: {
    midnight: {
      id: 101,
      key: 'midnight',
      nameEn: 'Midnight Watch (12:00 AM)',
      nameTa: 'நள்ளிரவு ஜெபம் / தியானம் (12:00 AM)',
      time: '00:00',
      enabled: true
    },
    dawn: {
      id: 102,
      key: 'dawn',
      nameEn: 'Early Dawn Watch (3:00 AM)',
      nameTa: 'அதிகாலை ஜாம தியானம் (3:00 AM)',
      time: '03:00',
      enabled: true
    },
    morning: {
      id: 103,
      key: 'morning',
      nameEn: 'Morning Devotional (6:00 AM)',
      nameTa: 'விடியற்காலை வேத வாசிப்பு (6:00 AM)',
      time: '06:00',
      enabled: true
    },
    forenoon: {
      id: 104,
      key: 'forenoon',
      nameEn: 'Morning Scripture (9:00 AM)',
      nameTa: 'காலை வேத தியானம் (9:00 AM)',
      time: '09:00',
      enabled: true
    },
    noon: {
      id: 105,
      key: 'noon',
      nameEn: 'Midday Meditation (12:00 PM)',
      nameTa: 'நண்பகல் வேத தியானம் (12:00 PM)',
      time: '12:00',
      enabled: true
    },
    afternoon: {
      id: 106,
      key: 'afternoon',
      nameEn: 'Afternoon Prayer (3:00 PM)',
      nameTa: 'பிற்பகல் வேத தியானம் (3:00 PM)',
      time: '15:00',
      enabled: true
    },
    evening: {
      id: 107,
      key: 'evening',
      nameEn: 'Evening Reflection (6:00 PM)',
      nameTa: 'மாலை வேத தியானம் (6:00 PM)',
      time: '18:00',
      enabled: true
    },
    night: {
      id: 108,
      key: 'night',
      nameEn: 'Night Devotional (9:00 PM)',
      nameTa: 'இரவு வேத தியானம் (9:00 PM)',
      time: '21:00',
      enabled: true
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
 * Loads saved notification settings with seamless backwards compatibility
 */
export const getNotificationSchedule = (): NotificationScheduleConfig => {
  try {
    const raw =
      localStorage.getItem(NOTIFICATION_SETTINGS_KEY) ||
      localStorage.getItem('bible_notification_settings_v3') ||
      localStorage.getItem('bible_notification_settings_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_NOTIFICATION_CONFIG,
        ...parsed,
        enabled: parsed.enabled !== undefined ? parsed.enabled : true,
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
    labelEn: `Custom Reminder ${current.customTimes.length + 1}`,
    labelTa: `தனிப்பயன் தியானம் ${current.customTimes.length + 1}`,
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
 * Helper to fetch a devotional verse with reference (erupidam) and text.
 * Integrates Admin Daily Revival Word as top priority for the day!
 */
export const getVerseForNotification = (indexOffset: number = 0, isTa: boolean = true) => {
  // 1. Check if Admin has scheduled a Daily Revival Word for today
  const todayStr = new Date().toISOString().split('T')[0];
  const adminOverride = getRevivalWordForDate(todayStr);

  let targetBookId = 43; // default John
  let targetChapter = 3;
  let targetVerse = 16;
  let isRevival = false;

  // Use Today's Admin Revival Word as the anchor verse for the primary morning devotional (offset 0)
  // and noon/evening key devotionals (offsets 2 and 4)
  if (adminOverride && (indexOffset === 0 || indexOffset === 2 || indexOffset === 4)) {
    targetBookId = adminOverride.book_id;
    targetChapter = adminOverride.chapter;
    targetVerse = adminOverride.verse;
    isRevival = true;
  } else {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const targetIndex = (dayOfYear + indexOffset) % CURATED_DAILY_VERSES.length;
    const ref = CURATED_DAILY_VERSES[targetIndex];
    targetBookId = ref.book_id;
    targetChapter = ref.chapter;
    targetVerse = ref.verse;
  }

  const meta = getBookMetaById(targetBookId);
  const bookName = meta ? (isTa ? meta.name_ta : meta.name_en) : '';
  const verseRef = `${bookName} ${targetChapter}:${targetVerse}`;

  const loadedVerse = getVerseByLocation(targetBookId, targetChapter, targetVerse);
  let text = '';
  if (loadedVerse) {
    text = isTa ? loadedVerse.text_ta : loadedVerse.text_en;
  } else if (adminOverride && isRevival) {
    text = isTa ? adminOverride.prompt_ta : adminOverride.prompt_en;
  } else {
    const ref = CURATED_DAILY_VERSES[0];
    text = isTa ? ref.prompt_ta : ref.prompt_en;
  }

  return {
    verseRef,
    verseText: text,
    bookId: targetBookId,
    chapter: targetChapter,
    verse: targetVerse,
    isRevival
  };
};

export const NOTIFICATION_CHANNEL_ID = 'bible_daily_reminders';

/**
 * Ensures the Android 8.0+ notification channel exists with high importance & heads-up display
 */
export const ensureNotificationChannel = async (): Promise<void> => {
  if (!isNativePlatform()) return;
  try {
    await LocalNotifications.createChannel({
      id: NOTIFICATION_CHANNEL_ID,
      name: 'Daily Scripture & Devotionals',
      description: 'Daily Bible verse alerts, revival words, and prayer reminder notifications',
      importance: 5, // High/Max importance for heads-up alert banner
      visibility: 1, // Public on lockscreen
      vibration: true,
      lights: true,
      lightColor: '#2563eb'
    });
  } catch (err) {
    console.warn('[NotificationService] Channel creation or check failed:', err);
  }
};

/**
 * Completely cancels and re-schedules active daily alarms
 * Uses native Android AlarmManager exact wake-up triggers via @capacitor/local-notifications
 * Works 100% offline, when app is closed, and survives device reboots.
 */
export const rescheduleAllNotifications = async (
  config: NotificationScheduleConfig,
  appLang: AppLanguage = 'ta'
): Promise<void> => {
  // Cancel slot IDs (101-115), app open (201), and custom slot range (300-350)
  const allPossibleIds: number[] = [];
  for (let i = 101; i <= 115; i++) allPossibleIds.push(i);
  allPossibleIds.push(201);
  for (let i = 301; i <= 350; i++) allPossibleIds.push(i);

  if (isNativePlatform()) {
    try {
      await ensureNotificationChannel();

      await LocalNotifications.cancel({
        notifications: allPossibleIds.map((id) => ({ id }))
      });

      if (!config.enabled) {
        console.log('[NotificationService] Notifications disabled; all canceled.');
        return;
      }

      let permission = await getNotificationPermission();
      if (permission !== 'granted') {
        const granted = await requestNotificationPermission();
        if (!granted) {
          console.log('[NotificationService] Permission not granted; skip scheduling.');
          return;
        }
        permission = 'granted';
      }

      const notificationsToSchedule = [];
      const isTa = appLang === 'ta';

      // 1. Standard Daily Slots (8 prayer watch intervals)
      const slots = Object.values(config.slots);
      let offset = 0;

      for (const slot of slots) {
        if (!slot.enabled) continue;

        const [hourStr, minStr] = slot.time.split(':');
        const hour = parseInt(hourStr, 10);
        const minute = parseInt(minStr, 10);

        if (isNaN(hour) || isNaN(minute)) continue;

        const { verseRef, verseText, bookId, chapter, verse, isRevival } = getVerseForNotification(offset, isTa);
        offset++;

        const slotLabel = isTa ? slot.nameTa : slot.nameEn;
        
        // Exact styling matching user reference (Title: App / Tamil Bible · Reference)
        const appPrefix = isTa ? 'வேதாகமம்' : 'Bible With Me';
        const titleBadge = isRevival ? (isTa ? 'இன்றைய எழுப்புதல் வார்த்தை' : "Today's Revival Word") : slotLabel;
        const title = `${appPrefix} · ${verseRef} · ${titleBadge}`;
        const body = `"${verseText}"`;
        const largeBody = `"${verseText}"\n\n✨ ${isTa ? 'தட்டி வாசிக்கவும் · பரிசுத்த வேதாகமம்' : 'Tap to read & meditate · Holy Bible'}`;
        const summaryText = `${verseRef} · ${isTa ? 'வேத தியானம்' : 'Scripture'}`;

        // CRITICAL NOTE for Capacitor LocalNotifications Android plugin:
        // When using `on: { hour, minute }`, do NOT include `every: 'day'` or `repeats: true`
        // because in Kotlin `LocalNotificationManager.kt`, `if (every != null)` is checked first,
        // which completely bypasses `on` and sets inexact 24-hour delays!
        // `on: { hour, minute }` with `allowWhileIdle: true` schedules the exact alarm at that hour:minute,
        // and TimedNotificationPublisher automatically reschedules the next day's alarm via CRON_KEY!
        notificationsToSchedule.push({
          id: slot.id,
          title,
          body,
          largeBody,
          summaryText,
          channelId: NOTIFICATION_CHANNEL_ID,
          schedule: {
            on: { hour, minute },
            allowWhileIdle: true
          },
          smallIcon: 'ic_stat_bible',
          iconColor: '#2563eb',
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
          const appPrefix = isTa ? 'வேதாகமம்' : 'Bible With Me';
          const title = `${appPrefix} · ${verseRef} · ${label}`;
          const body = `"${verseText}"`;
          const largeBody = `"${verseText}"\n\n✨ ${isTa ? 'தியானிக்க தட்டவும் · பரிசுத்த வேதாகமம்' : 'Tap to meditate · Holy Bible'}`;

          notificationsToSchedule.push({
            id: customSlot.id,
            title,
            body,
            largeBody,
            summaryText: `${verseRef}`,
            channelId: NOTIFICATION_CHANNEL_ID,
            schedule: {
              on: { hour, minute },
              allowWhileIdle: true
            },
            smallIcon: 'ic_stat_bible',
            iconColor: '#2563eb',
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
 * Triggers an immediate notification for Admin push broadcasts or instant alerts
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
      await ensureNotificationChannel();
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notifId,
            title,
            body,
            largeBody: body,
            channelId: NOTIFICATION_CHANNEL_ID,
            schedule: { at: new Date(Date.now() + 500) },
            smallIcon: 'ic_stat_bible',
            iconColor: '#2563eb',
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

  const title = `🕊️ ${verseRef} · ${isTa ? 'இன்றைய தேவ வார்த்தை' : 'Word of the Day'}`;
  const body = `"${verseText}"\n✨ ${isTa ? `இன்றைய ${config.goalMinutes} நிமிட வேத வாசிப்பை தொடங்குங்கள்.` : `Start your ${config.goalMinutes}-min Scripture reading today.`}`;

  if (isNativePlatform()) {
    try {
      await ensureNotificationChannel();
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 201,
            title,
            body,
            largeBody: body,
            channelId: NOTIFICATION_CHANNEL_ID,
            schedule: { at: new Date(Date.now() + 1500) },
            smallIcon: 'ic_stat_bible',
            iconColor: '#2563eb',
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

  // Setup Notification Channel & Schedule on startup automatically
  ensureNotificationChannel().then(() => {
    const config = getNotificationSchedule();
    if (config.enabled) {
      rescheduleAllNotifications(config, appLang);
    }
  });

  // Trigger app open check once on startup
  checkAppOpenReminder(appLang);

  // Setup Notification Click listener on native platform
  if (isNativePlatform()) {
    try {
      LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
        const extra = notificationAction.notification?.extra;
        if (extra && extra.bookId && extra.chapter) {
          const targetVerse = extra.verse || 1;
          try {
            sessionStorage.setItem(
              'pending_notification_verse',
              JSON.stringify({
                bookId: extra.bookId,
                chapter: extra.chapter,
                verse: targetVerse
              })
            );
          } catch {}

          // Update hash for deep link
          window.location.hash = `#/${extra.bookId}/${extra.chapter}/${targetVerse}`;

          // Dispatch direct navigation event so ReadingContext immediately jumps & pulses
          window.dispatchEvent(
            new CustomEvent('bible-notification-open', {
              detail: {
                bookId: extra.bookId,
                chapter: extra.chapter,
                verse: targetVerse
              }
            })
          );
        }
      });
    } catch {
      // ignore
    }
  }

  // Listen for admin revival word updates or admin notification changes to refresh schedules
  const handleAdminUpdate = () => {
    const config = getNotificationSchedule();
    if (config.enabled) {
      rescheduleAllNotifications(config, appLang);
    }
  };
  window.addEventListener('admin-revival-word-updated', handleAdminUpdate);
  window.addEventListener('admin-notification-updated', handleAdminUpdate);

  // Listen for app coming back into foreground
  let appStateSub: any = null;
  if (isNativePlatform()) {
    CapApp.addListener('appStateChange', (state) => {
      if (state.isActive) {
        const config = getNotificationSchedule();
        if (config.enabled) {
          rescheduleAllNotifications(config, appLang);
        }
      }
    }).then((sub) => {
      appStateSub = sub;
    });
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
          const { verseRef, verseText, bookId, chapter, verse } = getVerseForNotification(0, isTa);
          try {
            const notif = new Notification(`📖 ${verseRef}`, {
              body: `${verseText}\n${isTa ? `இன்றைய ${config.goalMinutes} நிமிட வாசிப்பு நேரம் வந்துவிட்டது.` : `Your ${config.goalMinutes}-min Scripture time is here.`}`,
              icon: '/icon-192.png',
              badge: '/icon-192.png',
              data: { bookId, chapter, verse }
            });
            notif.onclick = () => {
              window.focus();
              window.dispatchEvent(
                new CustomEvent('bible-notification-open', {
                  detail: { bookId, chapter, verse }
                })
              );
            };
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
            const { verseRef, verseText, bookId, chapter, verse } = getVerseForNotification(1, isTa);
            try {
              const notif = new Notification(`📖 ${verseRef}`, {
                body: `${verseText}\n${isTa ? 'தனிப்பயன் தியான நேரம் வந்துவிட்டது.' : 'Your custom meditation time is here.'}`,
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                data: { bookId, chapter, verse }
              });
              notif.onclick = () => {
                window.focus();
                window.dispatchEvent(
                  new CustomEvent('bible-notification-open', {
                    detail: { bookId, chapter, verse }
                  })
                );
              };
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
    window.removeEventListener('admin-revival-word-updated', handleAdminUpdate);
    window.removeEventListener('admin-notification-updated', handleAdminUpdate);
    if (appStateSub && typeof appStateSub.remove === 'function') {
      appStateSub.remove();
    }
  };
};

