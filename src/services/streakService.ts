import { StreakData } from '../types/bible';
import { saveCloudStreakData } from './userDataService';

const STREAK_KEY = 'bible_app_streak_data';

const getTodayString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDaysAgoString = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const dayStr = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${dayStr}`;
};

export const getStoredStreakData = (): StreakData => {
  const defaultData: StreakData = {
    streak: 0,
    bestStreak: 0,
    lastReadDate: null,
    dailyGoal: 1,
    todayCount: 0,
    totalChapters: 0,
    calendarMap: {},
  };

  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return defaultData;

    const data: StreakData = JSON.parse(raw);
    const today = getTodayString();
    const yesterday = getDaysAgoString(1);
    const dayBeforeYesterday = getDaysAgoString(2);

    const calendarMap = data.calendarMap || {};
    const todayCount = calendarMap[today] || 0;

    let streak = data.streak || 0;

    // 1-day grace period check
    if (data.lastReadDate && data.lastReadDate !== today) {
      if (data.lastReadDate !== yesterday && data.lastReadDate !== dayBeforeYesterday) {
        streak = 0;
      }
    }

    return {
      ...defaultData,
      ...data,
      streak,
      todayCount,
      calendarMap,
    };
  } catch (err) {
    console.error('Error loading streak data:', err);
    return defaultData;
  }
};

export const saveStreakData = (data: StreakData, userId?: string | null): void => {
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
    if (userId) {
      saveCloudStreakData(userId, data);
    }
  } catch (err) {
    console.error('Error saving streak data:', err);
  }
};

/**
 * Called when a chapter reading is completed.
 * Updates todayCount, streak, bestStreak, totalChapters, and calendarMap.
 * Returns updated StreakData object.
 */
export const recordChapterCompletion = (userId?: string | null): StreakData => {
  const current = getStoredStreakData();
  const today = getTodayString();
  const yesterday = getDaysAgoString(1);
  const dayBeforeYesterday = getDaysAgoString(2);

  const prevTodayCount = current.calendarMap?.[today] || 0;
  const newTodayCount = prevTodayCount + 1;

  let newStreak = current.streak;

  // If first chapter read today
  if (current.lastReadDate !== today) {
    if (
      current.lastReadDate === yesterday ||
      current.lastReadDate === dayBeforeYesterday ||
      current.streak === 0
    ) {
      newStreak = current.streak + 1;
    } else {
      newStreak = 1;
    }
  }

  const newBestStreak = Math.max(current.bestStreak, newStreak);
  const newTotal = (current.totalChapters || 0) + 1;

  const newCalendarMap = {
    ...(current.calendarMap || {}),
    [today]: newTodayCount,
  };

  const updatedData: StreakData = {
    ...current,
    streak: newStreak,
    bestStreak: newBestStreak,
    lastReadDate: today,
    todayCount: newTodayCount,
    totalChapters: newTotal,
    calendarMap: newCalendarMap,
  };

  saveStreakData(updatedData, userId);
  return updatedData;
};

export const updateDailyGoal = (newGoal: number, userId?: string | null): StreakData => {
  const current = getStoredStreakData();
  const updated: StreakData = {
    ...current,
    dailyGoal: Math.max(1, Math.min(10, newGoal)),
  };
  saveStreakData(updated, userId);
  return updated;
};

