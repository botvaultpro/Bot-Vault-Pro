import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { priceId, botSlug, tier } = await req.json();
  if (!priceId || !botSlug) {
    return NextResponse.json({ error: "priceId and botSlug are required" }, { status: 400 });
  }

  // Use service client to check existing subscriptions across all bots
  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Find existing Stripe customer ID from any bot subscription
  const { data: existingSub } = await serviceSupabase
    .from("bot_subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .not("stripe_customer_id", "is", null)
    .limit(1)
    .maybeSingle();

  let customerId = existingSub?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
  }

  // Check if subscribing to this bot will bring total active bots to 3+
  const { data: activeSubs } = await serviceSupabase
    .from("bot_subscriptions")
    .select("bot_slug")
    .eq("user_id", user.id)
    .eq("status", "active");

  const activeSlugs = activeSubs?.map((s: { bot_slug: string }) => s.bot_slug) ?? [];
  const alreadyHasBot = activeSlugs.includes(botSlug);
  const newCount = alreadyHasBot ? activeSlugs.length : activeSlugs.length + 1;
  const applyBundle = newCount >= 3;

  const sessionParams: import("stripe").Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    metadata: {
      user_id: user.id,
      bot_slug: botSlug,
      tier: tier ?? "starter",
    },
  };

  // Apply BUNDLE20 coupon automatically when user will have 3+ bots
  if (applyBundle) {
    sessionParams.discounts = [{ coupon: "BUNDLE20" }];
  }

  const session = await stripe.checkout.sessions.create(sessionParams);
  return NextResponse.json({ url: session.url });
}
