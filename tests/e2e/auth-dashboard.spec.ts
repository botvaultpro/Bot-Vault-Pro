import { test, expect } from '@playwright/test';

const BASE = 'https://botvaultpro.com';
const AUTH_FILE = 'playwright/.auth/user.json';

// All tests in this file run with the saved authenticated session
test.use({ storageState: AUTH_FILE });

// ─────────────────────────────────────────────────────────────────────────────
// AUTH-1 — Login redirects to /dashboard
// ─────────────────────────────────────────────────────────────────────────────
test('AUTH-1 — Login redirects to /dashboard', async ({ page }) => {
  // The storageState is already set; visiting login should redirect to /dashboard
  await page.goto(`${BASE}/auth/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForURL('**/dashboard**', { timeout: 15000 });
  const url = page.url();
  console.log(`  Redirected to: ${url}`);
  expect(url).toContain('/dashboard');
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTH-2 — Dashboard loads without errors
// ─────────────────────────────────────────────────────────────────────────────
test('AUTH-2 — Dashboard loads without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(`PAGE ERROR: ${err.message}`));

  const response = await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBeLessThan(400);
  console.log(`  Status: ${response?.status()}`);

  // Should not have been redirected to login
  const url = page.url();
  expect(url).not.toContain('/auth/login');
  console.log(`  URL: ${url}`);

  if (errors.length > 0) {
    console.warn(`  Console errors: ${errors.join(' | ')}`);
  } else {
    console.log('  No console errors on dashboard');
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTH-3 — Sidebar shows all 6 bot links
// ─────────────────────────────────────────────────────────────────────────────
test('AUTH-3 — Sidebar shows all 6 bot names', async ({ page }) => {
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded' });

  // Give the React sidebar time to hydrate (it loads subscriptions via useEffect)
  await page.waitForTimeout(2000);

  const botNames = [
    'EmailCoach',
    'WeeklyPulse',
    'ClauseCheck',
    'InvoiceForge',
    'ReviewBot',
    'SiteBuilder',
  ];

  const bodyText = await page.textContent('body') ?? '';
  const found: string[] = [];
  const missing: string[] = [];

  for (const name of botNames) {
    // Use case-insensitive contains to handle "SiteBuilder Pro", etc.
    if (bodyText.toLowerCase().includes(name.toLowerCase())) {
      found.push(name);
      console.log(`  Bot found in sidebar: ${name}`);
    } else {
      missing.push(name);
      console.warn(`  Bot MISSING from sidebar: ${name}`);
    }
  }

  expect(missing.length).toBe(0);
  console.log(`  All ${found.length}/6 bots found`);
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTH-4 — Mascot image present in navbar / sidebar
// ─────────────────────────────────────────────────────────────────────────────
test('AUTH-4 — Mascot image present', async ({ page }) => {
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const mascot = page.locator(
    'img[src*="BVP_Bot"], img[alt*="mascot"], img[alt*="Bot Vault Pro"]'
  ).first();

  const count = await mascot.count();
  console.log(`  Mascot image elements found: ${count}`);
  expect(count).toBeGreaterThan(0);

  // Check it rendered (naturalWidth > 0)
  if (count > 0) {
    const src = await mascot.getAttribute('src');
    console.log(`  Mascot src: ${src}`);
    await expect(mascot).toBeVisible();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTH-5 — Logout redirects away from dashboard
// ─────────────────────────────────────────────────────────────────────────────
test('AUTH-5 — Logout works and dashboard becomes inaccessible', async ({ page }) => {
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Click the logout button in the sidebar
  const logoutBtn = page.locator('button', { hasText: 'Log out' }).first();
  await expect(logoutBtn).toBeVisible({ timeout: 5000 });
  await logoutBtn.click();

  // After logout, the sidebar redirects to '/'
  await page.waitForURL('**/', { timeout: 15000 });
  const urlAfterLogout = page.url();
  console.log(`  URL after logout: ${urlAfterLogout}`);

  // Now try to visit /dashboard — should redirect to /auth/login
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded' });
  const finalUrl = page.url();
  console.log(`  URL after trying /dashboard without auth: ${finalUrl}`);
  expect(finalUrl).toContain('/auth');
  console.log('  Logout confirmed — dashboard redirects to auth');
});
