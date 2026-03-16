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
  const check = await checkAndIncrementUsage(user.id, "sitebuilder", tier);
  if (!check.allowed) return NextResponse.json({ error: check.reason }, { status: 403 });

  const { businessName, location, businessType, currentSite, freelancerName } = await req.json();
  if (!businessName || !location || !businessType || !freelancerName) {
    return NextResponse.json({ error: "businessName, location, businessType, and freelancerName are required" }, { status: 400 });
  }

  const limits = TIER_LIMITS[tier].sitebuilder;

  const system = `You are SiteBuilder Pro, an expert web design sales AI.
Your job is to analyze a local business's web presence and create a compelling sales package.

Output these sections in order:
### SITE ANALYSIS
${limits.aiScoring ? "Score the current site 1-10 and list specific weaknesses (mobile, speed, design, SEO, etc.)" : "Note whether a site exists and basic observations."}

### DEMO SITE (HTML)
${limits.demoGeneration ? "Generate a complete, modern single-page HTML website for this business. Use inline CSS. Make it look professional with the business name, location, services section, and a contact CTA. Use appropriate colors for the industry." : "Demo generation available on Starter plan and above."}

### PROPOSAL EMAIL
Write a personalized outreach email from ${freelancerName} referencing the specific weaknesses found.
${limits.proposalSteps >= 3 ? "Then write Follow-up Email 1 (3 days later) and Follow-up Email 2 (7 days later)." : ""}`;

  const userPrompt = `Business: ${businessName}\nLocation: ${location}\nType: ${businessType}\nCurrent website: ${currentSite || "None found"}\n\nGenerate the full sales package.`;

  try {
    const output = await runBotPrompt(system, userPrompt, 2000);
    return NextResponse.json({ output });
  } catch {
    return NextResponse.json({ error: "AI generation failed. Please try again." }, { status: 500 });
  }
}
