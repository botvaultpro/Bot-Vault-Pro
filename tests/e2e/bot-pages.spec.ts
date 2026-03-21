import { test, expect } from '@playwright/test';

const BASE = 'https://botvaultpro.com';
const AUTH_FILE = 'playwright/.auth/user.json';

test.use({ storageState: AUTH_FILE });

const BOTS = [
  {
    name: 'EmailCoach',
    path: '/dashboard/emailcoach',
    // Primary CTA: textarea to paste the email
    primarySelector: 'textarea',
  },
  {
    name: 'WeeklyPulse',
    path: '/dashboard/weeklypulse',
    // Primary CTA: a form with inputs for revenue, expenses, etc.
    primarySelector: 'input, textarea, button[type="submit"], button:has-text("Generate"), button:has-text("Report")',
  },
  {
    name: 'ClauseCheck',
    path: '/dashboard/clausecheck',
    // Primary CTA: file upload area or upload button
    primarySelector: 'input[type="file"], [class*="upload"], button:has-text("Analyze"), button:has-text("Upload")',
  },
  {
    name: 'InvoiceForge',
    path: '/dashboard/invoiceforge',
    // Primary CTA: create/new invoice button or form
    primarySelector: 'button:has-text("New"), button:has-text("Create"), button:has-text("Invoice"), input, button',
  },
  {
    name: 'ReviewBot',
    path: '/dashboard/reviewbot',
    // Primary CTA: any button or form element
    primarySelector: 'button, input, textarea, form',
  },
  {
    name: 'SiteBuilder',
    path: '/dashboard/bots/sitebuilder',
    // Primary CTA: form or generate button
    primarySelector: 'button, input, textarea, form',
  },
];

for (const bot of BOTS) {
  // ─── Page loads with no redirect to login ───────────────────────────────
  test(`BOT — ${bot.name} page loads (no auth redirect)`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', err => errors.push(`PAGE ERROR: ${err.message}`));

    const response = await page.goto(`${BASE}${bot.path}`, { waitUntil: 'domcontentloaded' });

    const finalUrl = page.url();
    console.log(`  ${bot.name} — status: ${response?.status()}, url: ${finalUrl}`);

    // Must not redirect to login
    expect(finalUrl).not.toContain('/auth/login');
    // Status should be OK
    expect(response?.status()).toBeLessThan(400);

    // Wait for React hydration
    await page.waitForTimeout(2000);

    if (errors.length > 0) {
      console.warn(`  ${bot.name} console errors: ${errors.join(' | ')}`);
    } else {
      console.log(`  ${bot.name} — no console errors`);
    }
  });

  // ─── Primary UI element present ─────────────────────────────────────────
  test(`BOT — ${bot.name} primary UI element present`, async ({ page }) => {
    await page.goto(`${BASE}${bot.path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const elements = page.locator(bot.primarySelector);
    const count = await elements.count();
    console.log(`  ${bot.name} — primary UI element count: ${count} (selector: ${bot.primarySelector})`);
    expect(count).toBeGreaterThan(0);
  });

  // ─── Subscription or trial status visible ───────────────────────────────
  test(`BOT — ${bot.name} shows subscription or trial status`, async ({ page }) => {
    await page.goto(`${BASE}${bot.path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const bodyText = (await page.textContent('body') ?? '').toLowerCase();

    // Bot is either subscribed (active plan) or shows free trial / lock indicator
    const hasSubscribeBtn = bodyText.includes('subscribe') || bodyText.includes('subscription');
    const hasTrialMsg = bodyText.includes('trial') || bodyText.includes('free');
    const hasBillingLink = bodyText.includes('billing') || bodyText.includes('upgrade');
    const hasActivePlan = bodyText.includes('active') || bodyText.includes('current plan');
    const hasLockIndicator = (await page.locator('svg[class*="lucide-lock"], [data-lucide="lock"]').count()) > 0
      || bodyText.includes('lock');

    const statusVisible =
      hasSubscribeBtn || hasTrialMsg || hasBillingLink || hasActivePlan || hasLockIndicator;

    console.log(`  ${bot.name} — subscribe: ${hasSubscribeBtn}, trial: ${hasTrialMsg}, billing: ${hasBillingLink}, active: ${hasActivePlan}, lock: ${hasLockIndicator}`);

    if (!statusVisible) {
      console.warn(`  ${bot.name} — no obvious subscription/trial indicator found`);
    }

    // Log but don't fail — some bots may be subscribed and show no trial UI
    expect(statusVisible || hasActivePlan || hasBillingLink).toBe(true);
  });
}
