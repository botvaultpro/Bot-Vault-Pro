import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";
import { createClient as createServiceClient } from "@supabase/supabase-js";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

// Simple in-memory rate limiter for demo endpoint
// Limits: 1 analysis per IP per 24 hours
const ipUsage = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipUsage.get(ip);

  if (!entry || entry.resetAt < now) {
    ipUsage.set(ip, { count: 1, resetAt: now + 24 * 60 * 60 * 1000 });
    return true;
  }

  if (entry.count >= 1) return false;

  entry.count++;
  return true;
}

function getServiceSupabase() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  // Get client IP for rate limiting
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      {
        error: "demo_exhausted",
        message: "You've used your free demo analysis. Create a free account to get another one.",
      },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { documentBase64, documentName, context } = body;

  if (!documentBase64 || !documentName) {
    return NextResponse.json(
      { error: "documentBase64 and documentName are required" },
      { status: 400 }
    );
  }

  let documentText = "";
  try {
    const buffer = Buffer.from(documentBase64, "base64");
    const parsed = await pdfParse(buffer);
    documentText = parsed.text;
  } catch (err) {
    console.error("Demo ClauseCheck PDF parse error:", err);
    return NextResponse.json(
      { error: "Could not read PDF. Make sure it contains selectable text (not a scanned image)." },
      { status: 400 }
    );
  }

  if (!documentText.trim()) {
    return NextResponse.json(
      { error: "PDF appears to be empty or scanned (no extractable text)." },
      { status: 400 }
    );
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      system: `You are a legal document analyst. Analyze contracts and return structured JSON analysis.
Return ONLY valid JSON with this exact structure — no markdown, no explanation:
{
  "summary": "plain English summary of what this document says",
  "risk_flags": [
    { "clause_title": "title", "flagged_text": "exact quote from document", "explanation": "plain English explanation of the risk", "risk_level": "Low|Medium|High" }
  ],
  "missing_protections": ["protection 1", "protection 2"],
  "questions_to_ask": ["question 1", "question 2", "question 3"]
}`,
      messages: [
        {
          role: "user",
          content: `Analyze this contract document.
${context ? `Context: ${context}` : ""}

Document (${documentName}):
---
${documentText.substring(0, 30000)}
---

Return the JSON analysis.`,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    let analysis;
    try {
      analysis = JSON.parse(responseText);
    } catch {
      const match = responseText.match(/\{[\s\S]*\}/);
      analysis = match ? JSON.parse(match[0]) : null;
    }

    if (!analysis) {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    // Log demo usage for analytics (best-effort, don't block)
    try {
      const supabase = getServiceSupabase();
      await supabase.from("demo_usage").insert({
        bot_slug: "clausecheck",
        ip_hash: ip.substring(0, 8) + "****", // partial for privacy
        document_name: documentName,
      });
    } catch {}

    return NextResponse.json({ analysis });
  } catch (e) {
    console.error("Demo ClauseCheck error:", e);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
