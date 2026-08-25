-- ============================================================
-- MIGRATION 003: Fix reading_history unique constraint
-- Changes: user_id+book+chapter+verse -> user_id+book+chapter
-- This allows re-reading same chapter to update the timestamp
-- instead of creating duplicate entries
-- ============================================================

-- Drop the old unique constraint (if exists)
ALTER TABLE public.reading_history
  DROP CONSTRAINT IF EXISTS unique_user_history;

-- Add new unique constraint on (user_id, book, chapter)
-- This means each user has one history record per book+chapter
-- Re-reading the same chapter just updates last_read_at via upsert
ALTER TABLE public.reading_history
  ADD CONSTRAINT unique_user_history_chapter UNIQUE (user_id, book, chapter);

-- Update index for the new constraint
DROP INDEX IF EXISTS idx_history_updated;
CREATE INDEX IF NOT EXISTS idx_history_updated ON public.reading_history(user_id, last_read_at DESC);

-- Note: After running this migration, update upsertCloudHistory calls
-- to use onConflict: 'user_id,book,chapter' instead of 'user_id,book,chapter,verse'
