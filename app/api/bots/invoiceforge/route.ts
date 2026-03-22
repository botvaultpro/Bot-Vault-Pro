import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { anthropic } from "@/lib/anthropic";
import { hasAccess, getBotTier, incrementIfTrial } from "@/lib/entitlements";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const access = await hasAccess(user.id, "invoiceforge");
  if (!access.access) {
    return NextResponse.json({
      error: "trial_exhausted",
      message: "You've used your free InvoiceForge trials. Subscribe to continue.",
    }, { status: 403 });
  }

  const body = await req.json();
  const { action, invoiceData } = body;

  if (action === "generate_scope") {
    const tier = await getBotTier(user.id, "invoiceforge");
    if (tier !== "pro") {
      return NextResponse.json({ error: "Pro subscription required for AI scope generation." }, { status: 403 });
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: "You are a professional project scope writer. Generate clear, professional project scope sections for proposals.",
      messages: [{
        role: "user",
        content: `Write a professional project scope section for a proposal with these details:

Client: ${invoiceData.clientName} (${invoiceData.clientCompany || "Individual"})
Line Items:
${invoiceData.lineItems.map((li: { description: string; quantity: number; unitPrice: number }) => `- ${li.description}: ${li.quantity} × $${li.unitPrice}`).join("\n")}

Include: What's included, what's NOT included, timeline estimate, and payment terms. Be professional and specific. 200-300 words.`,
      }],
    });

    const scope = message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ scope });
  }

  // Save invoice
  const { count } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const invoiceNumber = invoiceData.invoiceNumber || `INV-${String((count ?? 0) + 1).padStart(4, "0")}`;

  const lineItems = invoiceData.lineItems ?? [];
  const subtotal = lineItems.reduce((sum: number, li: { quantity: number; unitPrice: number }) => sum + li.quantity * li.unitPrice, 0);
  const taxAmount = subtotal * ((invoiceData.taxRate ?? 0) / 100);
  const total = subtotal + taxAmount;

  const { data: saved, error: insertError } = await supabase.from("invoices").insert({
    user_id: user.id,
    invoice_number: invoiceNumber,
    client_name: invoiceData.clientName,
    client_company: invoiceData.clientCompany || null,
    client_email: invoiceData.clientEmail || null,
    document_type: invoiceData.documentType ?? "invoice",
    issue_date: invoiceData.issueDate || new Date().toISOString().split("T")[0],
    due_date: invoiceData.dueDate || null,
    line_items: lineItems,
    tax_rate: invoiceData.taxRate ?? 0,
    notes: invoiceData.notes || null,
    currency: invoiceData.currency ?? "USD",
    status: "draft",
    total_amount: total,
    ai_scope: invoiceData.aiScope || null,
  }).select("id, invoice_number").single();
  if (insertError) {
    console.error("InvoiceForge: invoices insert error:", insertError);
  }

  await incrementIfTrial(user.id, "invoiceforge");

  return NextResponse.json({ id: saved?.id, invoiceNumber: saved?.invoice_number, total });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status } = await req.json();
  await supabase.from("invoices").update({ status, updated_at: new Date().toISOString() })
    .eq("id", id).eq("user_id", user.id);
  return NextResponse.json({ success: true });
}
