/**
 * One-time backfill script — run with:
 *   npx tsx scripts/backfill-subscriptions.ts
 *
 * Finds all completed Stripe checkout sessions and upserts
 * the corresponding bot_subscriptions rows in Supabase.
 * Safe to run multiple times (upsert on conflict).
 */

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" }); // fallback

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PRICE_TO_BOT: Record<string, string> = {
  [process.env.STRIPE_SITEBUILDER_STARTER_PRICE_ID!]: "sitebuilder",
  [process.env.STRIPE_SITEBUILDER_PRO_PRICE_ID!]: "sitebuilder",
  [process.env.STRIPE_REVIEWBOT_STARTER_PRICE_ID!]: "reviewbot",
  [process.env.STRIPE_REVIEWBOT_PRO_PRICE_ID!]: "reviewbot",
  [process.env.STRIPE_INVOICEFORGE_STARTER_PRICE_ID!]: "invoiceforge",
  [process.env.STRIPE_INVOICEFORGE_PRO_PRICE_ID!]: "invoiceforge",
  [process.env.STRIPE_CLAUSECHECK_STARTER_PRICE_ID!]: "clausecheck",
  [process.env.STRIPE_CLAUSECHECK_PRO_PRICE_ID!]: "clausecheck",
  [process.env.STRIPE_WEEKLYPULSE_STARTER_PRICE_ID!]: "weeklypulse",
  [process.env.STRIPE_WEEKLYPULSE_PRO_PRICE_ID!]: "weeklypulse",
  [process.env.STRIPE_EMAILCOACH_STARTER_PRICE_ID!]: "emailcoach",
  [process.env.STRIPE_EMAILCOACH_PRO_PRICE_ID!]: "emailcoach",
};

const PRO_PRICE_IDS = new Set([
  process.env.STRIPE_SITEBUILDER_PRO_PRICE_ID,
  process.env.STRIPE_REVIEWBOT_PRO_PRICE_ID,
  process.env.STRIPE_INVOICEFORGE_PRO_PRICE_ID,
  process.env.STRIPE_CLAUSECHECK_PRO_PRICE_ID,
  process.env.STRIPE_WEEKLYPULSE_PRO_PRICE_ID,
  process.env.STRIPE_EMAILCOACH_PRO_PRICE_ID,
]);

async function main() {
  console.log("=== Bot Vault Pro Subscription Backfill ===\n");

  // 1. Get all Supabase users
  const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();
  const emailToUserId = new Map(authUsers.map((u) => [u.email!, u.id]));
  console.log(`Found ${authUsers.length} Supabase user(s):`, authUsers.map((u) => u.email));

  // 2. List all completed Stripe checkout sessions (last 100)
  const sessions = await stripe.checkout.sessions.list({
    limit: 100,
    expand: ["data.subscription", "data.customer"],
  });

  console.log(`\nFound ${sessions.data.length} Stripe checkout session(s)\n`);

  let backfilled = 0;
  let skipped = 0;

  for (const session of sessions.data) {
    if (session.status !== "complete") {
      skipped++;
      continue;
    }

    const customerEmail =
      session.customer_details?.email ??
      (typeof session.customer === "object" && session.customer !== null && "email" in session.customer ? (session.customer as { email?: string | null }).email : null);

    const userId =
      session.metadata?.user_id ??
      (customerEmail ? emailToUserId.get(customerEmail) : null);

    const botSlug = session.metadata?.bot_slug;
    const tier = session.metadata?.tier ?? "starter";
    const subscriptionId = typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;
    const customerId = typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

    if (!userId || !subscriptionId) {
      console.log(`⚠ Skipping session ${session.id}: userId=${userId} subscriptionId=${subscriptionId}`);
      skipped++;
      continue;
    }

    // Resolve bot_slug and price_id from the subscription if not in metadata
    let resolvedBotSlug = botSlug;
    let resolvedTier = tier;
    let priceId: string | null = null;

    if (!resolvedBotSlug && subscriptionId) {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      priceId = sub.items.data[0]?.price.id ?? null;
      if (priceId) {
        resolvedBotSlug = PRICE_TO_BOT[priceId] ?? null;
        resolvedTier = PRO_PRICE_IDS.has(priceId) ? "pro" : "starter";
      }
    }

    if (!resolvedBotSlug) {
      console.log(`⚠ Cannot determine bot_slug for session ${session.id} — skipping`);
      skipped++;
      continue;
    }

    console.log(`→ Backfilling: email=${customerEmail} userId=${userId} bot=${resolvedBotSlug} tier=${resolvedTier}`);

    const { error } = await supabase.from("bot_subscriptions").upsert({
      user_id: userId,
      bot_slug: resolvedBotSlug,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId ?? null,
      price_id: priceId,
      tier: resolvedTier,
      status: "active",
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,bot_slug" });

    if (error) {
      console.error(`  ✗ Upsert failed:`, error.message);
    } else {
      console.log(`  ✓ Done`);
      backfilled++;
    }
  }

  console.log(`\n=== Complete: ${backfilled} upserted, ${skipped} skipped ===`);
}

main().catch(console.error);
