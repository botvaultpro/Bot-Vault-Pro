-- ============================================================
-- Fix free_trials table + ensure all core tables exist
-- Safe to re-run — all statements are idempotent
-- Run this in Supabase SQL editor
-- ============================================================

-- ── Drop and recreate free_trials with correct column names ──
-- The original schema had column 'uses' but the app code uses
-- 'uses_remaining' and 'uses_total'. This migration fixes the mismatch.

DROP TABLE IF EXISTS public.free_trials;

CREATE TABLE public.free_trials (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bot_slug        TEXT NOT NULL,
  uses_remaining  INTEGER NOT NULL DEFAULT 0,
  uses_total      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, bot_slug)
);

ALTER TABLE public.free_trials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own free_trials" ON public.free_trials;
DROP POLICY IF EXISTS "Service role full access free_trials" ON public.free_trials;

CREATE POLICY "Users can view own free_trials" ON public.free_trials
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access free_trials" ON public.free_trials
  FOR ALL USING (auth.role() = 'service_role');

-- ── Ensure profiles table exists with correct shape ──────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role full access profiles" ON public.profiles
  FOR ALL USING (auth.role() = 'service_role');

-- ── Ensure bot_subscriptions table exists ────────────────────
CREATE TABLE IF NOT EXISTS public.bot_subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bot_slug                TEXT NOT NULL CHECK (bot_slug IN ('sitebuilder','reviewbot','invoiceforge','clausecheck','weeklypulse','emailcoach')),
  stripe_subscription_id  TEXT,
  stripe_customer_id      TEXT,
  price_id                TEXT,
  tier                    TEXT NOT NULL DEFAULT 'starter' CHECK (tier IN ('starter', 'pro')),
  status                  TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'canceled', 'past_due', 'trialing')),
  current_period_end      TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, bot_slug)
);

ALTER TABLE public.bot_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bot_subscriptions" ON public.bot_subscriptions;
DROP POLICY IF EXISTS "Service role full access bot_subscriptions" ON public.bot_subscriptions;

CREATE POLICY "Users can view own bot_subscriptions" ON public.bot_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access bot_subscriptions" ON public.bot_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- ── Ensure activity_log table exists ─────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bot_slug    TEXT NOT NULL,
  action      TEXT NOT NULL,
  detail      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own activity_log" ON public.activity_log;
DROP POLICY IF EXISTS "Service role full access activity_log" ON public.activity_log;

CREATE POLICY "Users can view own activity_log" ON public.activity_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access activity_log" ON public.activity_log
  FOR ALL USING (auth.role() = 'service_role');

-- ── Ensure contract_analyses table exists ────────────────────
CREATE TABLE IF NOT EXISTS public.contract_analyses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  summary       TEXT,
  risk_flags    JSONB DEFAULT '[]',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contract_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own contract_analyses" ON public.contract_analyses;
DROP POLICY IF EXISTS "Service role full access contract_analyses" ON public.contract_analyses;

CREATE POLICY "Users can view own contract_analyses" ON public.contract_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access contract_analyses" ON public.contract_analyses
  FOR ALL USING (auth.role() = 'service_role');

-- ── Ensure email_replies table exists ────────────────────────
CREATE TABLE IF NOT EXISTS public.email_replies (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_email TEXT,
  replies        JSONB DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.email_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own email_replies" ON public.email_replies;
DROP POLICY IF EXISTS "Service role full access email_replies" ON public.email_replies;

CREATE POLICY "Users can view own email_replies" ON public.email_replies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access email_replies" ON public.email_replies
  FOR ALL USING (auth.role() = 'service_role');

-- ── Ensure invoices table exists ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.invoices (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number TEXT,
  client_name    TEXT,
  client_email   TEXT,
  total_amount   NUMERIC DEFAULT 0,
  status         TEXT DEFAULT 'draft',
  data           JSONB DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Service role full access invoices" ON public.invoices;

CREATE POLICY "Users can view own invoices" ON public.invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access invoices" ON public.invoices
  FOR ALL USING (auth.role() = 'service_role');

-- ── Ensure pulse_reports table exists ────────────────────────
CREATE TABLE IF NOT EXISTS public.pulse_reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_data JSONB DEFAULT '{}',
  emailed_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pulse_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own pulse_reports" ON public.pulse_reports;
DROP POLICY IF EXISTS "Service role full access pulse_reports" ON public.pulse_reports;

CREATE POLICY "Users can view own pulse_reports" ON public.pulse_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access pulse_reports" ON public.pulse_reports
  FOR ALL USING (auth.role() = 'service_role');

-- ── Ensure site_previews table exists ────────────────────────
CREATE TABLE IF NOT EXISTS public.site_previews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT,
  html_content  TEXT,
  data          JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_previews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own site_previews" ON public.site_previews;
DROP POLICY IF EXISTS "Service role full access site_previews" ON public.site_previews;

CREATE POLICY "Users can view own site_previews" ON public.site_previews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access site_previews" ON public.site_previews
  FOR ALL USING (auth.role() = 'service_role');

-- ── Ensure pipeline_leads table exists ───────────────────────
CREATE TABLE IF NOT EXISTS public.pipeline_leads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT,
  contact_email TEXT,
  status        TEXT DEFAULT 'new',
  notes         TEXT,
  data          JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pipeline_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own pipeline_leads" ON public.pipeline_leads;
DROP POLICY IF EXISTS "Service role full access pipeline_leads" ON public.pipeline_leads;

CREATE POLICY "Users can view own pipeline_leads" ON public.pipeline_leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access pipeline_leads" ON public.pipeline_leads
  FOR ALL USING (auth.role() = 'service_role');

-- ── Profile auto-creation trigger ────────────────────────────
-- Creates a profile row automatically when a user signs up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_free_trials_user_bot ON public.free_trials(user_id, bot_slug);
CREATE INDEX IF NOT EXISTS idx_bot_subscriptions_user_bot ON public.bot_subscriptions(user_id, bot_slug);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON public.activity_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contract_analyses_user ON public.contract_analyses(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pulse_reports_user ON public.pulse_reports(user_id, created_at DESC);
