import { supabase } from '../lib/supabase';
import { ActivityType, UserActivity } from '../types/bible';

let progressDebounceTimer: any = null;

/**
 * Tracks a meaningful user activity in Supabase `user_activity` table.
 * If user is not logged in or Supabase is unconfigured, this safely returns without error.
 */
export const trackActivity = async (
  userId: string | null | undefined,
  activityType: ActivityType,
  book?: string,
  chapter?: number,
  verse?: number,
  metadata: Record<string, any> = {}
): Promise<boolean> => {
  if (!userId || !supabase) return false;

  // Handle debouncing for READING_PROGRESS_UPDATED to avoid spamming the DB during scrolling
  if (activityType === 'READING_PROGRESS_UPDATED') {
    if (progressDebounceTimer) clearTimeout(progressDebounceTimer);
    return new Promise((resolve) => {
      progressDebounceTimer = setTimeout(async () => {
        const success = await executeInsertActivity(userId, activityType, book, chapter, verse, metadata);
        resolve(success);
      }, 3000); // 3-second debounce window for scroll/progress updates
    });
  }

  return executeInsertActivity(userId, activityType, book, chapter, verse, metadata);
};

const executeInsertActivity = async (
  userId: string,
  activityType: ActivityType,
  book?: string,
  chapter?: number,
  verse?: number,
  metadata: Record<string, any> = {}
): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const payload: UserActivity = {
      user_id: userId,
      activity_type: activityType,
      book: book ? book.toUpperCase() : undefined,
      chapter: chapter || undefined,
      verse: verse || undefined,
      metadata,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase.from('user_activity').insert(payload);

    if (error) {
      console.warn(`[Activity Track Fail] ${activityType}:`, error.message);
      return false;
    }

    console.log(`[Activity Tracked] ${activityType}`, book ? `${book} ${chapter}:${verse}` : '');
    return true;
  } catch (err) {
    console.error('[Activity Track Exception]:', err);
    return false;
  }
};
