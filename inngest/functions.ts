import { inngest } from "./client";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import {
  buildWelcomeEmail,
  buildDripDay1Email,
  buildDripDay3Email,
  buildDripDay5Email,
  buildDripDay7Email,
} from "@/lib/emails";

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
// Trial-to-Paid Drip Sequence — 7-day automated email funnel
// Fires on user/signed.up, checks subscription status before
// each send so we don't email people who already converted.
// ============================================================

export const trialDripSequence = inngest.createFunction(
  { id: "trial-drip-sequence", name: "Trial-to-Paid Drip Sequence" },
  { event: "user/signed.up" },
  async ({ event, step }) => {
    const { email, name, userId } = event.data;
    const firstName = name ? name.split(" ")[0] : "there";

    // Helper: check if user has at least one active paid subscription
    async function isConverted(uid: string): Promise<boolean> {
      if (!uid) return false;
      const supabase = getSupabase();
      const { data } = await supabase
        .from("bot_subscriptions")
        .select("id")
        .eq("user_id", uid)
        .eq("status", "active")
        .limit(1);
      return (data?.length ?? 0) > 0;
    }

    // Day 1 — "Did you try your first bot?"
    await step.sleep("wait-day-1", "1d");
    const converted1 = await step.run("check-converted-day1", () => isConverted(userId));
    if (!converted1) {
      await step.run("send-day-1", async () => {
        const resend = getResend();
        await resend.emails.send(buildDripDay1Email(firstName, email));
      });
    }

    // Day 3 — ROI math
    await step.sleep("wait-day-3", "2d");
    const converted3 = await step.run("check-converted-day3", () => isConverted(userId));
    if (!converted3) {
      await step.run("send-day-3", async () => {
        const resend = getResend();
        await resend.emails.send(buildDripDay3Email(firstName, email));
      });
    }

    // Day 5 — Urgency / trial expiring
    await step.sleep("wait-day-5", "2d");
    const converted5 = await step.run("check-converted-day5", () => isConverted(userId));
    if (!converted5) {
      await step.run("send-day-5", async () => {
        const resend = getResend();
        await resend.emails.send(buildDripDay5Email(firstName, email));
      });
    }

    // Day 7 — Discount offer (final email)
    await step.sleep("wait-day-7", "2d");
    const converted7 = await step.run("check-converted-day7", () => isConverted(userId));
    if (!converted7) {
      await step.run("send-day-7", async () => {
        const resend = getResend();
        await resend.emails.send(buildDripDay7Email(firstName, email, "WELCOME20"));
      });
    }

    return { completed: true, email, converted: converted7 };
  }
);

// ============================================================
// Post-Subscription Upsell — fires after first payment
// Sends a "welcome to paid" email + cross-sell other bots
// ============================================================

export const postSubscriptionUpsell = inngest.createFunction(
  { id: "post-subscription-upsell", name: "Post-Subscription Upsell" },
  { event: "user/subscribed" },
  async ({ event, step }) => {
    const { email, name, botSlug } = event.data;
    const firstName = name ? name.split(" ")[0] : "there";

    const botNames: Record<string, string> = {
      clausecheck: "ClauseCheck",
      emailcoach: "EmailCoach",
      weeklypulse: "WeeklyPulse",
      invoiceforge: "InvoiceForge",
      reviewbot: "ReviewBot",
      sitebuilder: "SiteBuilder Pro",
    };

    const crossSell: Record<string, { slug: string; name: string; price: string; pitch: string }[]> = {
      clausecheck: [
        { slug: "invoiceforge", name: "InvoiceForge", price: "$29/mo", pitch: "Get paid faster — auto-send and track invoices" },
        { slug: "emailcoach", name: "EmailCoach", price: "$19/mo", pitch: "Handle the awkward client emails without stress" },
      ],
      emailcoach: [
        { slug: "clausecheck", name: "ClauseCheck", price: "$29/mo", pitch: "Never sign a contract blind again" },
        { slug: "weeklypulse", name: "WeeklyPulse", price: "$19/mo", pitch: "Know your business health every Monday" },
      ],
      invoiceforge: [
        { slug: "clausecheck", name: "ClauseCheck", price: "$29/mo", pitch: "Review contracts before you invoice anyone" },
        { slug: "emailcoach", name: "EmailCoach", price: "$19/mo", pitch: "Follow up on late payments without the stress" },
      ],
      weeklypulse: [
        { slug: "emailcoach", name: "EmailCoach", price: "$19/mo", pitch: "Handle business communications like a pro" },
        { slug: "clausecheck", name: "ClauseCheck", price: "$29/mo", pitch: "Protect yourself before signing anything" },
      ],
      reviewbot: [
        { slug: "sitebuilder", name: "SiteBuilder Pro", price: "$49/mo", pitch: "Turn positive reviews into new client proposals" },
        { slug: "emailcoach", name: "EmailCoach", price: "$19/mo", pitch: "Handle difficult customer emails automatically" },
      ],
      sitebuilder: [
        { slug: "clausecheck", name: "ClauseCheck", price: "$29/mo", pitch: "Review client contracts before you sign" },
        { slug: "invoiceforge", name: "InvoiceForge", price: "$29/mo", pitch: "Invoice clients directly from Bot Vault Pro" },
      ],
    };

    const suggestions = crossSell[botSlug] ?? [];
    if (suggestions.length === 0) return { skipped: true };

    // Wait 3 days before cross-selling — let them get value first
    await step.sleep("wait-3-days", "3d");

    await step.run("send-upsell-email", async () => {
      const resend = getResend();
      const botName = botNames[botSlug] ?? botSlug;

      const suggestionsHtml = suggestions
        .map(
          (s) => `
          <tr>
            <td style="padding:14px 16px;background-color:#0d0d14;border:1px solid #1e1e2e;border-radius:8px;margin-bottom:8px;">
              <p style="margin:0 0 2px;font-size:14px;color:#00c8ff;font-weight:600;">${s.name} — ${s.price}</p>
              <p style="margin:0;font-size:13px;color:#a0a0b8;">${s.pitch}</p>
            </td>
          </tr>
          <tr><td style="height:8px;"></td></tr>`
        )
        .join("");

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "Bot Vault Pro <noreply@botvaultpro.com>",
        to: email,
        subject: `${botName} is running. Here's what pairs well with it.`,
        html: `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a0f;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#13131a;border:1px solid #1e1e2e;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #1e1e2e;">
              <span style="font-size:22px;font-weight:700;color:#ffffff;"><span style="color:#00c8ff;">Bot</span> Vault Pro</span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 20px;font-size:16px;color:#a0a0b8;line-height:1.6;">Hey ${firstName},</p>
              <p style="margin:0 0 20px;font-size:16px;color:#a0a0b8;line-height:1.6;">
                ${botName} is up and running. Glad you're on board.
              </p>
              <p style="margin:0 0 24px;font-size:16px;color:#a0a0b8;line-height:1.6;">
                Based on what ${botName} does for you, these two bots tend to work really well alongside it:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                ${suggestionsHtml}
              </table>
              <p style="margin:0 0 28px;font-size:14px;color:#5a5a7a;">Subscribe to 3+ bots and you automatically get 20% off everything.</p>
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#00c8ff;border-radius:8px;">
                    <a href="https://botvaultpro.com/pricing" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#0a0a0f;text-decoration:none;">
                      See All Bots →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #1e1e2e;">
              <p style="margin:0;font-size:12px;color:#5a5a7a;">
                <a href="https://botvaultpro.com" style="color:#00c8ff;text-decoration:none;">botvaultpro.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      });
    });

    return { sent: true, email, botSlug };
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
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", sub.user_id)
          .single();

        if (!profile?.email) continue;

        const { data: report } = await supabase
          .from("pulse_reports")
          .select("*")
          .eq("user_id", sub.user_id)
          .gte("created_at", oneWeekAgo)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!report) {
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
