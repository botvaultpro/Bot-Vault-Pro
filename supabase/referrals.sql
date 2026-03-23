-- ============================================================
-- Referral Program + Demo Schema
-- Safe to re-run — all statements are idempotent
-- ============================================================

-- ── referral_codes ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code         TEXT NOT NULL UNIQUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own referral_code" ON public.referral_codes;
DROP POLICY IF EXISTS "Service role full access referral_codes" ON public.referral_codes;

CREATE POLICY "Users can view own referral_code" ON public.referral_codes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role full access referral_codes" ON public.referral_codes
  FOR ALL USING (auth.role() = 'service_role');

-- ── referrals ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.referrals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code   TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending', -- pending | rewarded
  reward_type     TEXT DEFAULT 'free_month',
  reward_amount   NUMERIC DEFAULT 0,
  rewarded_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(referred_id)
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own referrals" ON public.referrals;
DROP POLICY IF EXISTS "Service role full access referrals" ON public.referrals;

CREATE POLICY "Users can view own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Service role full access referrals" ON public.referrals
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);

-- ── demo_usage ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.demo_usage (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_slug      TEXT NOT NULL,
  ip_hash       TEXT,
  document_name TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.demo_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access demo_usage" ON public.demo_usage;

CREATE POLICY "Service role full access demo_usage" ON public.demo_usage
  FOR ALL USING (auth.role() = 'service_role');

-- ── demo_leads ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.demo_leads (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL UNIQUE,
  name       TEXT,
  source     TEXT NOT NULL DEFAULT 'demo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.demo_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access demo_leads" ON public.demo_leads;

CREATE POLICY "Service role full access demo_leads" ON public.demo_leads
  FOR ALL USING (auth.role() = 'service_role');
