import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { anthropic } from "@/lib/anthropic";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { businessName, location, businessType, currentSite, freelancerName, sitePreviewId } =
    await req.json();

  if (!businessName || !freelancerName) {
    return NextResponse.json({ error: "businessName and freelancerName are required" }, { status: 400 });
  }

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      system:
        "You are a professional web design sales consultant. Generate persuasive, beautifully formatted HTML proposals. Return ONLY the inner body HTML content (no <html>, <head>, or <body> tags). Use inline styles throughout for a professional, print-ready look.",
      messages: [
        {
          role: "user",
          content: `Generate a professional web design sales proposal with these details:

Agency/Freelancer: ${freelancerName}
Client Business: ${businessName}
Location: ${location || "Not specified"}
Business Type: ${businessType || "Business"}
Current Website: ${currentSite || "None — business has no web presence"}
Date: ${today}

Create a complete, compelling proposal with ALL of these sections using clean HTML and inline styles:

1. HEADER — Agency name (${freelancerName}), "Web Design Proposal", client name (${businessName}), date. Use a dark header bar with white text, professional.

2. EXECUTIVE SUMMARY — 2-3 sentences on why ${businessName} needs a better web presence right now. Be specific to a ${businessType || "business"}.

3. WHAT'S INCLUDED — Bulleted list in 2 columns of deliverables: custom responsive design, mobile optimization, contact form, Google Analytics setup, SEO meta tags, fast-loading pages, SSL-ready, browser tested, 30-day post-launch support, training video.

4. WHY IT MATTERS — 3-4 pain points specific to a ${businessType || "business"} with ${currentSite ? "an outdated website" : "no website"}: lost customers to competitors, lost trust/credibility, no way to capture leads 24/7, invisible on Google. Use a callout box style.

5. INVESTMENT — Table or cards showing 3 tiers:
   - Basic ($797): 3 pages, mobile responsive, contact form, 2 rounds of revisions, delivered in 2 weeks
   - Standard ($1,497): 5 pages, everything in Basic + SEO optimization, Google Business Profile setup, blog-ready, 3 revisions, 3 weeks
   - Premium ($2,997): 8+ pages, everything in Standard + booking/inquiry form, 1 year hosting support, priority support, 4 revisions, custom stock photos sourced, 4 weeks
   Highlight the Standard tier as "Most Popular".

6. TIMELINE — 3 phases in a horizontal or vertical visual: Phase 1: Discovery & Design (Days 1–5), Phase 2: Development & Content (Days 6–18), Phase 3: Review & Launch (Days 19–21).

7. NEXT STEPS — Clear CTA: "Ready to get started? Reply to this proposal or reach out directly:" with placeholder contact lines for ${freelancerName}.

Use a clean, modern style. Dark headings (#1a1a2e or similar), accent color (#4f46e5 indigo or similar), white/light gray backgrounds for sections, subtle borders. Make it look like it was designed by a pro. Should print beautifully on A4/Letter.`,
        },
      ],
    });

    const proposalContent = message.content[0].type === "text" ? message.content[0].text : "";

    // Save proposal to Supabase
    const { data: savedProposal } = await supabase
      .from("proposals")
      .insert({
        user_id: user.id,
        site_preview_id: sitePreviewId || null,
        business_name: businessName,
        proposal_content: proposalContent,
      })
      .select("id")
      .single();

    // Advance pipeline lead to "proposal_sent"
    if (sitePreviewId) {
      await supabase
        .from("pipeline_leads")
        .update({
          stage: "proposal_sent",
          proposal_id: savedProposal?.id ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("site_preview_id", sitePreviewId)
        .eq("user_id", user.id);
    }

    return NextResponse.json({ proposalContent, proposalId: savedProposal?.id ?? null });
  } catch (e) {
    console.error("Proposal generation error:", e);
    return NextResponse.json({ error: "Proposal generation failed. Please try again." }, { status: 500 });
  }
}
