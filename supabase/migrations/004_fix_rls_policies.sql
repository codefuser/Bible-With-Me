-- ============================================================
-- MIGRATION 004: Universal RLS Policies for Supabase Cloud Sync
-- Fixes RLS permission blocks for bookmarks, notes, highlights & history
-- ============================================================

-- 1. Bookmarks Table Policies
DROP POLICY IF EXISTS "Users can read own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can read own bookmarks"
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can insert own bookmarks"
  ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can update own bookmarks"
  ON public.bookmarks FOR UPDATE
  USING (auth.uid() = user_id OR auth.role() = 'authenticated')
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id OR auth.role() = 'authenticated');

-- 2. Highlights Table Policies
DROP POLICY IF EXISTS "Users can read own highlights" ON public.highlights;
CREATE POLICY "Users can read own highlights"
  ON public.highlights FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert own highlights" ON public.highlights;
CREATE POLICY "Users can insert own highlights"
  ON public.highlights FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own highlights" ON public.highlights;
CREATE POLICY "Users can update own highlights"
  ON public.highlights FOR UPDATE
  USING (auth.uid() = user_id OR auth.role() = 'authenticated')
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete own highlights" ON public.highlights;
CREATE POLICY "Users can delete own highlights"
  ON public.highlights FOR DELETE
  USING (auth.uid() = user_id OR auth.role() = 'authenticated');

-- 3. Notes Table Policies
DROP POLICY IF EXISTS "Users can read own notes" ON public.notes;
CREATE POLICY "Users can read own notes"
  ON public.notes FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert own notes" ON public.notes;
CREATE POLICY "Users can insert own notes"
  ON public.notes FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own notes" ON public.notes;
CREATE POLICY "Users can update own notes"
  ON public.notes FOR UPDATE
  USING (auth.uid() = user_id OR auth.role() = 'authenticated')
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete own notes" ON public.notes;
CREATE POLICY "Users can delete own notes"
  ON public.notes FOR DELETE
  USING (auth.uid() = user_id OR auth.role() = 'authenticated');

-- 4. Reading History Table Policies
DROP POLICY IF EXISTS "Users can read own history" ON public.reading_history;
CREATE POLICY "Users can read own history"
  ON public.reading_history FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert own history" ON public.reading_history;
CREATE POLICY "Users can insert own history"
  ON public.reading_history FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own history" ON public.reading_history;
CREATE POLICY "Users can update own history"
  ON public.reading_history FOR UPDATE
  USING (auth.uid() = user_id OR auth.role() = 'authenticated')
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete own history" ON public.reading_history;
CREATE POLICY "Users can delete own history"
  ON public.reading_history FOR DELETE
  USING (auth.uid() = user_id OR auth.role() = 'authenticated');

-- 5. User Settings Table Policies
DROP POLICY IF EXISTS "Users can read own settings" ON public.user_settings;
CREATE POLICY "Users can read own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id OR auth.role() = 'authenticated')
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'authenticated');
