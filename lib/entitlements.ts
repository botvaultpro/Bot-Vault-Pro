import { createClient } from "@supabase/supabase-js";

export type BotSlug =
  | "sitebuilder"
  | "reviewbot"
  | "invoiceforge"
  | "clausecheck"
  | "weeklypulse"
  | "emailcoach";

// Free trial allowances per bot (0 = no free trial, requires subscription)
export const FREE_TRIAL_LIMITS: Record<BotSlug, number> = {
  sitebuilder: 2,
  emailcoach: 3,
  weeklypulse: 2,
  clausecheck: 2,
  invoiceforge: 3,
  reviewbot: 3,
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

export type AccessResult = {
  access: boolean;
  reason: "subscribed" | "trial" | "expired";
  trialUsesRemaining: number;
};

/**
 * Returns access status with reason and remaining trial uses.
 * On first access for a trial-eligible bot, creates the free_trials row.
 *
 * Table schema: free_trials (user_id, bot_slug, uses_remaining, uses_total)
 */
export async function hasAccess(userId: string, botSlug: BotSlug): Promise<AccessResult> {
  if (!userId) return { access: false, reason: "expired", trialUsesRemaining: 0 };

  const supabase = getServiceSupabase();

  // Check 1: active paid subscription
  const { data: sub } = await supabase
    .from("bot_subscriptions")
    .select("status")
    .eq("user_id", userId)
    .eq("bot_slug", botSlug)
    .in("status", ["active", "trialing"])
    .maybeSingle();

  if (sub) return { access: true, reason: "subscribed", trialUsesRemaining: 999 };

  // Check 2: free trial
  const limit = FREE_TRIAL_LIMITS[botSlug];
  if (limit === 0) return { access: false, reason: "expired", trialUsesRemaining: 0 };

  const { data: trial, error: selectError } = await supabase
    .from("free_trials")
    .select("uses_remaining")
    .eq("user_id", userId)
    .eq("bot_slug", botSlug)
    .maybeSingle();

  if (selectError) {
    console.error(`hasAccess [${botSlug}]: free_trials select error:`, selectError);
    return { access: false, reason: "expired", trialUsesRemaining: 0 };
  }

  if (!trial) {
    // First visit — initialize the trial row and grant access
    const { error: insertError } = await supabase
      .from("free_trials")
      .insert({ user_id: userId, bot_slug: botSlug, uses_remaining: limit, uses_total: limit });

    if (insertError) {
      console.error(`hasAccess [${botSlug}]: free_trials insert error:`, insertError);
      return { access: false, reason: "expired", trialUsesRemaining: 0 };
    }
    return { access: true, reason: "trial", trialUsesRemaining: limit };
  }

  const remaining = trial.uses_remaining ?? 0;
  if (remaining > 0) return { access: true, reason: "trial", trialUsesRemaining: remaining };
  return { access: false, reason: "expired", trialUsesRemaining: 0 };
}

/**
 * Decrement uses_remaining by 1 (min 0).
 * Call this after every successful bot generation.
 */
export async function incrementTrial(userId: string, botSlug: BotSlug): Promise<void> {
  const supabase = getServiceSupabase();

  // Read current uses_remaining
  const { data, error: selectError } = await supabase
    .from("free_trials")
    .select("uses_remaining")
    .eq("user_id", userId)
    .eq("bot_slug", botSlug)
    .maybeSingle();

  if (selectError || !data) {
    console.error(`incrementTrial [${botSlug}]: could not fetch trial row`, selectError);
    return;
  }

  const newRemaining = Math.max(0, (data.uses_remaining ?? 0) - 1);

  const { error: updateError } = await supabase
    .from("free_trials")
    .update({ uses_remaining: newRemaining })
    .eq("user_id", userId)
    .eq("bot_slug", botSlug);

  if (updateError) {
    console.error(`incrementTrial [${botSlug}]: update error:`, updateError);
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
 * Returns remaining free trial uses for a bot (0 if no row yet = full limit available).
 */
export async function getTrialRemaining(userId: string, botSlug: BotSlug): Promise<number> {
  const limit = FREE_TRIAL_LIMITS[botSlug];
  if (limit === 0) return 0;

  const supabase = getServiceSupabase();
  const { data } = await supabase
    .from("free_trials")
    .select("uses_remaining")
    .eq("user_id", userId)
    .eq("bot_slug", botSlug)
    .maybeSingle();

  // If no row exists yet, the user still has their full allotment
  return data?.uses_remaining ?? limit;
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
