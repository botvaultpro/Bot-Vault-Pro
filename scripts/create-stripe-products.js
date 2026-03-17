#!/usr/bin/env node
/**
 * Run with: node scripts/create-stripe-products.js
 * Creates all per-bot Stripe products and prices, then prints env vars to add to .env
 */

const Stripe = require("stripe");
require("dotenv").config({ path: ".env" });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const bots = [
  { slug: "sitebuilder", name: "SiteBuilder Pro", starterPrice: 4900, proPrice: 9900 },
  { slug: "reviewbot",   name: "ReviewBot",        starterPrice: 2900, proPrice: 4900 },
  { slug: "invoiceforge",name: "InvoiceForge",     starterPrice: 2900, proPrice: 4900 },
  { slug: "clausecheck", name: "ClauseCheck",      starterPrice: 2900, proPrice: 4900 },
  { slug: "weeklypulse", name: "WeeklyPulse",      starterPrice: 1900, proPrice: 3900 },
  { slug: "emailcoach",  name: "EmailCoach",       starterPrice: 1900, proPrice: 3900 },
];

async function main() {
  console.log("Creating Stripe products and prices...\n");
  const envLines = [];

  for (const bot of bots) {
    // Create product
    const product = await stripe.products.create({
      name: bot.name,
      metadata: { bot_slug: bot.slug },
    });
    console.log(`Created product: ${product.name} (${product.id})`);

    // Starter price
    const starterPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: bot.starterPrice,
      currency: "usd",
      recurring: { interval: "month" },
      metadata: { bot_slug: bot.slug, tier: "starter" },
    });
    console.log(`  Starter: ${starterPrice.id} ($${bot.starterPrice / 100}/mo)`);

    // Pro price
    const proPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: bot.proPrice,
      currency: "usd",
      recurring: { interval: "month" },
      metadata: { bot_slug: bot.slug, tier: "pro" },
    });
    console.log(`  Pro:     ${proPrice.id} ($${bot.proPrice / 100}/mo)\n`);

    const envKey = bot.slug.toUpperCase().replace(/-/g, "_");
    envLines.push(`STRIPE_${envKey}_STARTER_PRICE_ID=${starterPrice.id}`);
    envLines.push(`STRIPE_${envKey}_PRO_PRICE_ID=${proPrice.id}`);
  }

  // Create BUNDLE20 coupon
  try {
    await stripe.coupons.create({
      id: "BUNDLE20",
      percent_off: 20,
      duration: "forever",
      name: "Bundle 20% Off",
    });
    console.log("Created coupon: BUNDLE20 (20% off forever)\n");
  } catch (e) {
    if (e.code === "resource_already_exists") {
      console.log("Coupon BUNDLE20 already exists.\n");
    } else {
      throw e;
    }
  }

  console.log("=== ADD THESE TO YOUR .env FILE ===\n");
  envLines.forEach((l) => console.log(l));
  console.log("\n===================================");
}

main().catch(console.error);
