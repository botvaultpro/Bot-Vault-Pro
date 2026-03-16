import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    description: "Perfect for getting started",
    features: [
      "25 leads per run",
      "10 content blasts/month",
      "50 support tickets/month",
      "10 site prospects/month",
      "Blog content only",
      "Demo site generation",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 149,
    priceId: process.env.STRIPE_GROWTH_PRICE_ID!,
    description: "For growing businesses",
    popular: true,
    features: [
      "250 leads per run + AI qualification",
      "100 content blasts/month",
      "500 support tickets/month",
      "100 site prospects/month",
      "Twitter, LinkedIn & Blog",
      "Full 3-email drip sequences",
      "IMAP inbox automation",
      "Pipeline CRM",
      "Cron scheduling",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    description: "Unlimited scale",
    features: [
      "Unlimited everything",
      "All platforms",
      "Priority support",
      "Custom integrations",
      "Dedicated onboarding",
    ],
  },
];
