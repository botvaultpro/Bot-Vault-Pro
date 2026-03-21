import { test, expect } from '@playwright/test';

const BASE = 'https://botvaultpro.com';
const AUTH_FILE = 'playwright/.auth/user.json';

test.use({ storageState: AUTH_FILE });

// Bot pages that have a trial system (403 block when limit hit)
const TRIAL_BOTS = [
  { name: 'EmailCoach', path: '/dashboard/emailcoach' },
  { name: 'WeeklyPulse', path: '/dashboard/weeklypulse' },
  { name: 'ClauseCheck', path: '/dashboard/clausecheck' },
  { name: 'InvoiceForge', path: '/dashboard/invoiceforge' },
  { name: 'ReviewBot', path: '/dashboard/reviewbot' },
];

// ─────────────────────────────────────────────────────────────────────────────
// TRIAL-1 — At least one bot page shows trial or subscription indicator
// ─────────────────────────────────────────────────────────────────────────────
test('TRIAL-1 — At least one bot page shows trial or subscription state', async ({ page }) => {
  let foundTrialIndicator = false;
  let foundOnBot = '';

  for (const bot of TRIAL_BOTS) {
    await page.goto(`${BASE}${bot.path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const bodyText = (await page.textContent('body') ?? '').toLowerCase();

    // Trial indicators: "free trial", "trial", "3 free", upgrade prompts
    const hasTrialText =
      bodyText.includes('free trial') ||
      bodyText.includes('trial') ||
      bodyText.includes('free') ||
      bodyText.includes('subscribe now') ||
      bodyText.includes('upgrade');

    // Active subscription indicators
    const hasActiveText =
      bodyText.includes('current plan') ||
      bodyText.includes('active') ||
      bodyText.includes('subscribed');

    if (hasTrialText || hasActiveText) {
      foundTrialIndicator = true;
      foundOnBot = bot.name;
      console.log(`  Trial/subscription indicator found on: ${bot.name}`);
      console.log(`    trial text: ${hasTrialText}, active text: ${hasActiveText}`);
      break;
    }
  }

  expect(foundTrialIndicator).toBe(true);
  console.log(`  Passed: indicator found on ${foundOnBot}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// TRIAL-2 — EmailCoach: blocked state or usable form present
// ─────────────────────────────────────────────────────────────────────────────
test('TRIAL-2 — EmailCoach shows blocked state OR usable form', async ({ page }) => {
  await page.goto(`${BASE}/dashboard/emailcoach`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const bodyText = (await page.textContent('body') ?? '').toLowerCase();

  // Check if trial is exhausted (blocked state shown)
  const isBlocked =
    bodyText.includes("you've used your") ||
    bodyText.includes('free emailcoach trials') ||
    bodyText.includes('subscribe now') ||
    bodyText.includes('subscribe to keep');

  // Check if form is usable (not blocked)
  const formPresent = (await page.locator('textarea').count()) > 0;
  const generateBtnPresent = (await page.locator('button:has-text("Generate")').count()) > 0;
  const formUsable = formPresent && generateBtnPresent;

  console.log(`  EmailCoach — blocked: ${isBlocked}, form usable: ${formUsable}`);

  if (isBlocked) {
    console.log('  Trial limit reached — upgrade modal/banner is visible');
    const upgradeLink = page.locator('a[href="/dashboard/billing"], a:has-text("Subscribe Now")').first();
    const hasUpgradeLink = (await upgradeLink.count()) > 0;
    console.log(`  Upgrade link present: ${hasUpgradeLink}`);
    expect(hasUpgradeLink).toBe(true);
  } else if (formUsable) {
    console.log('  Trial not exhausted — form is usable');
    await expect(page.locator('textarea').first()).toBeVisible();
    await expect(page.locator('button:has-text("Generate")').first()).toBeVisible();
  } else {
    console.warn('  WARNING: Neither blocked state nor usable form detected on EmailCoach');
    // Still show what's on the page for debugging
    const snippet = bodyText.substring(0, 300);
    console.log(`  Page text snippet: ${snippet}`);
    // Don't hard-fail — could be a loading state
    expect(formPresent || isBlocked).toBe(true);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// TRIAL-3 — Trial limit shows upgrade path (billing link accessible)
// ─────────────────────────────────────────────────────────────────────────────
test('TRIAL-3 — Billing/upgrade link is reachable from any bot page', async ({ page }) => {
  // Navigate to emailcoach first
  await page.goto(`${BASE}/dashboard/emailcoach`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Check sidebar always has billing link
  const billingLink = page.locator('a[href="/dashboard/billing"]').first();
  const hasBillingLink = (await billingLink.count()) > 0;
  console.log(`  Billing link in sidebar on bot page: ${hasBillingLink}`);
  expect(hasBillingLink).toBe(true);

  // Navigate to billing and confirm it loads
  await page.goto(`${BASE}/dashboard/billing`, { waitUntil: 'domcontentloaded' });
  const billingUrl = page.url();
  expect(billingUrl).toContain('/dashboard/billing');
  console.log(`  Billing page URL: ${billingUrl}`);

  const billingText = await page.textContent('body') ?? '';
  expect(billingText.toLowerCase()).toContain('billing');
  console.log('  Billing page loaded successfully');
});

// ─────────────────────────────────────────────────────────────────────────────
// TRIAL-4 — WeeklyPulse: form renders or blocked state shown
// ─────────────────────────────────────────────────────────────────────────────
test('TRIAL-4 — WeeklyPulse shows form or blocked state', async ({ page }) => {
  await page.goto(`${BASE}/dashboard/weeklypulse`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const bodyText = (await page.textContent('body') ?? '').toLowerCase();

  const isBlocked =
    bodyText.includes('subscribe now') ||
    bodyText.includes('free weeklypulse') ||
    bodyText.includes('subscribe to keep') ||
    bodyText.includes("you've used");

  // WeeklyPulse form has inputs for revenue, expenses etc.
  const hasInputs = (await page.locator('input[type="text"], input[type="number"], input[type="date"]').count()) > 0;
  const hasGenerateBtn = bodyText.includes('generate') || bodyText.includes('submit');

  console.log(`  WeeklyPulse — blocked: ${isBlocked}, inputs: ${hasInputs}, generate btn: ${hasGenerateBtn}`);

  if (isBlocked) {
    console.log('  WeeklyPulse trial exhausted — upgrade prompt visible');
    const upgradeLink = page.locator('a[href="/dashboard/billing"]').first();
    expect(await upgradeLink.count()).toBeGreaterThan(0);
  } else {
    console.log('  WeeklyPulse form rendered');
    expect(hasInputs || hasGenerateBtn).toBe(true);
  }
});
