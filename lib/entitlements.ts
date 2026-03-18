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
 * Returns true if the user has an active subscription OR remaining free trial uses.
 * On first access for a trial-eligible bot, creates the free_trials row.
 */
export async function hasAccess(userId: string, botSlug: BotSlug): Promise<boolean> {
  const supabase = getServiceSupabase();

  // Check 1: active paid subscription
  const { data: sub } = await supabase
    .from("bot_subscriptions")
    .select("status")
    .eq("user_id", userId)
    .eq("bot_slug", botSlug)
    .in("status", ["active", "trialing"])
    .maybeSingle();

  if (sub) return true;

  // Check 2: free trial
  const limit = FREE_TRIAL_LIMITS[botSlug];
  if (limit === 0) return false;

  const { data: trial } = await supabase
    .from("free_trials")
    .select("uses")
    .eq("user_id", userId)
    .eq("bot_slug", botSlug)
    .maybeSingle();

  if (!trial) {
    // First time — create row and grant access
    await supabase
      .from("free_trials")
      .insert({ user_id: userId, bot_slug: botSlug, uses: 0 });
    return true;
  }

  return trial.uses < limit;
}

/**
 * Atomically increment trial use count using a Postgres RPC.
 * Safe against race conditions and always creates the row if missing.
 */
export async function incrementTrial(userId: string, botSlug: BotSlug): Promise<void> {
  const supabase = getServiceSupabase();
  const { error } = await supabase.rpc("increment_trial_uses", {
    p_user_id: userId,
    p_bot_slug: botSlug,
  });
  if (error) {
    console.error("incrementTrial RPC error:", error);
  }
}

/**
 * Increment trial only if the user is NOT actively subscribed.
 * Call this after every successful bot action.
 */
export async function incrementIfTrial(userId: string, botSlug: BotSlug): Promise<void> {
  const supabase = getServiceSupabase();
  const { data: sub } = await supabase
    .from("bot_subscriptions")
    .select("status")
    .eq("user_id", userId)
    .eq("bot_slug", botSlug)
    .in("status", ["active", "trialing"])
    .maybeSingle();

  if (sub) return; // subscribed — don't consume trial

  await incrementTrial(userId, botSlug);
}

/**
 * Returns remaining free trial uses for a bot.
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
    .maybeSingle();

  return Math.max(0, limit - (data?.uses ?? 0));
}

/**
 * Returns subscription tier ('pro', 'starter') or null if not subscribed.
 */
export async function getBotTier(userId: string, botSlug: BotSlug): Promise<"pro" | "starter" | null> {
  const supabase = getServiceSupabase();
  const { data } = await supabase
    .from("bot_subscriptions")
    .select("tier, status")
    .eq("user_id", userId)
    .eq("bot_slug", botSlug)
    .in("status", ["active", "trialing"])
    .maybeSingle();

  return (data?.tier as "pro" | "starter") ?? null;
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
