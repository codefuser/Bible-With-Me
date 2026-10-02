// ==========================================================================
// DAILY BIBLE READING NATIVE & LOCAL NOTIFICATIONS SERVICE
// Supports Offline Scheduled Reminders, Android System Alarms & App Language
// ==========================================================================

import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { AppLanguage } from '../types/bible';

const NOTIFICATION_SETTINGS_KEY = 'bible_notification_settings_v2';
const LAST_APP_OPEN_NOTIF_KEY = 'bible_last_app_open_notif_time';

export interface ReminderSlot {
  id: number;
  key: 'morning' | 'afternoon' | 'night' | 'custom';
  nameEn: string;
  nameTa: string;
  time: string; // "HH:MM" 24h
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
      nameEn: 'Morning Reading',
      nameTa: 'விடியற்காலை வாசிப்பு',
      time: '06:00',
      enabled: true
    },
    afternoon: {
      id: 102,
      key: 'afternoon',
      nameEn: 'Midday Reminder',
      nameTa: 'மதிய வேத தியானம்',
      time: '12:30',
      enabled: false
    },
    night: {
      id: 103,
      key: 'night',
      nameEn: 'Night Devotional',
      nameTa: 'இரவு தியானம்',
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
  }
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
    const raw = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_NOTIFICATION_CONFIG,
        ...parsed,
        slots: {
          ...DEFAULT_NOTIFICATION_CONFIG.slots,
          ...(parsed.slots || {})
        }
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
    }
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
 * Completely cancels and re-schedules active daily alarms
 * Uses native Android AlarmManager via @capacitor/local-notifications
 * Works 100% offline, when app is closed, and survives device reboots.
 */
export const rescheduleAllNotifications = async (
  config: NotificationScheduleConfig,
  appLang: AppLanguage = 'ta'
): Promise<void> => {
  const slotIds = [101, 102, 103, 104, 201]; // 201 is app-open reminder

  if (isNativePlatform()) {
    try {
      // 1. Cancel all existing alarms to avoid duplicates
      await LocalNotifications.cancel({
        notifications: slotIds.map((id) => ({ id }))
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

      // 2. Schedule each enabled daily slot
      const notificationsToSchedule = [];
      const slots = Object.values(config.slots);

      for (const slot of slots) {
        if (!slot.enabled) continue;

        const [hourStr, minStr] = slot.time.split(':');
        const hour = parseInt(hourStr, 10);
        const minute = parseInt(minStr, 10);

        if (isNaN(hour) || isNaN(minute)) continue;

        const isTa = appLang === 'ta';
        const title = isTa
          ? `📖 ${slot.nameTa}`
          : `📖 ${slot.nameEn}`;
        const body = isTa
          ? `இன்றைய ${config.goalMinutes} நிமிட வேத வாசிப்பு நேரம் வந்துவிட்டது. இறைவார்த்தையை தியானியுங்கள்!`
          : `Your ${config.goalMinutes}-minute Scripture time is here. Keep your reading streak alive!`;

        notificationsToSchedule.push({
          id: slot.id,
          title,
          body,
          schedule: {
            on: {
              hour,
              minute
            },
            allowWhileIdle: true
          },
          sound: undefined,
          smallIcon: 'ic_launcher',
          extra: {
            slotKey: slot.key,
            goalMinutes: config.goalMinutes
          }
        });
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
    console.log('[NotificationService] Running in web environment; fallback interval active.');
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
  const title = isTa ? '📖 வேத வாசிப்பை தொடங்குங்கள்' : '📖 Continue Your Bible Reading';
  const body = isTa
    ? `இன்றைய ${config.goalMinutes} நிமிட இலக்கை நோக்கி வாசிக்க ஆரம்பியுங்கள்.`
    : `Open God's Word today and reach your ${config.goalMinutes}-minute goal.`;

  if (isNativePlatform()) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 201,
            title,
            body,
            schedule: { at: new Date(Date.now() + 1500) },
            smallIcon: 'ic_launcher'
          }
        ]
      });
    } catch (e) {
      console.warn('App open notif failed:', e);
    }
  } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, { body });
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

  if (!isNativePlatform()) {
    webInterval = setInterval(() => {
      const config = getNotificationSchedule();
      if (!config.enabled) return;
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();

      for (const slot of Object.values(config.slots)) {
        if (!slot.enabled) continue;
        const [h, m] = slot.time.split(':').map(Number);
        if (h === currentH && m === currentM && now.getSeconds() < 10) {
          const isTa = appLang === 'ta';
          try {
            new Notification(isTa ? `📖 ${slot.nameTa}` : `📖 ${slot.nameEn}`, {
              body: isTa
                ? `இன்றைய ${config.goalMinutes} நிமிட வேத வாசிப்பு நேரம் வந்துவிட்டது.`
                : `Your ${config.goalMinutes}-minute Bible reading time is here.`
            });
          } catch {
            // ignore
          }
        }
      }
    }, 30000);
  }

  return () => {
    if (webInterval) clearInterval(webInterval);
  };
};
