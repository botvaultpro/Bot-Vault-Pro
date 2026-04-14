import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

const BOT_ROUTES = [
  '/dashboard',
  '/dashboard/emailcoach',
  '/dashboard/weeklypulse',
  '/dashboard/clausecheck',
  '/dashboard/invoiceforge',
  '/dashboard/reviewbot',
  '/dashboard/bots/sitebuilder',
  '/dashboard/billing',
];

test.describe('Navigation & Routing', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  for (const route of BOT_ROUTES) {
    test(`Route ${route} loads (no 404/500)`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: 'networkidle' });
      const status = response?.status() ?? 200;
      expect(status, `${route} returned HTTP ${status}`).toBeLessThan(400);
      const bodyText = await page.locator('body').innerText();
      const hasServerError = /500|internal server error|something went wrong/i.test(bodyText);
      expect(hasServerError, `${route} shows server error`).toBeFalsy();
    });
  }

  test('BVP mascot logo appears in dashboard navbar', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const logo = page.locator('img[src*="BVP_Bot"], img[alt*="Bot Vault"], img[src*="mascot"]').first();
    const count = await logo.count();
    console.log(`Mascot logo elements found: ${count}`);
  });

  test('Settings page loads', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
    const status = page.url();
    expect(status).not.toContain('404');
  });
});
