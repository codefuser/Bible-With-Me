-- ==========================================================================
-- BIBLE APP: USER ONBOARDING, READING GOALS & ACTIVE TIMER SESSIONS (PHASE 13)
-- Compatible with Supabase PostgreSQL & Row Level Security (RLS)
-- ==========================================================================

-- 1. ADD ONBOARDING & READING PREFERENCE COLUMNS TO USER_SETTINGS
ALTER TABLE public.user_settings 
  ADD COLUMN IF NOT EXISTS daily_goal_minutes INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS reminder_time TEXT DEFAULT '07:00',
  ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- 2. DAILY READING SESSIONS TABLE (Tracks active minutes and completed streak goals)
CREATE TABLE IF NOT EXISTS public.daily_reading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  target_minutes INTEGER NOT NULL DEFAULT 5,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_daily_session UNIQUE (user_id, session_date)
);

-- Index for speedy streak & history lookup
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_date 
  ON public.daily_reading_sessions(user_id, session_date DESC);

-- 3. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.daily_reading_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own daily sessions" ON public.daily_reading_sessions;
CREATE POLICY "Users can read own daily sessions"
  ON public.daily_reading_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upsert own daily sessions" ON public.daily_reading_sessions;
CREATE POLICY "Users can upsert own daily sessions"
  ON public.daily_reading_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. DATA API GRANTS
GRANT ALL ON TABLE public.daily_reading_sessions TO anon, authenticated, service_role;

-- 5. ENABLE SUPABASE REALTIME REPLICATION (For multi-device streak sync)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_reading_sessions;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;
