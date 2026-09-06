// ==========================================================================
// DAILY BIBLE READING PUSH NOTIFICATIONS & HABIT REMINDER SERVICE
// ==========================================================================

const NOTIFICATION_SETTINGS_KEY = 'bible_notification_settings_v1';
const LAST_NOTIFIED_DATE_KEY = 'bible_notification_last_date_v1';

export interface NotificationSchedule {
  enabled: boolean;
  time: string; // "HH:MM" e.g. "07:00"
  goalMinutes: number; // e.g. 5, 15, 30
}

const DEFAULT_SCHEDULE: NotificationSchedule = {
  enabled: false,
  time: '07:00',
  goalMinutes: 5
};

export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return false;
  }
};

export const getNotificationSchedule = (): NotificationSchedule => {
  try {
    const raw = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SCHEDULE, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_SCHEDULE;
};

export const saveNotificationSchedule = (schedule: Partial<NotificationSchedule>): NotificationSchedule => {
  const current = getNotificationSchedule();
  const updated: NotificationSchedule = { ...current, ...schedule };
  try {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving notification schedule:', err);
  }
  return updated;
};

export const sendReadingReminder = (goalMinutes = 5): void => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;

  const todayStr = new Date().toISOString().split('T')[0];
  localStorage.setItem(LAST_NOTIFIED_DATE_KEY, todayStr);

  const title = `📖 Today's Scripture Time (${goalMinutes} Mins)`;
  const body = `Your ${goalMinutes}-minute spiritual nourishment is ready. Spend time in God's Word today and seal your daily streak!`;

  try {
    const notification = new Notification(title, {
      body,
      icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%232563eb%22 stroke-width=%222%22><path d=%22M4 19.5A2.5 2.5 0 0 1 6.5 17H20%22/><path d=%22M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z%22/></svg>',
      badge: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%232563eb%22><path d=%22M4 19.5A2.5 2.5 0 0 1 6.5 17H20%22/></svg>',
      tag: 'daily-bible-reading-reminder'
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (e) {
    console.warn('Native notification failed, falling back to service worker:', e);
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        title,
        body
      });
    }
  }
};

/**
 * Checks once every minute if current time matches scheduled reminder time.
 */
let schedulerInterval: number | null = null;

export const initNotificationScheduler = (): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  if (schedulerInterval) {
    clearInterval(schedulerInterval);
  }

  const checkSchedule = () => {
    const schedule = getNotificationSchedule();
    if (!schedule.enabled) return;
    if (getNotificationPermission() !== 'granted') return;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const lastNotified = localStorage.getItem(LAST_NOTIFIED_DATE_KEY);

    // Only notify once per calendar day
    if (lastNotified === todayStr) return;

    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;

    if (currentTimeStr === schedule.time) {
      sendReadingReminder(schedule.goalMinutes);
    }
  };

  // Check immediately, then every 45 seconds
  checkSchedule();
  schedulerInterval = window.setInterval(checkSchedule, 45000);

  return () => {
    if (schedulerInterval) {
      clearInterval(schedulerInterval);
      schedulerInterval = null;
    }
  };
};
