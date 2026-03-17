import { inngest } from "./client";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { Resend } from "resend";

function getSupabase() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

// ============================================================
// Welcome Email — fires when a new user signs up
// ============================================================

export const sendWelcomeEmail = inngest.createFunction(
  { id: "send-welcome-email", name: "Send Welcome Email" },
  { event: "user/signed.up" },
  async ({ event }) => {
    const { email, name } = event.data;
    const resend = getResend();

    const firstName = name ? name.split(" ")[0] : "there";

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "noreply@botvaultpro.com",
      to: email,
      subject: "Welcome to Bot Vault Pro — Here's How To Start",
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a14;font-family:'Segoe UI',Arial,sans-serif;color:#e2e8f0;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:28px;font-weight:800;margin:0;">
        <span style="color:#22d3ee;">Bot</span><span style="color:#e2e8f0;"> Vault Pro</span>
      </h1>
    </div>

    <div style="background:#141424;border:1px solid #2a2a3e;border-radius:16px;padding:32px;">
      <h2 style="font-size:22px;font-weight:700;margin:0 0 8px;">Welcome, ${firstName}! 👋</h2>
      <p style="color:#94a3b8;margin:0 0 24px;line-height:1.6;">
        You're in. Bot Vault Pro gives you 6 AI-powered automation tools to run your business smarter.
        Here's a quick overview of what's waiting for you:
      </p>

      <div style="space-y:12px;">
        ${[
          { name: "SiteBuilder Pro", desc: "Generate complete AI websites and sales proposals in minutes.", color: "#22c55e" },
          { name: "ReviewBot", desc: "Monitor Google reviews and auto-reply with AI.", color: "#facc15" },
          { name: "InvoiceForge", desc: "Create professional invoices and project proposals.", color: "#60a5fa" },
          { name: "ClauseCheck", desc: "Upload any contract and get instant AI risk analysis.", color: "#fb923c" },
          { name: "WeeklyPulse", desc: "Get your weekly business health report every Monday.", color: "#c084fc" },
          { name: "EmailCoach", desc: "Get 3 AI reply options for any difficult email.", color: "#22d3ee" },
        ].map((bot) => `
          <div style="background:#0f0f1f;border:1px solid #2a2a3e;border-radius:12px;padding:16px;margin-bottom:12px;">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:8px;height:8px;border-radius:50%;background:${bot.color};flex-shrink:0;"></div>
              <div>
                <p style="margin:0;font-weight:700;color:#e2e8f0;">${bot.name}</p>
                <p style="margin:0;font-size:14px;color:#94a3b8;">${bot.desc}</p>
              </div>
            </div>
          </div>
        `).join("")}
      </div>

      <div style="margin-top:32px;text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing" style="display:inline-block;background:#22d3ee;color:#0a0a14;padding:14px 32px;border-radius:12px;font-weight:700;text-decoration:none;font-size:16px;">
          ⚡ Subscribe to Bots
        </a>
        <p style="margin-top:12px;font-size:13px;color:#94a3b8;">
          Or <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="color:#22d3ee;">go to your dashboard</a> to explore.
        </p>
      </div>
    </div>

    <p style="text-align:center;font-size:13px;color:#4a5568;margin-top:24px;">
      Bot Vault Pro · <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#22d3ee;">botvaultpro.com</a>
    </p>
  </div>
</body>
</html>
      `,
    });

    return { sent: true, email };
  }
);

// ============================================================
// WeeklyPulse Monday Email — fires every Monday at 8am CST
// ============================================================

export const weeklyPulseEmail = inngest.createFunction(
  {
    id: "weekly-pulse-email",
    name: "WeeklyPulse Monday Email",
  },
  { cron: "0 14 * * 1" }, // 8am CST = 14:00 UTC on Monday
  async () => {
    const supabase = getSupabase();
    const resend = getResend();

    // Find all active WeeklyPulse subscribers
    const { data: subs } = await supabase
      .from("bot_subscriptions")
      .select("user_id")
      .eq("bot_slug", "weeklypulse")
      .eq("status", "active");

    if (!subs || subs.length === 0) return { processed: 0 };

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    let processed = 0;

    for (const sub of subs) {
      try {
        // Get user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", sub.user_id)
          .single();

        if (!profile?.email) continue;

        // Check if they submitted a report this week
        const { data: report } = await supabase
          .from("pulse_reports")
          .select("*")
          .eq("user_id", sub.user_id)
          .gte("created_at", oneWeekAgo)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!report) {
          // Send reminder
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL ?? "noreply@botvaultpro.com",
            to: profile.email,
            subject: "Your Weekly Business Pulse — Don't forget to submit this week!",
            html: `
              <p>Hi ${profile.full_name?.split(" ")[0] ?? "there"},</p>
              <p>It's Monday! Time to enter your weekly numbers and get your business pulse report.</p>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/weeklypulse">Submit Your Weekly Numbers →</a></p>
              <p>— Bot Vault Pro</p>
            `,
          });
        } else {
          // Parse and send the report
          let parsedReport: Record<string, unknown> | null = null;
          try { parsedReport = JSON.parse(report.report_content); } catch {}

          const weekStr = new Date(report.week_ending).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL ?? "noreply@botvaultpro.com",
            to: profile.email,
            subject: `Your Weekly Business Pulse — ${weekStr}`,
            html: `
              <h2>Your Weekly Business Pulse — ${weekStr}</h2>
              <p><strong>Revenue:</strong> $${report.revenue?.toLocaleString()}</p>
              <p><strong>Expenses:</strong> $${report.expenses?.toLocaleString()}</p>
              ${parsedReport ? `
                <h3>Weekly Snapshot</h3>
                <p>${parsedReport.weekly_snapshot}</p>
                <h3>One Thing To Do This Week</h3>
                <p>${parsedReport.one_thing_to_do}</p>
              ` : ""}
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/weeklypulse">View Full Report →</a></p>
              <p>— Bot Vault Pro</p>
            `,
          });

          // Mark as emailed
          await supabase
            .from("pulse_reports")
            .update({ emailed_at: new Date().toISOString() })
            .eq("id", report.id);
        }

        processed++;
      } catch (err) {
        console.error(`WeeklyPulse email error for user ${sub.user_id}:`, err);
      }
    }

    return { processed };
  }
);
