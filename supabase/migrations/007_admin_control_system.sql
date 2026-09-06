-- ==========================================================================
-- BIBLE APP: ADMIN CONTROL & REALTIME MANAGEMENT SCHEMA (PHASE 12)
-- Compatible with Supabase PostgreSQL & Row Level Security (RLS)
-- ==========================================================================

-- 1. GLOBAL ADMIN CONFIG TABLE
CREATE TABLE IF NOT EXISTS public.admin_config (
  id TEXT PRIMARY KEY DEFAULT 'global',
  verse_study_enabled BOOLEAN NOT NULL DEFAULT true,
  chapter_study_enabled BOOLEAN NOT NULL DEFAULT true,
  daily_revival_word_enabled BOOLEAN NOT NULL DEFAULT true,
  prayer_wall_enabled BOOLEAN NOT NULL DEFAULT true,
  audio_narration_enabled BOOLEAN NOT NULL DEFAULT true,
  allow_user_custom_notes BOOLEAN NOT NULL DEFAULT true,
  announcement_banner JSONB NOT NULL DEFAULT '{"enabled": false, "text_ta": "வேத தியானம் மற்றும் ஆவிக்குரிய வார்த்தைகள் உங்கள் ஆத்துமாவைத் திடப்படுத்தட்டும்!", "text_en": "Welcome! Deep verse study and daily revival words are now available in your Bible app.", "level": "info", "dismissible": true}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT DEFAULT 'Admin'
);

-- Seed initial global row if not present
INSERT INTO public.admin_config (id)
VALUES ('global')
ON CONFLICT (id) DO NOTHING;

-- 2. DAILY REVIVAL WORDS TABLE
CREATE TABLE IF NOT EXISTS public.admin_revival_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  book_id INTEGER NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  category TEXT NOT NULL DEFAULT 'faith',
  prompt_ta TEXT NOT NULL DEFAULT '',
  prompt_en TEXT NOT NULL DEFAULT '',
  special_theme TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'scheduled', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT DEFAULT 'Admin'
);

-- 3. CUSTOM THEOLOGICAL VERSE MEDITATIONS TABLE
CREATE TABLE IF NOT EXISTS public.custom_verse_meditations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id INTEGER NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  simple_explanation_ta TEXT DEFAULT '',
  simple_explanation_en TEXT DEFAULT '',
  deep_meaning_ta TEXT DEFAULT '',
  deep_meaning_en TEXT DEFAULT '',
  practical_application_ta TEXT DEFAULT '',
  practical_application_en TEXT DEFAULT '',
  prayer_ta TEXT DEFAULT '',
  prayer_en TEXT DEFAULT '',
  pastoral_note TEXT DEFAULT '',
  reflection_question_ta TEXT DEFAULT '',
  reflection_question_en TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT DEFAULT 'Admin',
  CONSTRAINT unique_custom_meditation_verse UNIQUE (book_id, chapter, verse)
);

-- 4. ADMIN AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'config',
  details TEXT NOT NULL DEFAULT '',
  admin_email TEXT NOT NULL DEFAULT 'Admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. UPDATE PROFILES TABLE FOR SUSPENSION & ROLES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT false;

-- 6. ENABLE ROW LEVEL SECURITY (RLS) & POLICIES
ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_revival_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_verse_meditations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow read for everyone (readers & admins get live config & meditations)
DROP POLICY IF EXISTS "Allow read admin_config" ON public.admin_config;
CREATE POLICY "Allow read admin_config" ON public.admin_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write admin_config" ON public.admin_config;
CREATE POLICY "Allow write admin_config" ON public.admin_config FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read admin_revival_words" ON public.admin_revival_words;
CREATE POLICY "Allow read admin_revival_words" ON public.admin_revival_words FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write admin_revival_words" ON public.admin_revival_words;
CREATE POLICY "Allow write admin_revival_words" ON public.admin_revival_words FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read custom_verse_meditations" ON public.custom_verse_meditations;
CREATE POLICY "Allow read custom_verse_meditations" ON public.custom_verse_meditations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write custom_verse_meditations" ON public.custom_verse_meditations;
CREATE POLICY "Allow write custom_verse_meditations" ON public.custom_verse_meditations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read admin_audit_logs" ON public.admin_audit_logs;
CREATE POLICY "Allow read admin_audit_logs" ON public.admin_audit_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write admin_audit_logs" ON public.admin_audit_logs;
CREATE POLICY "Allow write admin_audit_logs" ON public.admin_audit_logs FOR ALL USING (true) WITH CHECK (true);

-- 7. DATA API GRANTS
GRANT ALL ON TABLE public.admin_config TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.admin_revival_words TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.custom_verse_meditations TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.admin_audit_logs TO anon, authenticated, service_role;

-- 8. ENABLE SUPABASE REALTIME REPLICATION
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_config;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_revival_words;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_verse_meditations;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_audit_logs;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;
