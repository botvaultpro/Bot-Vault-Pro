import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const { email, name } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Welcome email is best-effort — don't block signup if Resend isn't configured
    return NextResponse.json({ sent: false, reason: "RESEND_API_KEY not configured" });
  }

  const resend = new Resend(apiKey);
  const displayName = name || email.split("@")[0];

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Welcome to Bot Vault Pro</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0f0d; color: #e2e8e4; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 24px; }
    .logo { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 32px; }
    .logo span { color: #00d4a0; }
    h1 { font-size: 28px; font-weight: 800; margin: 0 0 12px; }
    p { color: #94a89e; line-height: 1.7; margin: 0 0 16px; }
    .card { background: #111a14; border: 1px solid #1e2d24; border-radius: 12px; padding: 20px 24px; margin: 8px 0; }
    .card-title { font-weight: 700; color: #e2e8e4; margin: 0 0 4px; }
    .card-desc { color: #94a89e; font-size: 14px; margin: 0; }
    .badge { display: inline-block; background: #00d4a010; border: 1px solid #00d4a030; color: #00d4a0; font-size: 12px; font-weight: 600; padding: 2px 10px; border-radius: 999px; margin-bottom: 6px; }
    .cta { display: inline-block; background: #00d4a0; color: #0a0f0d; font-weight: 800; padding: 14px 32px; border-radius: 10px; text-decoration: none; margin: 24px 0; }
    .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid #1e2d24; color: #567060; font-size: 13px; }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="logo"><span>Bot</span> Vault Pro</div>

  <h1>Welcome aboard, ${displayName}.</h1>
  <p>
    You've just joined the most accessible AI automation platform built for people who
    run their business solo. No agency fees. No developer required. Just AI doing the heavy lifting.
  </p>

  <p style="font-weight:600;color:#e2e8e4;margin-top:28px;">Your vault includes these 4 production-ready automations:</p>

  <div class="card">
    <div class="badge">LeadGen</div>
    <div class="card-title">LeadGen Pro</div>
    <div class="card-desc">Scrape verified contacts, AI-qualify leads against your ICP, and auto-send 3-email drip sequences.</div>
  </div>

  <div class="card">
    <div class="badge">Content</div>
    <div class="card-title">ContentBlast</div>
    <div class="card-desc">Generate and auto-publish AI content to Twitter/X, LinkedIn, and your blog on a schedule.</div>
  </div>

  <div class="card">
    <div class="badge">Support</div>
    <div class="card-title">SupportDesk</div>
    <div class="card-desc">Monitor your inbox 24/7, generate AI replies from your knowledge base, escalate edge cases to you.</div>
  </div>

  <div class="card">
    <div class="badge">Sales</div>
    <div class="card-title">SiteBuilder Pro</div>
    <div class="card-desc">Find businesses with weak sites, generate custom demo sites with AI, send proposals, and track deals.</div>
  </div>

  <p style="margin-top:28px;">
    These are just the beginning. We're always building. New automations ship every quarter — and as an
    early member, you lock in your all-inclusive rate while everyone else pays per bot.
  </p>

  <a href="https://botvaultpro.com/dashboard" class="cta">Go to your dashboard →</a>

  <p>
    Questions? Hit reply or email us at
    <a href="mailto:hello@botvaultpro.com" style="color:#00d4a0;">hello@botvaultpro.com</a>.
    We actually read every message.
  </p>

  <div class="footer">
    <p style="margin:0;">— The Bot Vault Pro Team</p>
    <p style="margin:8px 0 0;">Bot Vault Pro · hello@botvaultpro.com</p>
  </div>
</div>
</body>
</html>
  `.trim();

  try {
    await resend.emails.send({
      from: "Bot Vault Pro <noreply@botvaultpro.com>",
      to: email,
      subject: "Welcome to Bot Vault Pro",
      html,
    });
    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("Welcome email error:", err);
    return NextResponse.json({ sent: false, reason: "send failed" }, { status: 500 });
  }
}
