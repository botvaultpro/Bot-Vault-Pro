import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { anthropic } from "@/lib/anthropic";
import { hasAccess, incrementIfTrial } from "@/lib/entitlements";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const access = await hasAccess(user.id, "clausecheck");
  if (!access.access) {
    return NextResponse.json({
      error: "trial_exhausted",
      message: "You've used your free ClauseCheck trial. Subscribe to continue.",
    }, { status: 403 });
  }

  const body = await req.json();
  const { documentBase64, documentName, context } = body;

  if (!documentBase64 || !documentName) {
    return NextResponse.json({ error: "documentBase64 and documentName are required" }, { status: 400 });
  }

  // Decode base64 to buffer and extract text
  let documentText = "";
  try {
    const buffer = Buffer.from(documentBase64, "base64");
    const parsed = await pdfParse(buffer);
    documentText = parsed.text;
  } catch (err) {
    console.error("PDF parse error:", err);
    return NextResponse.json({ error: "Could not read PDF. Make sure it contains selectable text." }, { status: 400 });
  }

  if (!documentText.trim()) {
    return NextResponse.json({ error: "PDF appears to be empty or scanned (no extractable text)." }, { status: 400 });
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 6000,
      system: `You are a legal document analyst. Analyze contracts and return structured JSON analysis.
Return ONLY valid JSON with this exact structure — no markdown, no explanation:
{
  "summary": "plain English summary of what this document says",
  "risk_flags": [
    { "clause_title": "title", "flagged_text": "exact quote from document", "explanation": "plain English explanation of the risk", "risk_level": "Low|Medium|High" }
  ],
  "missing_protections": ["protection 1", "protection 2"],
  "questions_to_ask": ["question 1", "question 2", "question 3", "question 4", "question 5"]
}`,
      messages: [{
        role: "user",
        content: `Analyze this contract document.
${context ? `Context: ${context}` : ""}

Document (${documentName}):
---
${documentText.substring(0, 50000)}
---

Return the JSON analysis.`,
      }],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
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

    const { data: saved, error: insertError } = await supabase.from("contract_analyses").insert({
      user_id: user.id,
      document_name: documentName,
      document_text: documentText,
      context: context || null,
      summary: analysis.summary,
      risk_flags: analysis.risk_flags,
      missing_protections: analysis.missing_protections,
      questions_to_ask: analysis.questions_to_ask,
    }).select("id").single();
    if (insertError) {
      console.error("ClauseCheck: contract_analyses insert error:", insertError);
    }

    await incrementIfTrial(user.id, "clausecheck");

    return NextResponse.json({ analysis, id: saved?.id });
  } catch (e) {
    console.error("ClauseCheck error:", e);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
