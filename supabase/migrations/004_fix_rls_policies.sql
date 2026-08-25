-- ============================================================
-- MIGRATION 004: Fix RLS UPDATE policies for Supabase Upserts
-- Allows Supabase upsert() calls to pass RLS WITH CHECK validation
-- ============================================================

-- 1. Bookmarks UPDATE policy fix
DROP POLICY IF EXISTS "Users can update own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can update own bookmarks"
  ON public.bookmarks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. User Settings UPDATE policy fix
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Highlights UPDATE policy fix
DROP POLICY IF EXISTS "Users can update own highlights" ON public.highlights;
CREATE POLICY "Users can update own highlights"
  ON public.highlights FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Notes UPDATE policy fix
DROP POLICY IF EXISTS "Users can update own notes" ON public.notes;
CREATE POLICY "Users can update own notes"
  ON public.notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Reading History UPDATE policy fix
DROP POLICY IF EXISTS "Users can update own history" ON public.reading_history;
CREATE POLICY "Users can update own history"
  ON public.reading_history FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Reading Progress UPDATE policy fix
DROP POLICY IF EXISTS "Users can update own progress" ON public.reading_progress;
CREATE POLICY "Users can update own progress"
  ON public.reading_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
