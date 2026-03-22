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
      { error: "demo_exhausted", message: "You've used your 3 free demo invoices. Create a free account to get more." },
      { status: 429 }
    );
  }

  const { clientName, clientEmail, services, notes, businessName, dueDate } = await req.json();
  if (!clientName || !services?.length) {
    return NextResponse.json({ error: "clientName and services are required" }, { status: 400 });
  }

  const totalAmount = services.reduce(
    (sum: number, s: { amount: number }) => sum + (Number(s.amount) || 0),
    0
  );

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      system: `You are a professional invoice writer. Generate a professional invoice cover note and payment terms.
Return ONLY valid JSON:
{
  "invoice_number": "INV-XXXXX",
  "subject_line": "short professional subject line",
  "cover_note": "2-3 sentence professional payment request",
  "payment_terms": "clear payment terms",
  "follow_up_note": "friendly follow-up reminder to send if unpaid after due date"
}`,
      messages: [{
        role: "user",
        content: `Generate a professional invoice.
Business: ${businessName || "My Business"}
Client: ${clientName}${clientEmail ? ` (${clientEmail})` : ""}
Services: ${services.map((s: { description: string; amount: number }) => `${s.description}: $${s.amount}`).join(", ")}
Total: $${totalAmount.toFixed(2)}
Due: ${dueDate || "Net 30"}
${notes ? `Notes: ${notes}` : ""}
Return only the JSON.`,
      }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    let invoice;
    try {
      invoice = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      invoice = match ? JSON.parse(match[0]) : null;
    }

    if (!invoice) {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    return NextResponse.json({ invoice, totalAmount, services, clientName, clientEmail, businessName, dueDate });
  } catch (e) {
    console.error("Demo InvoiceForge error:", e);
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }
}
