import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserTier, checkAndIncrementUsage } from "@/lib/usage";
import { anthropic } from "@/lib/anthropic";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tier = await getUserTier(user.id);
  const check = await checkAndIncrementUsage(user.id, "sitebuilder", tier);
  if (!check.allowed) return NextResponse.json({ error: check.reason }, { status: 403 });

  const { businessName, location, businessType, currentSite, freelancerName } = await req.json();
  if (!businessName || !location || !businessType || !freelancerName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      system:
        "You are an expert web designer. Generate complete, professional single-page HTML websites. Return ONLY valid HTML — no markdown fences, no explanation, no extra text. Start directly with <!DOCTYPE html> and end with </html>.",
      messages: [
        {
          role: "user",
          content: `Create a complete, modern single-page HTML website for this business:

Business Name: ${businessName}
Location: ${location}
Business Type: ${businessType}
${currentSite ? `Current Website: ${currentSite}` : "No current website"}

Requirements:
- Complete single HTML file with ALL CSS in an inline <style> tag
- Sticky navigation bar with business name and smooth-scroll anchor links
- Hero section: large headline with business name, compelling tagline for a ${businessType}, prominent CTA button ("Get a Free Quote" or similar)
- About/Services section: 3-4 relevant services for a ${businessType} with emoji icons and short descriptions in a card grid
- Testimonials section: 3 short realistic customer quotes in styled cards
- Contact section: phone placeholder, email placeholder, address (${location}), simple contact form (name, email, message, submit button)
- Footer with business name and copyright
- Color scheme professional and appropriate for ${businessType}
- Fully mobile responsive with CSS media queries (flex/grid stacking, readable text)
- Google Fonts via @import in the style block (choose 2 fonts appropriate for the business)
- Smooth scroll: html { scroll-behavior: smooth; }
- Hover effects on buttons and cards
- This should look like a real $3,000 professionally designed website

Return ONLY the complete HTML. Start immediately with <!DOCTYPE html>`,
        },
      ],
    });

    const html = message.content[0].type === "text" ? message.content[0].text : "";

    // Save to site_previews
    const { data: savedSite } = await supabase
      .from("site_previews")
      .insert({
        user_id: user.id,
        business_name: businessName,
        business_type: businessType,
        location,
        current_website: currentSite || null,
        html_content: html,
      })
      .select("id")
      .single();

    // Auto-create pipeline lead in "site_generated" stage
    if (savedSite?.id) {
      await supabase.from("pipeline_leads").insert({
        user_id: user.id,
        business_name: businessName,
        business_type: businessType,
        location,
        current_website: currentSite || null,
        stage: "site_generated",
        site_preview_id: savedSite.id,
      });
    }

    return NextResponse.json({ html, sitePreviewId: savedSite?.id ?? null });
  } catch (e) {
    console.error("Site generation error:", e);
    return NextResponse.json({ error: "Site generation failed. Please try again." }, { status: 500 });
  }
}
