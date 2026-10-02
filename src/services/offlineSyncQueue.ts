import {
  upsertCloudBookmark,
  deleteCloudBookmark,
  upsertCloudHighlight,
  upsertCloudNote,
  upsertCloudSettings,
  upsertCloudHistory
} from './userDataService';
import { HighlightColor } from './highlightService';

export interface SyncQueueItem {
  id: string;
  userId: string;
  type:
    | 'BOOKMARK_ADD'
    | 'BOOKMARK_REMOVE'
    | 'HIGHLIGHT_SET'
    | 'NOTE_SAVE'
    | 'HISTORY_UPDATE'
    | 'SETTINGS_UPDATE';
  payload: any;
  createdAt: number;
  attempts: number;
}

const QUEUE_STORAGE_KEY = 'bible_app_offline_sync_queue';

/**
 * Retrieve current pending queue from localStorage
 */
export const getSyncQueue = (): SyncQueueItem[] => {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[offlineSyncQueue] Error reading queue from storage:', err);
    return [];
  }
};

/**
 * Persist queue to localStorage
 */
const saveSyncQueue = (queue: SyncQueueItem[]): void => {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('[offlineSyncQueue] Error saving queue to storage:', err);
  }
};

/**
 * Add a new mutation item to the offline sync queue
 */
export const addToSyncQueue = (
  item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'attempts'>
): void => {
  const queue = getSyncQueue();
  const newItem: SyncQueueItem = {
    ...item,
    id: `queue_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    attempts: 0
  };
  queue.push(newItem);
  saveSyncQueue(queue);
  console.log(`[offlineSyncQueue] Added item [${newItem.type}] to queue (total pending: ${queue.length})`);
};

/**
 * Check if there are pending items for a user
 */
export const hasPendingSync = (userId?: string): boolean => {
  const queue = getSyncQueue();
  if (!userId) return queue.length > 0;
  return queue.some((i) => i.userId === userId);
};

export const getPendingCount = (userId?: string): number => {
  const queue = getSyncQueue();
  if (!userId) return queue.length;
  return queue.filter((i) => i.userId === userId).length;
};

/**
 * Process and drain all pending queue items sequentially.
 * Only removes items that succeed in reaching Supabase.
 */
let isDraining = false;

export const drainSyncQueue = async (targetUserId?: string): Promise<boolean> => {
  if (isDraining) {
    console.log('[offlineSyncQueue] Drain already in progress, skipping duplicate call.');
    return false;
  }
  if (!navigator.onLine) {
    console.log('[offlineSyncQueue] Device is offline, skipping queue drain.');
    return false;
  }

  const queue = getSyncQueue();
  if (queue.length === 0) return true;

  isDraining = true;
  console.log(`[offlineSyncQueue] Starting drain of ${queue.length} items...`);

  const remainingQueue: SyncQueueItem[] = [];
  let drainedCount = 0;

  for (const item of queue) {
    // If targetUserId is specified, only drain matching items
    if (targetUserId && item.userId !== targetUserId) {
      remainingQueue.push(item);
      continue;
    }

    let success = false;
    try {
      switch (item.type) {
        case 'BOOKMARK_ADD': {
          const { bookCode, chapter, verse } = item.payload;
          success = await upsertCloudBookmark(item.userId, bookCode, chapter, verse);
          break;
        }
        case 'BOOKMARK_REMOVE': {
          const { bookCode, chapter, verse } = item.payload;
          success = await deleteCloudBookmark(item.userId, bookCode, chapter, verse);
          break;
        }
        case 'HIGHLIGHT_SET': {
          const { bookCode, chapter, verse, color } = item.payload;
          success = await upsertCloudHighlight(
            item.userId,
            bookCode,
            chapter,
            verse,
            color as HighlightColor
          );
          break;
        }
        case 'NOTE_SAVE': {
          const { bookCode, chapter, verse, content } = item.payload;
          success = await upsertCloudNote(item.userId, bookCode, chapter, verse, content);
          break;
        }
        case 'HISTORY_UPDATE': {
          const { bookCode, chapter, verse } = item.payload;
          success = await upsertCloudHistory(item.userId, bookCode, chapter, verse);
          break;
        }
        case 'SETTINGS_UPDATE': {
          success = await upsertCloudSettings(item.userId, item.payload);
          break;
        }
        default:
          console.warn('[offlineSyncQueue] Unknown queue item type:', item.type);
          success = true; // Drop unknown item
      }
    } catch (err) {
      console.warn(`[offlineSyncQueue] Failed processing item ${item.id}:`, err);
      success = false;
    }

    if (success) {
      drainedCount++;
    } else {
      // Keep item in queue for next drain cycle
      item.attempts += 1;
      // Drop item if it has failed more than 10 times to avoid eternal loop
      if (item.attempts < 10) {
        remainingQueue.push(item);
      } else {
        console.warn(`[offlineSyncQueue] Dropping item ${item.id} after 10 failed attempts.`);
      }
    }
  }

  saveSyncQueue(remainingQueue);
  isDraining = false;
  console.log(`[offlineSyncQueue] Drain complete: ${drainedCount} processed, ${remainingQueue.length} remaining.`);
  return remainingQueue.length === 0;
};
