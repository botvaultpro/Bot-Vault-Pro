import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // stripe_customer_id lives in bot_subscriptions, not subscriptions
  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: sub, error: subError } = await serviceSupabase
    .from("bot_subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .not("stripe_customer_id", "is", null)
    .limit(1)
    .maybeSingle();

  if (subError) {
    console.error("Portal: error fetching stripe_customer_id:", subError);
    return NextResponse.json({ error: "Failed to load billing account" }, { status: 500 });
  }

  if (!sub?.stripe_customer_id) {
    console.warn(`Portal: no stripe_customer_id found for user ${user.id}`);
    return NextResponse.json({ error: "No billing account found. Subscribe to a bot first." }, { status: 404 });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Portal: Stripe billingPortal.sessions.create failed:", err);
    return NextResponse.json({ error: "Failed to open billing portal" }, { status: 500 });
  }
}
