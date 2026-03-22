import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

function getServiceSupabase() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function generateCode(userId: string): string {
  // Short deterministic-ish code: first 4 chars of userId + 4 random chars
  const prefix = userId.replace(/-/g, "").substring(0, 4).toUpperCase();
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${suffix}`;
}

// GET /api/referral — get or create the user's referral code + stats
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const service = getServiceSupabase();

  // Get or create referral code
  let { data: codeRow } = await service
    .from("referral_codes")
    .select("code")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!codeRow) {
    const code = generateCode(user.id);
    const { data: inserted, error } = await service
      .from("referral_codes")
      .insert({ user_id: user.id, code })
      .select("code")
      .single();

    if (error) {
      // Race condition — try fetching again
      const { data: retried } = await service
        .from("referral_codes")
        .select("code")
        .eq("user_id", user.id)
        .maybeSingle();
      codeRow = retried;
    } else {
      codeRow = inserted;
    }
  }

  if (!codeRow) {
    return NextResponse.json({ error: "Could not get referral code" }, { status: 500 });
  }

  // Get referral stats
  const { data: referrals } = await service
    .from("referrals")
    .select("status, created_at, rewarded_at")
    .eq("referrer_id", user.id);

  const total = referrals?.length ?? 0;
  const rewarded = referrals?.filter((r) => r.status === "rewarded").length ?? 0;
  const pending = total - rewarded;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://botvaultpro.com";

  return NextResponse.json({
    code: codeRow.code,
    referralLink: `${appUrl}/ref/${codeRow.code}`,
    stats: { total, rewarded, pending },
  });
}

// POST /api/referral/track — called on signup when a ref code is present
// Body: { referralCode: string }
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { referralCode } = await req.json();
  if (!referralCode) return NextResponse.json({ error: "referralCode required" }, { status: 400 });

  const service = getServiceSupabase();

  // Resolve referral code to referrer
  const { data: codeRow } = await service
    .from("referral_codes")
    .select("user_id")
    .eq("code", referralCode.toUpperCase())
    .maybeSingle();

  if (!codeRow) {
    return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
  }

  if (codeRow.user_id === user.id) {
    return NextResponse.json({ error: "Cannot refer yourself" }, { status: 400 });
  }

  // Insert referral (ignore duplicate — referred user can only be referred once)
  const { error } = await service
    .from("referrals")
    .insert({
      referrer_id: codeRow.user_id,
      referred_id: user.id,
      referral_code: referralCode.toUpperCase(),
      status: "pending",
    });

  if (error && !error.message.includes("duplicate") && !error.message.includes("unique")) {
    console.error("Referral insert error:", error);
    return NextResponse.json({ error: "Failed to record referral" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
