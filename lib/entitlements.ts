import { createClient } from "@supabase/supabase-js";

export type BotSlug =
  | "sitebuilder"
  | "reviewbot"
  | "invoiceforge"
  | "clausecheck"
  | "weeklypulse"
  | "emailcoach";

// Free trial allowances per bot (0 = no free trial)
export const FREE_TRIAL_LIMITS: Record<BotSlug, number> = {
  sitebuilder: 2,
  emailcoach: 3,
  weeklypulse: 3,
  clausecheck: 1,
  invoiceforge: 3,
  reviewbot: 0,
};

export const BOT_NAMES: Record<BotSlug, string> = {
  sitebuilder: "SiteBuilder Pro",
  reviewbot: "ReviewBot",
  invoiceforge: "InvoiceForge",
  clausecheck: "ClauseCheck",
  weeklypulse: "WeeklyPulse",
  emailcoach: "EmailCoach",
};

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Returns true if the user has an active subscription OR remaining free trial uses for the bot.
 */
export async function hasAccess(userId: string, botSlug: BotSlug): Promise<boolean> {
  const supabase = getServiceSupabase();

  // Check active subscription
  const { data: sub } = await supabase
    .from("bot_subscriptions")
    .select("status")
    .eq("user_id", userId)
    .eq("bot_slug", botSlug)
    .single();

  if (sub?.status === "active" || sub?.status === "trialing") return true;

  // Check free trial
  const limit = FREE_TRIAL_LIMITS[botSlug];
  if (limit === 0) return false;

  const { data: trial } = await supabase
    .from("free_trials")
    .select("uses")
    .eq("user_id", userId)
    .eq("bot_slug", botSlug)
    .single();

  const used = trial?.uses ?? 0;
  return used < limit;
}

/**
 * Returns remaining free trial uses for a bot (ignores subscription status).
 */
export async function getTrialRemaining(userId: string, botSlug: BotSlug): Promise<number> {
  const limit = FREE_TRIAL_LIMITS[botSlug];
  if (limit === 0) return 0;

  const supabase = getServiceSupabase();
  const { data } = await supabase
    .from("free_trials")
    .select("uses")
    .eq("user_id", userId)
    .eq("bot_slug", botSlug)
    .single();

  return Math.max(0, limit - (data?.uses ?? 0));
}

/**
 * Increment free trial use count for a bot.
 */
export async function incrementTrialUse(userId: string, botSlug: BotSlug): Promise<void> {
  const supabase = getServiceSupabase();
  const { data } = await supabase
    .from("free_trials")
    .select("id, uses")
    .eq("user_id", userId)
    .eq("bot_slug", botSlug)
    .single();

  if (data) {
    await supabase
      .from("free_trials")
      .update({ uses: data.uses + 1 })
      .eq("id", data.id);
  } else {
    await supabase
      .from("free_trials")
      .insert({ user_id: userId, bot_slug: botSlug, uses: 1 });
  }
}

/**
 * Check subscription tier for a bot (returns 'pro', 'starter', or null if not subscribed).
 */
export async function getBotTier(userId: string, botSlug: BotSlug): Promise<"pro" | "starter" | null> {
  const supabase = getServiceSupabase();
  const { data } = await supabase
    .from("bot_subscriptions")
    .select("tier, status")
    .eq("user_id", userId)
    .eq("bot_slug", botSlug)
    .single();

  if (data?.status === "active" || data?.status === "trialing") {
    return data.tier as "pro" | "starter";
  }
  return null;
}

/**
 * Log an activity for the dashboard feed.
 */
export async function logActivity(
  userId: string,
  botSlug: string,
  action: string,
  detail?: string
): Promise<void> {
  const supabase = getServiceSupabase();
  await supabase.from("activity_log").insert({
    user_id: userId,
    bot_slug: botSlug,
    action,
    detail: detail ?? null,
  });
}
