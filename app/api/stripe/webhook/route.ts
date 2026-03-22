import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import Stripe from "stripe";
import {
  buildReviewBotPurchaseEmail,
  buildInvoiceForgeEmail,
  buildEmailCoachEmail,
  buildClauseCheckEmail,
  buildWeeklyPulseEmail,
  buildSiteBuilderEmail,
} from "@/lib/emails";
import { validateEnv } from "@/lib/env";
import { inngest } from "@/inngest/client";

validateEnv();

function getSupabase() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/** Map a Stripe price ID to bot_slug using env vars */
function getBotSlugFromPriceId(priceId: string): string | null {
  const map: Record<string, string> = {
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
  return map[priceId] ?? null;
}

function getTierFromPriceId(priceId: string): "starter" | "pro" {
  const proIds = [
    process.env.STRIPE_SITEBUILDER_PRO_PRICE_ID,
    process.env.STRIPE_REVIEWBOT_PRO_PRICE_ID,
    process.env.STRIPE_INVOICEFORGE_PRO_PRICE_ID,
    process.env.STRIPE_CLAUSECHECK_PRO_PRICE_ID,
    process.env.STRIPE_WEEKLYPULSE_PRO_PRICE_ID,
    process.env.STRIPE_EMAILCOACH_PRO_PRICE_ID,
  ];
  return proIds.includes(priceId) ? "pro" : "starter";
}

async function sendPurchaseEmail(
  botSlug: string,
  tier: string,
  userId: string,
  supabase: ReturnType<typeof getSupabase>
): Promise<void> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .single();

  if (!profile?.email) {
    console.error(`sendPurchaseEmail: no profile found for user ${userId}`);
    return;
  }

  const firstName = profile.full_name?.split(" ")[0] ?? "there";
  const toEmail = profile.email;

  const builders: Record<string, () => ReturnType<typeof buildReviewBotPurchaseEmail>> = {
    reviewbot: () => buildReviewBotPurchaseEmail(firstName, toEmail, tier),
    invoiceforge: () => buildInvoiceForgeEmail(firstName, toEmail, tier),
    emailcoach: () => buildEmailCoachEmail(firstName, toEmail, tier),
    clausecheck: () => buildClauseCheckEmail(firstName, toEmail, tier),
    weeklypulse: () => buildWeeklyPulseEmail(firstName, toEmail, tier),
    sitebuilder: () => buildSiteBuilderEmail(firstName, toEmail, tier),
  };

  const builder = builders[botSlug];
  if (!builder) {
    console.error(`sendPurchaseEmail: no email template for bot_slug "${botSlug}"`);
    return;
  }

  const payload = builder();
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send(payload);
  console.log(`Purchase email sent: ${botSlug} (${tier}) → ${toEmail}`);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error("Webhook: missing signature or secret");
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`Webhook received: ${event.type}`);
  const supabase = getSupabase();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const botSlug = session.metadata?.bot_slug;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!userId || !subscriptionId) {
          console.error("checkout.session.completed: missing user_id or subscription_id in metadata");
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;
        const resolvedBotSlug = botSlug ?? getBotSlugFromPriceId(priceId);
        const tier = getTierFromPriceId(priceId);

        if (!resolvedBotSlug) {
          console.error("checkout.session.completed: cannot determine bot_slug for price", priceId);
          break;
        }

        const { error: upsertError } = await supabase.from("bot_subscriptions").upsert({
          user_id: userId,
          bot_slug: resolvedBotSlug,
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: customerId,
          price_id: priceId,
          tier,
          status: "active",
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,bot_slug" });

        if (upsertError) {
          console.error("checkout.session.completed: upsert error", upsertError);
        } else {
          console.log(`checkout.session.completed: activated ${resolvedBotSlug} (${tier}) for user ${userId}`);
        }

        // Send purchase confirmation email — never block webhook on email failure
        sendPurchaseEmail(resolvedBotSlug, tier, userId, supabase).catch((err) =>
          console.error("Purchase email failed (non-fatal):", err)
        );

        // Fire Inngest event for post-subscription upsell sequence
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", userId)
          .single();
        if (profile?.email) {
          inngest.send({
            name: "user/subscribed",
            data: {
              userId,
              email: profile.email,
              name: profile.full_name ?? "",
              botSlug: resolvedBotSlug,
              tier,
            },
          }).catch((err) => console.error("Inngest user/subscribed event failed (non-fatal):", err));
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0].price.id;
        const botSlug = subscription.metadata?.bot_slug ?? getBotSlugFromPriceId(priceId);
        const tier = getTierFromPriceId(priceId);

        if (!botSlug) {
          console.error("customer.subscription.updated: cannot determine bot_slug for price", priceId);
          break;
        }

        const { error: updateErr } = await supabase.from("bot_subscriptions")
          .update({
            price_id: priceId,
            tier,
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (updateErr) {
          console.error("customer.subscription.updated: DB update error", updateErr);
        } else {
          console.log(`customer.subscription.updated: ${botSlug} status=${subscription.status}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const { error: deleteErr } = await supabase.from("bot_subscriptions")
          .update({
            status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (deleteErr) {
          console.error("customer.subscription.deleted: DB update error", deleteErr);
        } else {
          console.log(`customer.subscription.deleted: ${subscription.id}`);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        if (!subscriptionId) break;

        await supabase.from("bot_subscriptions")
          .update({ status: "active", updated_at: new Date().toISOString() })
          .eq("stripe_subscription_id", subscriptionId);

        console.log(`invoice.payment_succeeded: subscription ${subscriptionId} set active`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        if (!subscriptionId) break;

        await supabase.from("bot_subscriptions")
          .update({ status: "past_due", updated_at: new Date().toISOString() })
          .eq("stripe_subscription_id", subscriptionId);

        console.log(`invoice.payment_failed: subscription ${subscriptionId} set past_due`);
        break;
      }

      default:
        console.log(`Webhook: unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    // Always return 200 to prevent Stripe retries for non-signature errors
    console.error(`Webhook processing error for ${event.type}:`, err);
    return NextResponse.json({ received: true, warning: "Processing error — check logs" });
  }
}
