import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

/**
 * Stripe Webhook Health Check
 * These tests verify the Stripe integration is wired up correctly.
 * They do NOT complete actual payments — they check that the plumbing exists.
 */
test.describe('Stripe Integration Health', () => {
  test('Stripe checkout opens for at least one bot subscription', async ({ page }) => {
    await loginAs(page);
    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');

    const subscribeBtn = page.locator('button, a').filter({ hasText: /subscribe|get started/i }).first();
    const btnCount = await subscribeBtn.count();

    if (btnCount === 0) {
      test.skip(true, 'No subscribe buttons — user already subscribed to all bots');
      return;
    }

    const navigationPromise = page.waitForURL(/stripe\.com|checkout/, { timeout: 15000 }).catch(() => null);
    const newPagePromise = page.context().waitForEvent('page', { timeout: 8000 }).catch(() => null);

    await subscribeBtn.click();
    await page.waitForTimeout(5000);

    const currentUrl = page.url();
    const newPage = await newPagePromise;
    const newPageUrl = newPage?.url() ?? '';

    const stripeOpened =
      currentUrl.includes('stripe.com') ||
      currentUrl.includes('checkout') ||
      newPageUrl.includes('stripe.com') ||
      newPageUrl.includes('checkout');

    expect(stripeOpened, `Expected Stripe checkout. Current URL: ${currentUrl}`).toBeTruthy();
  });

  test('Webhook endpoint exists and returns non-404', async ({ page }) => {
    const response = await page.request.post('/api/webhooks/stripe', {
      headers: { 'Content-Type': 'application/json' },
      data: '{}',
    });
    // 400 = route exists but rejected invalid signature — correct behavior
    // 404 = route missing — broken
    // 500 = route crashed — broken
    expect(response.status(), `Webhook route status: ${response.status()}`).not.toBe(404);
    expect(response.status()).not.toBe(500);
    console.log(`Stripe webhook endpoint status: ${response.status()} (400 = route exists, correct)`);
  });
});
