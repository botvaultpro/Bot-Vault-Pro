import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
import { inngest } from "@/inngest/client";

export async function POST(req: NextRequest) {
  let body: { email?: string; name?: string; source?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { email, name = "", source = "demo" } = body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  try {
    const supabase = getServiceClient();

    // Check if already a user — don't re-add to drip
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ok: true, existing: true });
    }

    // Upsert into demo_leads table (best-effort)
    await supabase
      .from("demo_leads")
      .upsert({ email, name, source, created_at: new Date().toISOString() }, { onConflict: "email" })
      .select();

    // Fire demo drip sequence
    await inngest
      .send({
        name: "user/demo.captured",
        data: { email, name, source },
      })
      .catch((err) => console.error("Inngest demo.captured failed (non-fatal):", err));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Email capture error:", err);
    // Non-fatal — still return ok to not block UX
    return NextResponse.json({ ok: true });
  }
}
