-- ============================================================
-- BIBLE APPLICATION DATABASE MIGRATION - PHASE 11
-- Activity Tracking & Extended Settings Schema
-- ============================================================

-- 1. ADD FONT PREFERENCES TO USER SETTINGS
ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS font_family_ta TEXT DEFAULT 'noto',
  ADD COLUMN IF NOT EXISTS font_family_en TEXT DEFAULT 'lora';

-- 2. CREATE USER ACTIVITY TABLE
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  book TEXT,
  chapter INTEGER,
  verse INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR ACTIVITY QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_user_activity_user_time ON public.user_activity(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON public.user_activity(user_id, activity_type);

-- ROW LEVEL SECURITY FOR USER ACTIVITY
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own activity"
  ON public.user_activity FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity"
  ON public.user_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);
