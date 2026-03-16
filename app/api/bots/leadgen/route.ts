import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserTier, checkAndIncrementUsage } from "@/lib/usage";
import { runBotPrompt } from "@/lib/anthropic";
import { TIER_LIMITS } from "@/lib/tier-limits";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tier = await getUserTier(user.id);
  const check = await checkAndIncrementUsage(user.id, "leadgen", tier);
  if (!check.allowed) return NextResponse.json({ error: check.reason }, { status: 403 });

  const { domains, icp, tone } = await req.json();
  if (!domains || !icp) return NextResponse.json({ error: "domains and icp are required" }, { status: 400 });

  const limits = TIER_LIMITS[tier].leadgen;

  const system = `You are LeadGen Pro, an expert B2B lead generation AI. 
Your job is to analyze target company domains, identify likely decision-maker contacts, qualify them against an ICP, and write personalized outreach emails.
Format your output clearly with sections: QUALIFIED LEADS, ANALYSIS, and EMAIL SEQUENCE.
Generate up to ${limits.leadsPerRun} leads. ${limits.aiQualification ? "Include an AI qualification score (1-10) for each lead." : ""}
Write ${limits.emailSteps} email(s) in the sequence. Tone: ${tone || "professional"}.`;

  const userPrompt = `Target domains:\n${domains}\n\nIdeal Customer Profile:\n${icp}\n\nGenerate leads and outreach for these targets.`;

  try {
    const output = await runBotPrompt(system, userPrompt, 2000);
    return NextResponse.json({ output });
  } catch {
    return NextResponse.json({ error: "AI generation failed. Please try again." }, { status: 500 });
  }
}
