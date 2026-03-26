import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";
import { createClient as createServiceClient } from "@supabase/supabase-js";

// In-memory rate limiter: 2 per IP per 24h
const ipUsage = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipUsage.get(ip);
  if (!entry || entry.resetAt < now) {
    ipUsage.set(ip, { count: 1, resetAt: now + 24 * 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 2) return false;
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
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "You've used your 2 free demo generations today. Sign up for unlimited access." },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { businessName, businessType, location, tagline, primaryColor } = body;

  if (!businessName || !businessType) {
    return NextResponse.json({ error: "Business name and type are required." }, { status: 400 });
  }

  const colorMap: Record<string, string> = {
    blue: "#2563EB",
    green: "#16A34A",
    purple: "#7C3AED",
    orange: "#EA580C",
    red: "#DC2626",
    teal: "#0D9488",
  };
  const accent = colorMap[primaryColor] || "#2563EB";

  const systemPrompt = `You are an expert web designer creating beautiful, modern landing pages for local businesses.
Generate complete, self-contained HTML with embedded CSS. The result should look like a real professional website.
Use modern design: clean typography, good spacing, hero section, services section, CTA buttons.
Make it mobile-responsive using CSS flexbox/grid. Include realistic placeholder content appropriate for the business type.
Return ONLY the complete HTML document — no explanations, no markdown, no code blocks.`;

  const userPrompt = `Create a complete single-page website for:
- Business Name: ${businessName}
- Business Type: ${businessType}
- Location: ${location || "Local Area"}
- Tagline: ${tagline || `Professional ${businessType} services`}
- Primary Color: ${accent}

Include:
1. Navigation bar with logo and "Book Now" / "Contact Us" CTA
2. Hero section with compelling headline and sub-headline
3. Services section (3-4 relevant services for this business type with icons using Unicode symbols)
4. "Why Choose Us" section with 3 differentiators
5. Simple contact/CTA section with phone placeholder and "Get a Free Quote" button
6. Footer

Style requirements:
- Primary accent color: ${accent}
- Dark background: #0a0a0a with sections alternating slightly
- Clean, modern sans-serif fonts (use system fonts)
- Subtle card shadows and rounded corners
- Mobile-responsive

Make all content realistic and specific to the business type. The website should look like it was made by a professional agency.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      messages: [{ role: "user", content: userPrompt }],
      system: systemPrompt,
    });

    const html = response.content[0].type === "text" ? response.content[0].text : "";

    // Track in demo_leads table if possible
    try {
      const supabase = getServiceSupabase();
      await supabase.from("activity_log").insert({
        user_id: "00000000-0000-0000-0000-000000000000",
        bot_slug: "sitebuilder",
        action: "demo_generated",
        detail: businessName,
      }).maybeSingle();
    } catch {
      // Non-critical
    }

    return NextResponse.json({ html, businessName });
  } catch (err) {
    console.error("SiteBuilder demo error:", err);
    return NextResponse.json({ error: "Failed to generate website. Please try again." }, { status: 500 });
  }
}
