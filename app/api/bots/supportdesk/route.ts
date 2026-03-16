import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserTier, checkAndIncrementUsage } from "@/lib/usage";
import { runBotPrompt } from "@/lib/anthropic";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tier = await getUserTier(user.id);
  const check = await checkAndIncrementUsage(user.id, "supportdesk", tier);
  if (!check.allowed) return NextResponse.json({ error: check.reason }, { status: 403 });

  const { question, companyName, knowledgeBase, tone } = await req.json();
  if (!question || !companyName || !knowledgeBase) return NextResponse.json({ error: "question, companyName, and knowledgeBase are required" }, { status: 400 });

  const system = `You are a helpful customer support AI for ${companyName}.
You ONLY answer based on the knowledge base provided. Do not make up information.
Tone: ${tone || "professional"}.
At the end of your reply, add a confidence score line: "Confidence: X/10"
If confidence is below 6, add: "ESCALATE: This ticket should be reviewed by a human agent."
Format: Write a complete, ready-to-send email reply.`;

  const userPrompt = `Knowledge Base:\n${knowledgeBase}\n\nCustomer Message:\n${question}\n\nWrite a complete support reply.`;

  try {
    const output = await runBotPrompt(system, userPrompt, 1500);
    return NextResponse.json({ output });
  } catch {
    return NextResponse.json({ error: "AI generation failed. Please try again." }, { status: 500 });
  }
}
