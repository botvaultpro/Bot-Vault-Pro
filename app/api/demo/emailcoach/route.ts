import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";

const ipUsage = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipUsage.get(ip);
  if (!entry || entry.resetAt < now) {
    ipUsage.set(ip, { count: 1, resetAt: now + 24 * 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "demo_exhausted", message: "You've used your 3 free demo replies. Create a free account to get more." },
      { status: 429 }
    );
  }

  const { originalEmail, goal, context } = await req.json();
  if (!originalEmail || !goal) {
    return NextResponse.json({ error: "originalEmail and goal are required" }, { status: 400 });
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      system: `You are an expert email communication coach. Generate three complete, professional email replies.
Return ONLY valid JSON with this exact structure:
{
  "professional": { "approach": "one-line description", "body": "full email body" },
  "direct": { "approach": "one-line description", "body": "full email body" },
  "diplomatic": { "approach": "one-line description", "body": "full email body" }
}
No markdown, no explanation — only the JSON object.`,
      messages: [{
        role: "user",
        content: `Generate three reply options for this email.
Goal: ${goal}
${context ? `Context: ${context}` : ""}

Original email:
---
${originalEmail.substring(0, 3000)}
---
Return ONLY the JSON object.`,
      }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    let replies;
    try {
      replies = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      replies = match ? JSON.parse(match[0]) : null;
    }

    if (!replies) {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    return NextResponse.json({ replies });
  } catch (e) {
    console.error("Demo EmailCoach error:", e);
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }
}
