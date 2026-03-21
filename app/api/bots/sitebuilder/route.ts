import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasAccess, incrementIfTrial } from "@/lib/entitlements";
import { runBotPrompt } from "@/lib/anthropic";
import { getBotTier } from "@/lib/entitlements";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const access = await hasAccess(user.id, "sitebuilder");
  if (!access) {
    return NextResponse.json({
      error: "trial_exhausted",
      message: "You've used your free SiteBuilder trials. Subscribe to continue.",
    }, { status: 403 });
  }

  const { businessName, location, businessType, currentSite, freelancerName } = await req.json();
  if (!businessName || !location || !businessType || !freelancerName) {
    return NextResponse.json({ error: "businessName, location, businessType, and freelancerName are required" }, { status: 400 });
  }

  const tier = await getBotTier(user.id, "sitebuilder");
  const isPro = tier === "pro";

  const system = `You are SiteBuilder Pro, an expert web design sales AI.
Your job is to analyze a local business's web presence and create a compelling sales package.

Output these sections in order:
### SITE ANALYSIS
${isPro ? "Score the current site 1-10 and list specific weaknesses (mobile, speed, design, SEO, etc.)" : "Note whether a site exists and basic observations."}

### DEMO SITE (HTML)
Generate a complete, modern single-page HTML website for this business. Use inline CSS. Make it look professional with the business name, location, services section, and a contact CTA. Use appropriate colors for the industry.

### PROPOSAL EMAIL
Write a personalized outreach email from ${freelancerName} referencing the specific weaknesses found.
${isPro ? "Then write Follow-up Email 1 (3 days later) and Follow-up Email 2 (7 days later)." : ""}`;

  const userPrompt = `Business: ${businessName}\nLocation: ${location}\nType: ${businessType}\nCurrent website: ${currentSite || "None found"}\n\nGenerate the full sales package.`;

  try {
    const output = await runBotPrompt(system, userPrompt, 2000);
    await incrementIfTrial(user.id, "sitebuilder");
    return NextResponse.json({ output });
  } catch (e) {
    console.error("SiteBuilder (legacy) error:", e);
    return NextResponse.json({ error: "AI generation failed. Please try again." }, { status: 500 });
  }
}
