import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { anthropic } from "@/lib/anthropic";
import { hasAccess } from "@/lib/entitlements";

// Mock reviews for when no Google API key is present
const MOCK_REVIEWS = [
  {
    id: "mock-1",
    google_review_id: "mock-1",
    reviewer_name: "Sarah Johnson",
    rating: 5,
    review_text: "Absolutely amazing service! The team was professional, responsive, and delivered everything on time. I couldn't be happier with the results. Will definitely be returning for future projects.",
    review_date: new Date(Date.now() - 86400000).toISOString(),
    status: "pending",
    ai_reply: null,
  },
  {
    id: "mock-2",
    google_review_id: "mock-2",
    reviewer_name: "Mike Thompson",
    rating: 4,
    review_text: "Great experience overall. The quality of work was excellent and they communicated well throughout the process. Only minor issue was a small delay, but they kept me informed the whole time.",
    review_date: new Date(Date.now() - 172800000).toISOString(),
    status: "pending",
    ai_reply: null,
  },
  {
    id: "mock-3",
    google_review_id: "mock-3",
    reviewer_name: "Lisa Chen",
    rating: 3,
    review_text: "Decent service but had some issues with communication. The final product was good but took longer than expected. Would be better with clearer timelines upfront.",
    review_date: new Date(Date.now() - 259200000).toISOString(),
    status: "pending",
    ai_reply: null,
  },
  {
    id: "mock-4",
    google_review_id: "mock-4",
    reviewer_name: "David Park",
    rating: 5,
    review_text: "Outstanding! They went above and beyond to make sure everything was perfect. The attention to detail was impressive and the customer service was top-notch. Highly recommend!",
    review_date: new Date(Date.now() - 345600000).toISOString(),
    status: "approved",
    ai_reply: "Thank you so much for your kind words, David! We're thrilled to hear that our attention to detail made a positive impression. It's always our goal to go above and beyond for our clients. We look forward to working with you again soon!",
  },
  {
    id: "mock-5",
    google_review_id: "mock-5",
    reviewer_name: "Emma Wilson",
    rating: 2,
    review_text: "Disappointed with the experience. The service didn't meet my expectations and there were several miscommunications. I had to follow up multiple times to get updates.",
    review_date: new Date(Date.now() - 432000000).toISOString(),
    status: "pending",
    ai_reply: null,
  },
];

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const access = await hasAccess(user.id, "reviewbot");
  if (!access.access) {
    return NextResponse.json({ error: "subscription_required", message: "ReviewBot requires an active subscription." }, { status: 403 });
  }

  const isMockMode = !process.env.GOOGLE_MY_BUSINESS_API_KEY;

  if (isMockMode) {
    // Return mock reviews without saving to DB
    return NextResponse.json({ reviews: MOCK_REVIEWS, mockMode: true });
  }

  // Real mode: fetch from DB
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("user_id", user.id)
    .order("review_date", { ascending: false });

  return NextResponse.json({ reviews: reviews ?? [], mockMode: false });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  if (action === "save_config") {
    const { placeId, businessName, tone } = body;
    await supabase.from("review_configs").upsert({
      user_id: user.id,
      place_id: placeId,
      business_name: businessName,
      tone,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    return NextResponse.json({ success: true });
  }

  if (action === "generate_reply") {
    const { reviewerName, rating, reviewText, businessName, tone } = body;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system: `You are a ${tone || "Professional"} business owner responding to Google reviews. Write genuine, specific replies that reference details from the review. Never be generic. Be 2-4 sentences. For 4-5 star reviews, include a soft CTA to return.`,
      messages: [{
        role: "user",
        content: `Write a reply to this Google review.
Business: ${businessName || "Our business"}
Reviewer: ${reviewerName}
Rating: ${rating}/5 stars
Review: "${reviewText}"
Tone: ${tone || "Professional"}
Write only the reply text, nothing else.`,
      }],
    });

    const reply = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    return NextResponse.json({ reply });
  }

  if (action === "approve_reply") {
    const { reviewId, reply } = body;
    await supabase.from("reviews")
      .update({ ai_reply: reply, status: "approved" })
      .eq("id", reviewId)
      .eq("user_id", user.id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
