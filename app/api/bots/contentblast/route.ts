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
  const check = await checkAndIncrementUsage(user.id, "contentblast", tier);
  if (!check.allowed) return NextResponse.json({ error: check.reason }, { status: 403 });

  const { topic, brandVoice, platforms } = await req.json();
  if (!topic || !brandVoice) return NextResponse.json({ error: "topic and brandVoice are required" }, { status: 400 });

  const limits = TIER_LIMITS[tier].contentblast;
  const allowedPlatforms = limits.platforms;

  let requestedPlatforms: string[] = [];
  if (platforms === "all") requestedPlatforms = allowedPlatforms;
  else if (allowedPlatforms.includes(platforms)) requestedPlatforms = [platforms];
  else requestedPlatforms = ["blog"];

  const system = `You are ContentBlast, an expert content marketing AI.
Generate high-quality, engaging content for the requested platforms.
Brand voice: ${brandVoice}
Platforms to generate for: ${requestedPlatforms.join(", ")}
Format output with clear ### PLATFORM sections for each piece of content.
${requestedPlatforms.includes("twitter") ? "Twitter: Write a 5-tweet thread with numbered tweets." : ""}
${requestedPlatforms.includes("linkedin") ? "LinkedIn: Write a 150-200 word post with line breaks for readability." : ""}
${requestedPlatforms.includes("blog") ? "Blog: Write a 400-600 word post with H2 headers." : ""}`;

  const userPrompt = `Topic: ${topic}\n\nGenerate content for all requested platforms now.`;

  try {
    const output = await runBotPrompt(system, userPrompt, 2000);
    return NextResponse.json({ output });
  } catch {
    return NextResponse.json({ error: "AI generation failed. Please try again." }, { status: 500 });
  }
}
