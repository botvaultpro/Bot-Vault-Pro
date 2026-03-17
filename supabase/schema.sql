-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
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

-- Usage tracking table
CREATE TABLE public.usage_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bot TEXT NOT NULL CHECK (bot IN ('leadgen', 'contentblast', 'supportdesk', 'sitebuilder')),
  month_key TEXT NOT NULL, -- format: YYYY-MM
  count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, bot, month_key)
);

-- Bot run history (for displaying past results)
CREATE TABLE public.bot_runs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bot TEXT NOT NULL CHECK (bot IN ('leadgen', 'contentblast', 'supportdesk', 'sitebuilder')),
  input JSONB NOT NULL DEFAULT '{}',
  output TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only see their own data
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own usage" ON public.usage_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage" ON public.usage_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own usage" ON public.usage_tracking FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own runs" ON public.bot_runs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own runs" ON public.bot_runs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can do everything (for webhooks/server-side)
CREATE POLICY "Service role full access profiles" ON public.profiles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access subscriptions" ON public.subscriptions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access usage" ON public.usage_tracking FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access runs" ON public.bot_runs FOR ALL USING (auth.role() = 'service_role');

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

-- Wishlist table (community-driven build requests)
CREATE TABLE public.wishlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL,
  request TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert wishlist" ON public.wishlist FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can read wishlist" ON public.wishlist FOR SELECT USING (auth.role() = 'service_role');

-- ============================================================
-- SiteBuilder Pro tables
-- ============================================================

-- Site previews: AI-generated HTML websites
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
ALTER TABLE public.site_previews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own site_previews" ON public.site_previews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own site_previews" ON public.site_previews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role full access site_previews" ON public.site_previews FOR ALL USING (auth.role() = 'service_role');

-- Proposals: AI-generated sales proposals
CREATE TABLE public.proposals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  site_preview_id UUID REFERENCES public.site_previews(id) ON DELETE SET NULL,
  business_name TEXT NOT NULL,
  proposal_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own proposals" ON public.proposals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own proposals" ON public.proposals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role full access proposals" ON public.proposals FOR ALL USING (auth.role() = 'service_role');

-- Pipeline leads: CRM Kanban for web design prospects
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
ALTER TABLE public.pipeline_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own pipeline_leads" ON public.pipeline_leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pipeline_leads" ON public.pipeline_leads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pipeline_leads" ON public.pipeline_leads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pipeline_leads" ON public.pipeline_leads FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access pipeline_leads" ON public.pipeline_leads FOR ALL USING (auth.role() = 'service_role');
