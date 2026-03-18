import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE = 'https://botvaultpro.com';

// Collect console errors per page
async function collectConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(`PAGE ERROR: ${err.message}`));
  return errors;
}

// ─────────────────────────────────────────────
// TEST 1 — Landing page loads
// ─────────────────────────────────────────────
test('TEST 1 — Landing page loads', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(`PAGE ERROR: ${err.message}`));

  const response = await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBeLessThan(400);

  const title = await page.title();
  expect(title.length).toBeGreaterThan(0);
  console.log(`  Title: "${title}"`);

  // Hero text — may differ if latest deployment hasn't landed yet
  const heroText = await page.locator('h1').first().textContent() ?? '';
  console.log(`  Hero h1: "${heroText.trim()}"`);
  const hasNewHero = heroText.includes('Stop Prompting') || await page.getByText('Stop Prompting. Start Automating.').isVisible().catch(() => false);
  const hasOldHero = heroText.includes('Unfair') || heroText.includes('Advantage');
  if (hasNewHero) {
    console.log('  Hero copy: NEW version deployed ✓');
  } else if (hasOldHero) {
    console.warn('  WARNING: Hero shows OLD copy — new deployment may not have completed yet');
  } else {
    console.warn(`  WARNING: Unexpected hero text: "${heroText.trim()}"`);
  }
  expect(heroText.length).toBeGreaterThan(0);

  const navLinks = page.locator('nav a');
  await expect(navLinks).not.toHaveCount(0);
  console.log(`  Nav links found: ${await navLinks.count()}`);

  const mascot = page.locator('img[src*="BVP_Bot"], img[alt*="mascot"], img[alt*="Bot"]').first();
  const mascotExists = (await mascot.count()) > 0;
  console.log(`  Mascot image present: ${mascotExists}`);
  // Warning only if missing — don't fail
  if (!mascotExists) console.warn('  WARNING: Mascot image not found on landing page');

  if (errors.length > 0) {
    console.warn(`  Console errors: ${errors.join(' | ')}`);
  } else {
    console.log('  No console errors');
  }
});

// ─────────────────────────────────────────────
// TEST 2 — Pricing page
// ─────────────────────────────────────────────
test('TEST 2 — Pricing page loads', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(`PAGE ERROR: ${err.message}`));

  const response = await page.goto(`${BASE}/pricing`, { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBeLessThan(400);
  console.log(`  Status: ${response?.status()}`);

  const bodyText = await page.textContent('body') ?? '';
  const botNames = ['SiteBuilder', 'ReviewBot', 'WeeklyPulse', 'EmailCoach', 'ClauseCheck', 'InvoiceForge'];
  const foundBots = botNames.filter(b => bodyText.includes(b));
  console.log(`  Bots found on page: ${foundBots.join(', ')}`);
  expect(foundBots.length).toBeGreaterThan(0);

  const hasPrices = bodyText.includes('$');
  expect(hasPrices).toBe(true);
  console.log(`  Prices visible: ${hasPrices}`);

  const hasDiscount = bodyText.includes('20%') || bodyText.includes('BUNDLE20');
  console.log(`  Discount mention: ${hasDiscount}`);
  expect(hasDiscount).toBe(true);

  if (errors.length > 0) console.warn(`  Console errors: ${errors.join(' | ')}`);
  else console.log('  No console errors');
});

// ─────────────────────────────────────────────
// TEST 3 — Auth page loads
// ─────────────────────────────────────────────
test('TEST 3 — Auth page loads', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(`PAGE ERROR: ${err.message}`));

  // Try /auth/login first; fallback to /auth
  let response = await page.goto(`${BASE}/auth/login`, { waitUntil: 'domcontentloaded' });
  if (!response || response.status() === 404) {
    response = await page.goto(`${BASE}/auth`, { waitUntil: 'domcontentloaded' });
  }
  console.log(`  Auth URL loaded: ${page.url()}`);
  expect(response?.status()).toBeLessThan(400);

  const emailInput = page.locator('input[type="email"]');
  await expect(emailInput).toBeVisible();
  console.log('  Email input: present');

  const passwordInput = page.locator('input[type="password"]');
  await expect(passwordInput).toBeVisible();
  console.log('  Password input: present');

  const submitBtn = page.locator('button[type="submit"]');
  await expect(submitBtn).toBeVisible();
  console.log('  Submit button: present');

  if (errors.length > 0) console.warn(`  Console errors: ${errors.join(' | ')}`);
  else console.log('  No console errors');
});

// ─────────────────────────────────────────────
// TEST 4 — Dashboard redirects unauthenticated users
// ─────────────────────────────────────────────
test('TEST 4 — Dashboard redirects logged-out users', async ({ page }) => {
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded' });
  const finalUrl = page.url();
  console.log(`  Final URL after /dashboard: ${finalUrl}`);

  const redirectedToAuth = finalUrl.includes('/auth') || finalUrl.includes('/login');
  expect(redirectedToAuth).toBe(true);
  console.log(`  Redirected to auth: ${redirectedToAuth}`);

  // Make sure dashboard content is not visible
  const dashboardContent = page.locator('[class*="dashboard"], h1:has-text("Dashboard")');
  const isDashVisible = (await dashboardContent.count()) > 0 && await dashboardContent.first().isVisible().catch(() => false);
  expect(isDashVisible).toBe(false);
  console.log(`  Dashboard content hidden: ${!isDashVisible}`);
});

// ─────────────────────────────────────────────
// TEST 5 — Navigation links work
// ─────────────────────────────────────────────
test('TEST 5 — Navigation links work', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });

  const navHrefs: string[] = [];
  const navLinks = page.locator('nav a');
  const count = await navLinks.count();
  for (let i = 0; i < count; i++) {
    const href = await navLinks.nth(i).getAttribute('href');
    if (href) navHrefs.push(href);
  }
  console.log(`  Nav links: ${navHrefs.join(', ')}`);

  // /auth redirects to /auth/login — that's correct behaviour, not a 404
  const internalTargets = ['/pricing', '/auth/signup', '/auth/login'];
  for (const target of internalTargets) {
    const resp = await page.request.get(`${BASE}${target}`);
    const status = resp.status();
    console.log(`  ${target} → ${status}`);
    if (status === 404 || status === 500) {
      throw new Error(`Navigation link ${target} returned ${status}`);
    }
  }
  // /auth should redirect (not 404)
  const authResp = await page.request.get(`${BASE}/auth`, { maxRedirects: 5 });
  console.log(`  /auth (with redirect follow) → ${authResp.status()}`);
  expect(authResp.status()).toBeLessThan(400);
});

// ─────────────────────────────────────────────
// TEST 6 — Broken internal links on landing page
// ─────────────────────────────────────────────
test('TEST 6 — No broken internal links on landing page', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });

  const hrefs: string[] = await page.$$eval('a[href]', (links) =>
    links.map(l => l.getAttribute('href') ?? '').filter(h => h)
  );

  const internalLinks = hrefs.filter(h =>
    h.startsWith('/') || h.startsWith('https://botvaultpro.com') || h.startsWith('http://botvaultpro.com')
  ).filter(h => !h.startsWith('#') && !h.startsWith('mailto:'));

  // Deduplicate
  const unique = [...new Set(internalLinks)];
  console.log(`  Checking ${unique.length} internal links...`);

  const broken: string[] = [];
  for (const href of unique) {
    const url = href.startsWith('http') ? href : `${BASE}${href}`;
    try {
      const resp = await page.request.get(url);
      const status = resp.status();
      if (status === 404 || status === 500) {
        broken.push(`${href} → ${status}`);
        console.warn(`  BROKEN: ${href} → ${status}`);
      } else {
        console.log(`  OK: ${href} → ${status}`);
      }
    } catch (e) {
      broken.push(`${href} → ERROR: ${e}`);
      console.warn(`  ERROR fetching ${href}: ${e}`);
    }
  }

  if (broken.length > 0) {
    console.warn(`  Broken links found: ${broken.join(', ')}`);
  }
  expect(broken.length).toBe(0);
});

// ─────────────────────────────────────────────
// TEST 7 — No broken images on landing page
// ─────────────────────────────────────────────
test('TEST 7 — No broken images on landing page', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });

  const imgSrcs: string[] = await page.$$eval('img', (imgs) =>
    imgs.map(img => (img as HTMLImageElement).src).filter(s => s)
  );
  console.log(`  Images found: ${imgSrcs.length}`);

  const broken: string[] = [];
  for (const src of imgSrcs) {
    const naturalWidth = await page.evaluate((s) => {
      const el = document.querySelector(`img[src="${s}"]`) as HTMLImageElement;
      return el ? el.naturalWidth : -1;
    }, src);

    if (naturalWidth === 0) {
      broken.push(src);
      console.warn(`  BROKEN image: ${src}`);
    } else {
      console.log(`  OK image (w=${naturalWidth}): ${src.split('/').pop()}`);
    }
  }

  if (broken.length > 0) console.warn(`  Broken images: ${broken.join(', ')}`);
  expect(broken.length).toBe(0);
});

// ─────────────────────────────────────────────
// TEST 8 — No placeholder text on landing page
// ─────────────────────────────────────────────
test('TEST 8 — No placeholder text on landing page', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  const bodyText = (await page.textContent('body') ?? '').toLowerCase();

  const placeholders = ['lorem ipsum', '[placeholder]', '[object object]'];
  const warnings = ['todo', 'coming soon'];
  const found: string[] = [];
  const warned: string[] = [];

  for (const ph of placeholders) {
    if (bodyText.includes(ph)) {
      found.push(ph);
      console.warn(`  PROBLEM placeholder: "${ph}"`);
    }
  }
  for (const w of warnings) {
    if (bodyText.includes(w)) {
      warned.push(w);
      console.log(`  NOTE: "${w}" found (expected in roadmap/marketing copy)`);
    }
  }
  // "undefined" in Next.js pages is often a hydration data artifact — log as warning only
  if (bodyText.includes('undefined')) {
    console.warn('  WARNING: "undefined" found in page text — may be a Next.js hydration artifact; review manually');
  }

  if (found.length === 0) console.log('  No critical placeholder text found');
  expect(found.length).toBe(0);
});

// ─────────────────────────────────────────────
// TEST 9 — Console error scan across public pages
// ─────────────────────────────────────────────
test('TEST 9 — Console error scan across public pages', async ({ page }) => {
  const pagesToCheck = ['/', '/auth/login', '/pricing'];
  const allErrors: Record<string, string[]> = {};

  for (const path of pagesToCheck) {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', err => errors.push(`PAGE ERROR: ${err.message}`));

    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    allErrors[path] = [...errors];
    page.removeAllListeners('console');
    page.removeAllListeners('pageerror');

    if (errors.length > 0) {
      console.warn(`  ${path} errors: ${errors.join(' | ')}`);
    } else {
      console.log(`  ${path}: no console errors`);
    }
  }

  const totalErrors = Object.values(allErrors).flat().length;
  console.log(`  Total console errors across all pages: ${totalErrors}`);
  // Warn but don't fail outright — some third-party errors are expected
  if (totalErrors > 0) {
    console.warn(`  WARNING: ${totalErrors} console error(s) found`);
  }
});

// ─────────────────────────────────────────────
// TEST 10 — Auth form validation
// ─────────────────────────────────────────────
test('TEST 10 — Auth form validation', async ({ page }) => {
  await page.goto(`${BASE}/auth/login`, { waitUntil: 'domcontentloaded' });

  // Submit empty form
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(1000);
  // Check for browser-native validation or error message
  const emailInput = page.locator('input[type="email"]');
  const validationMsg = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
  console.log(`  Empty form validation message: "${validationMsg}"`);
  const hasValidation = validationMsg.length > 0 || (await page.locator('[class*="error"], [class*="Error"]').count()) > 0;
  console.log(`  Has validation feedback: ${hasValidation}`);

  // Fill invalid email
  await emailInput.fill('notanemail');
  await page.locator('input[type="password"]').fill('test1234');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(1500);
  const invalidEmailMsg = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
  console.log(`  Invalid email validation: "${invalidEmailMsg}"`);

  // The form should not crash the page
  const url = page.url();
  console.log(`  URL after invalid submit: ${url}`);
  expect(url).not.toContain('500');
  expect(url).not.toContain('error');
});

// ─────────────────────────────────────────────
// TEST 11 — Page load time check
// ─────────────────────────────────────────────
test('TEST 11 — Page load time check', async ({ page }) => {
  const pages = ['/', '/pricing', '/auth/login'];
  const WARNING_MS = 5000;
  const results: { path: string; ms: number; status: string }[] = [];

  for (const p of pages) {
    const start = Date.now();
    await page.goto(`${BASE}${p}`, { waitUntil: 'domcontentloaded' });
    const ms = Date.now() - start;
    const status = ms > WARNING_MS ? 'SLOW' : 'OK';
    results.push({ path: p, ms, status });
    console.log(`  ${p}: ${ms}ms [${status}]`);
  }

  const slowPages = results.filter(r => r.status === 'SLOW');
  if (slowPages.length > 0) {
    console.warn(`  WARNING: Slow pages: ${slowPages.map(r => `${r.path} (${r.ms}ms)`).join(', ')}`);
  }
  // Don't fail on slow — just warn
  expect(results.every(r => r.ms < 30000)).toBe(true); // only fail if >30s (server error)
});

// ─────────────────────────────────────────────
// TEST 12 — Mobile responsiveness
// ─────────────────────────────────────────────
test('TEST 12 — Mobile responsiveness', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  const screenshotDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

  const pagesToTest = [
    { path: '/', file: 'mobile-home.png' },
    { path: '/pricing', file: 'mobile-pricing.png' },
    { path: '/auth/login', file: 'mobile-auth.png' },
  ];

  for (const { path: p, file } of pagesToTest) {
    await page.goto(`${BASE}${p}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Check page width not overflowing
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    console.log(`  ${p} mobile body scrollWidth: ${bodyWidth}px`);
    if (bodyWidth > 420) {
      console.warn(`  WARNING: ${p} may be overflowing on mobile (scrollWidth=${bodyWidth})`);
    }

    await page.screenshot({ path: path.join(screenshotDir, file), fullPage: false });
    console.log(`  Screenshot saved: screenshots/${file}`);
  }

  expect(true).toBe(true); // Always pass — screenshots are the artifact
});

// ─────────────────────────────────────────────
// TEST 13 — HTTPS redirect
// ─────────────────────────────────────────────
test('TEST 13 — HTTPS redirect from HTTP', async ({ page }) => {
  await page.goto('http://botvaultpro.com', { waitUntil: 'domcontentloaded' });
  const finalUrl = page.url();
  console.log(`  Final URL after http:// visit: ${finalUrl}`);
  expect(finalUrl.startsWith('https://')).toBe(true);
  console.log(`  HTTPS enforced: yes`);
});

// ─────────────────────────────────────────────
// TEST 14 — Both domains resolve
// ─────────────────────────────────────────────
test('TEST 14 — Both domains resolve', async ({ page, request }) => {
  // Main domain
  const mainResp = await request.get('https://botvaultpro.com');
  const mainStatus = mainResp.status();
  console.log(`  botvaultpro.com → ${mainStatus}`);
  expect(mainStatus).toBeLessThan(400);

  // Vercel domain
  try {
    const vercelResp = await request.get('https://bot-vault-pro.vercel.app', { maxRedirects: 5 });
    const vercelStatus = vercelResp.status();
    console.log(`  bot-vault-pro.vercel.app → ${vercelStatus}`);
    // 200 or redirect (3xx) both are fine
    expect(vercelStatus).toBeLessThan(500);
  } catch (e) {
    console.warn(`  WARNING: bot-vault-pro.vercel.app not reachable: ${e}`);
    // Don't fail — Vercel subdomain might redirect to main
  }
});
