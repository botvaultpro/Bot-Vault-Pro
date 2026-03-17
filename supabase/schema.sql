-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Core tables
-- ============================================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Legacy single-plan subscriptions (kept for backwards compat)
CREATE TABLE public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'starter', 'growth', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Per-bot subscriptions (new model)
CREATE TABLE public.bot_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bot_slug TEXT NOT NULL CHECK (bot_slug IN ('sitebuilder','reviewbot','invoiceforge','clausecheck','weeklypulse','emailcoach')),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  price_id TEXT,
  tier TEXT NOT NULL DEFAULT 'starter' CHECK (tier IN ('starter', 'pro')),
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'canceled', 'past_due', 'trialing')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, bot_slug)
);

-- Free trials per user per bot
CREATE TABLE public.free_trials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bot_slug TEXT NOT NULL,
  uses INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, bot_slug)
);

-- Usage tracking table
CREATE TABLE public.usage_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bot TEXT NOT NULL,
  month_key TEXT NOT NULL, -- format: YYYY-MM
  count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, bot, month_key)
);

-- Bot run history
CREATE TABLE public.bot_runs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bot TEXT NOT NULL,
  input JSONB NOT NULL DEFAULT '{}',
  output TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Activity log (recent actions feed on dashboard home)
CREATE TABLE public.activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bot_slug TEXT NOT NULL,
  action TEXT NOT NULL,
  detail TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SiteBuilder Pro tables
-- ============================================================

CREATE TABLE public.site_previews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  location TEXT NOT NULL,
  current_website TEXT,
  html_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.proposals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  site_preview_id UUID REFERENCES public.site_previews(id) ON DELETE SET NULL,
  business_name TEXT NOT NULL,
  proposal_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.pipeline_leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  business_type TEXT,
  location TEXT,
  current_website TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  stage TEXT NOT NULL DEFAULT 'new_lead' CHECK (stage IN ('new_lead','site_generated','proposal_sent','follow_up','closed_won','closed_lost')),
  notes TEXT,
  site_preview_id UUID REFERENCES public.site_previews(id) ON DELETE SET NULL,
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EmailCoach tables
-- ============================================================

CREATE TABLE public.email_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  original_email TEXT NOT NULL,
  goal TEXT NOT NULL,
  context TEXT,
  reply_professional TEXT,
  reply_direct TEXT,
  reply_diplomatic TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WeeklyPulse tables
-- ============================================================

CREATE TABLE public.pulse_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_ending DATE NOT NULL,
  revenue NUMERIC,
  expenses NUMERIC,
  new_customers INTEGER,
  returning_customers INTEGER,
  refunds INTEGER,
  top_product TEXT,
  biggest_challenge TEXT,
  wins TEXT,
  industry TEXT,
  report_content TEXT,
  emailed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ClauseCheck tables
-- ============================================================

CREATE TABLE public.contract_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_name TEXT NOT NULL,
  document_text TEXT,
  context TEXT,
  summary TEXT,
  risk_flags JSONB,
  missing_protections JSONB,
  questions_to_ask JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- InvoiceForge tables
-- ============================================================

CREATE TABLE public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT,
  client_name TEXT,
  client_company TEXT,
  client_email TEXT,
  document_type TEXT NOT NULL DEFAULT 'invoice' CHECK (document_type IN ('invoice', 'proposal')),
  issue_date DATE,
  due_date DATE,
  line_items JSONB NOT NULL DEFAULT '[]',
  tax_rate NUMERIC DEFAULT 0,
  notes TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  total_amount NUMERIC,
  ai_scope TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ReviewBot tables
-- ============================================================

CREATE TABLE public.review_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  place_id TEXT,
  business_name TEXT,
  tone TEXT NOT NULL DEFAULT 'Professional' CHECK (tone IN ('Professional', 'Friendly', 'Grateful')),
  auto_publish BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  google_review_id TEXT,
  reviewer_name TEXT,
  rating INTEGER,
  review_text TEXT,
  review_date TIMESTAMPTZ,
  ai_reply TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, google_review_id)
);

-- ============================================================
-- Wishlist
-- ============================================================

CREATE TABLE public.wishlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL,
  request TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.free_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_previews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role full access profiles" ON public.profiles FOR ALL USING (auth.role() = 'service_role');

-- subscriptions
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role full access subscriptions" ON public.subscriptions FOR ALL USING (auth.role() = 'service_role');

-- bot_subscriptions
CREATE POLICY "Users can view own bot_subscriptions" ON public.bot_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role full access bot_subscriptions" ON public.bot_subscriptions FOR ALL USING (auth.role() = 'service_role');

-- free_trials
CREATE POLICY "Users can view own free_trials" ON public.free_trials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own free_trials" ON public.free_trials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own free_trials" ON public.free_trials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access free_trials" ON public.free_trials FOR ALL USING (auth.role() = 'service_role');

-- usage_tracking
CREATE POLICY "Users can view own usage" ON public.usage_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage" ON public.usage_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own usage" ON public.usage_tracking FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access usage" ON public.usage_tracking FOR ALL USING (auth.role() = 'service_role');

-- bot_runs
CREATE POLICY "Users can view own runs" ON public.bot_runs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own runs" ON public.bot_runs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role full access runs" ON public.bot_runs FOR ALL USING (auth.role() = 'service_role');

-- activity_log
CREATE POLICY "Users can view own activity" ON public.activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity" ON public.activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role full access activity" ON public.activity_log FOR ALL USING (auth.role() = 'service_role');

-- site_previews
CREATE POLICY "Users can view own site_previews" ON public.site_previews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own site_previews" ON public.site_previews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role full access site_previews" ON public.site_previews FOR ALL USING (auth.role() = 'service_role');

-- proposals
CREATE POLICY "Users can view own proposals" ON public.proposals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own proposals" ON public.proposals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role full access proposals" ON public.proposals FOR ALL USING (auth.role() = 'service_role');

-- pipeline_leads
CREATE POLICY "Users can view own pipeline_leads" ON public.pipeline_leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pipeline_leads" ON public.pipeline_leads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pipeline_leads" ON public.pipeline_leads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pipeline_leads" ON public.pipeline_leads FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access pipeline_leads" ON public.pipeline_leads FOR ALL USING (auth.role() = 'service_role');

-- email_replies
CREATE POLICY "Users can view own email_replies" ON public.email_replies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own email_replies" ON public.email_replies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role full access email_replies" ON public.email_replies FOR ALL USING (auth.role() = 'service_role');

-- pulse_reports
CREATE POLICY "Users can view own pulse_reports" ON public.pulse_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pulse_reports" ON public.pulse_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role full access pulse_reports" ON public.pulse_reports FOR ALL USING (auth.role() = 'service_role');

-- contract_analyses
CREATE POLICY "Users can view own contract_analyses" ON public.contract_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contract_analyses" ON public.contract_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role full access contract_analyses" ON public.contract_analyses FOR ALL USING (auth.role() = 'service_role');

-- invoices
CREATE POLICY "Users can view own invoices" ON public.invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own invoices" ON public.invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own invoices" ON public.invoices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access invoices" ON public.invoices FOR ALL USING (auth.role() = 'service_role');

-- review_configs
CREATE POLICY "Users can view own review_configs" ON public.review_configs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own review_configs" ON public.review_configs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own review_configs" ON public.review_configs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access review_configs" ON public.review_configs FOR ALL USING (auth.role() = 'service_role');

-- reviews
CREATE POLICY "Users can view own reviews" ON public.reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access reviews" ON public.reviews FOR ALL USING (auth.role() = 'service_role');

-- wishlist (public insert)
CREATE POLICY "Anyone can insert wishlist" ON public.wishlist FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can read wishlist" ON public.wishlist FOR SELECT USING (auth.role() = 'service_role');

-- ============================================================
-- Triggers
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');

  INSERT INTO public.subscriptions (user_id, tier, status)
  VALUES (NEW.id, 'free', 'active');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
