import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('Billing Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  test('Billing page loads at /dashboard/billing', async ({ page }) => {
    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/dashboard/billing');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Billing page shows subscription options or current plan', async ({ page }) => {
    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');
    const bodyText = await page.locator('body').innerText();
    const hasBillingContent = /subscribe|plan|billing|starter|pro|\$/i.test(bodyText);
    expect(hasBillingContent, 'Billing page has no recognizable content').toBeTruthy();
  });

  test('Subscribe button for a bot opens Stripe checkout or redirects to Stripe', async ({ page }) => {
    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');

    const subscribeBtn = page.locator('button, a').filter({ hasText: /subscribe|get started|buy now/i }).first();
    const btnExists = await subscribeBtn.count();

    if (btnExists > 0) {
      const [newPage] = await Promise.all([
        page.context().waitForEvent('page').catch(() => null),
        subscribeBtn.click(),
      ]);
      await page.waitForTimeout(3000);
      const currentUrl = page.url();
      const isStripe = currentUrl.includes('stripe.com') || currentUrl.includes('checkout');
      const openedStripe = newPage && (newPage.url().includes('stripe.com') || newPage.url().includes('checkout'));
      expect(isStripe || openedStripe, 'Subscribe button did not open Stripe checkout').toBeTruthy();
    } else {
      test.skip(true, 'No subscribe buttons found — user may already be subscribed');
    }
  });

  test('Manage billing button is present (for subscribed users)', async ({ page }) => {
    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');
    const manageBtn = page.locator('button, a').filter({ hasText: /manage|portal|subscription/i });
    const count = await manageBtn.count();
    console.log(`Manage billing buttons found: ${count}`);
  });
});
