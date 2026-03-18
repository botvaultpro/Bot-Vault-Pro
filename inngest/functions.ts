import { inngest } from "./client";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { buildWelcomeEmail } from "@/lib/emails";

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
    const payload = buildWelcomeEmail(firstName, email);

    await resend.emails.send(payload);

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
