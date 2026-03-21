import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { anthropic } from "@/lib/anthropic";
import { hasAccess, incrementIfTrial } from "@/lib/entitlements";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const access = await hasAccess(user.id, "weeklypulse");
  if (!access) {
    return NextResponse.json({
      error: "trial_exhausted",
      message: "You've used your free WeeklyPulse trials. Subscribe to continue.",
    }, { status: 403 });
  }

  const body = await req.json();
  const { weekEnding, revenue, expenses, newCustomers, returningCustomers, refunds, topProduct, biggestChallenge, wins, industry } = body;

  if (!weekEnding || revenue === undefined) {
    return NextResponse.json({ error: "weekEnding and revenue are required" }, { status: 400 });
  }

  const profit = (revenue ?? 0) - (expenses ?? 0);
  const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : "0";

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      system: `You are a business performance analyst. Generate plain-English weekly business health reports.
Return ONLY valid JSON with this exact structure:
{
  "weekly_snapshot": "2-3 sentence plain English overview of the week's numbers",
  "whats_working": ["item 1", "item 2", "item 3"],
  "needs_attention": ["item 1", "item 2"],
  "one_thing_to_do": "single most important action to take this week",
  "next_week_watchlist": ["thing to watch 1", "thing to watch 2", "thing to watch 3"]
}`,
      messages: [{
        role: "user",
        content: `Generate a weekly business pulse report.

Week Ending: ${weekEnding}
Industry: ${industry || "General Business"}
Revenue: $${revenue}
Expenses: $${expenses || 0}
Profit: $${profit} (${margin}% margin)
New Customers: ${newCustomers || 0}
Returning Customers: ${returningCustomers || 0}
Refunds/Cancellations: ${refunds || 0}
Top Selling Product/Service: ${topProduct || "Not specified"}
Biggest Challenge: ${biggestChallenge || "None noted"}
Wins/Highlights: ${wins || "None noted"}

Generate the JSON report.`,
      }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    let report;
    try {
      report = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      report = match ? JSON.parse(match[0]) : null;
    }

    if (!report) {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    const reportContent = JSON.stringify(report);

    const { data: saved, error: insertError } = await supabase.from("pulse_reports").insert({
      user_id: user.id,
      week_ending: weekEnding,
      revenue: revenue || 0,
      expenses: expenses || 0,
      new_customers: newCustomers || 0,
      returning_customers: returningCustomers || 0,
      refunds: refunds || 0,
      top_product: topProduct || null,
      biggest_challenge: biggestChallenge || null,
      wins: wins || null,
      industry: industry || null,
      report_content: reportContent,
    }).select("id").single();
    if (insertError) {
      console.error("WeeklyPulse: pulse_reports insert error:", insertError);
    }

    await incrementIfTrial(user.id, "weeklypulse");

    return NextResponse.json({ report, id: saved?.id });
  } catch (e) {
    console.error("WeeklyPulse error:", e);
    return NextResponse.json({ error: "Report generation failed. Please try again." }, { status: 500 });
  }
}
