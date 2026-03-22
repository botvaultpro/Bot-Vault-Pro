import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { anthropic } from "@/lib/anthropic";
import { hasAccess, incrementIfTrial } from "@/lib/entitlements";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const access = await hasAccess(user.id, "emailcoach");
  if (!access.access) {
    return NextResponse.json({
      error: "trial_exhausted",
      message: "You've used your free EmailCoach trials. Subscribe to continue.",
      remaining: 0,
    }, { status: 403 });
  }

  const { originalEmail, goal, context } = await req.json();
  if (!originalEmail || !goal) {
    return NextResponse.json({ error: "originalEmail and goal are required" }, { status: 400 });
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
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
${context ? `Background context: ${context}` : ""}

Email received:
---
${originalEmail}
---

Professional reply: formal, clear, maintains professional distance.
Direct reply: concise, gets to the point quickly, no fluff.
Diplomatic reply: warm, empathetic, preserves relationship.

All three must directly address the goal (${goal}) and be ready to send.`,
      }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    let replies;
    try {
      replies = JSON.parse(text);
    } catch {
      // Try to extract JSON from the response
      const match = text.match(/\{[\s\S]*\}/);
      replies = match ? JSON.parse(match[0]) : null;
    }

    if (!replies) {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    // Save to database
    const { error: insertError } = await supabase.from("email_replies").insert({
      user_id: user.id,
      original_email: originalEmail,
      goal,
      context: context || null,
      reply_professional: replies.professional?.body ?? "",
      reply_direct: replies.direct?.body ?? "",
      reply_diplomatic: replies.diplomatic?.body ?? "",
    });
    if (insertError) {
      console.error("EmailCoach: email_replies insert error:", insertError);
    }

    await incrementIfTrial(user.id, "emailcoach");

    return NextResponse.json({ replies });
  } catch (e) {
    console.error("EmailCoach error:", e);
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }
}
