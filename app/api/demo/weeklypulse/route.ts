import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// In-memory rate limit: 3 per IP per 24h
const ipUsage = new Map<string, { count: number; resetAt: number }>();

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipUsage.get(ip);
  if (!entry || now > entry.resetAt) {
    ipUsage.set(ip, { count: 1, resetAt: now + 24 * 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "You've used your 3 free reports. Sign up to continue." },
      { status: 429 }
    );
  }

  let body: {
    revenue?: string;
    expenses?: string;
    newCustomers?: string;
    churnedCustomers?: string;
    leads?: string;
    hoursWorked?: string;
    biggestWin?: string;
    biggestChallenge?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const {
    revenue = "0",
    expenses = "0",
    newCustomers = "0",
    churnedCustomers = "0",
    leads = "0",
    hoursWorked = "40",
    biggestWin = "",
    biggestChallenge = "",
  } = body;

  const prompt = `You are WeeklyPulse, an AI business health analyst. Analyze this weekly business data and produce a concise, plain-English report.

Weekly Data:
- Revenue: $${revenue}
- Expenses: $${expenses}
- Net Profit: $${Number(revenue) - Number(expenses)}
- New Customers: ${newCustomers}
- Churned Customers: ${churnedCustomers}
- Net Customer Change: ${Number(newCustomers) - Number(churnedCustomers)}
- New Leads: ${leads}
- Hours Worked: ${hoursWorked}
- Biggest Win: ${biggestWin || "Not provided"}
- Biggest Challenge: ${biggestChallenge || "Not provided"}

Produce a structured business health report with these sections:

## Health Score
Give an overall health score from 1-100 with a one-sentence explanation. Format: "Score: XX/100 — [reason]"

## Key Metrics
Calculate and comment on:
- Profit margin %
- Revenue per hour worked
- Customer acquisition vs churn (net retention)
- Lead-to-customer conversion ratio (if applicable)

## Trend Analysis
Based on this week's data, identify 2-3 signals — positive or concerning. Be specific and actionable.

## This Week's Priority
One single most important action the business owner should take next week. Be concrete and specific.

## 30-Second Summary
A 2-3 sentence plain-English summary a busy owner can read in 30 seconds.

Be direct, specific, and useful. No fluff. Use real numbers from the data.`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const report = (message.content[0] as { type: string; text: string }).text;
    return NextResponse.json({ report });
  } catch (err) {
    console.error("WeeklyPulse demo error:", err);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
