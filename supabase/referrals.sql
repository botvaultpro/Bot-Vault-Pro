-- ============================================================
-- Referral Program Schema
-- Run this migration in your Supabase SQL editor
-- ============================================================

-- referral_codes: one unique code per user
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code         TEXT NOT NULL UNIQUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral_code" ON public.referral_codes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role full access referral_codes" ON public.referral_codes
  FOR ALL USING (auth.role() = 'service_role');

-- referrals: tracks who referred whom and reward status
CREATE TABLE IF NOT EXISTS public.referrals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code   TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending', -- pending | rewarded
  reward_type     TEXT DEFAULT 'free_month',       -- free_month | credit
  reward_amount   NUMERIC DEFAULT 0,
  rewarded_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(referred_id) -- one referral per referred user
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Service role full access referrals" ON public.referrals
  FOR ALL USING (auth.role() = 'service_role');

-- Index for fast lookup by code
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
