import { createClient } from "@/lib/supabase/server";
import { TIER_LIMITS, type Tier } from "@/lib/tier-limits";

type BotType = "leadgen" | "contentblast" | "supportdesk" | "sitebuilder";

export async function getUserTier(userId: string): Promise<Tier> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("tier")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();
  return (data?.tier as Tier) ?? "free";
}

export async function checkAndIncrementUsage(
  userId: string,
  bot: BotType,
  tier: Tier
): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = await createClient();
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const { data: usage } = await supabase
    .from("usage_tracking")
    .select("*")
    .eq("user_id", userId)
    .eq("bot", bot)
    .eq("month_key", monthKey)
    .single();

  const limits = TIER_LIMITS[tier];
  let limit = 0;
  if (bot === "leadgen") limit = limits.leadgen.leadsPerRun;
  if (bot === "contentblast") limit = limits.contentblast.blastsPerMonth;
  if (bot === "supportdesk") limit = limits.supportdesk.ticketsPerMonth;
  if (bot === "sitebuilder") limit = limits.sitebuilder.prospectsPerMonth;

  const currentCount = usage?.count ?? 0;

  if (currentCount >= limit) {
    return {
      allowed: false,
      reason: `You've reached your ${tier} plan limit of ${limit} for ${bot} this month. Upgrade to continue.`,
    };
  }

  if (usage) {
    await supabase
      .from("usage_tracking")
      .update({ count: currentCount + 1, updated_at: now.toISOString() })
      .eq("id", usage.id);
  } else {
    await supabase.from("usage_tracking").insert({
      user_id: userId,
      bot,
      month_key: monthKey,
      count: 1,
    });
  }

  return { allowed: true };
}

export async function getMonthlyUsage(userId: string) {
  const supabase = await createClient();
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const { data } = await supabase
    .from("usage_tracking")
    .select("bot, count")
    .eq("user_id", userId)
    .eq("month_key", monthKey);

  const usage: Record<string, number> = {
    leadgen: 0,
    contentblast: 0,
    supportdesk: 0,
    sitebuilder: 0,
  };

  data?.forEach((row) => {
    usage[row.bot] = row.count;
  });

  return usage;
}
