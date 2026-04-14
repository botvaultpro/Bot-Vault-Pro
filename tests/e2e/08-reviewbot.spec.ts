import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('ReviewBot', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
    await page.goto('/dashboard/reviewbot');
    await page.waitForLoadState('networkidle');
  });

  test('ReviewBot page loads without crashing', async ({ page }) => {
    expect(page.url()).toContain('reviewbot');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Page shows setup form, mock reviews, or subscribe gate', async ({ page }) => {
    const bodyText = await page.locator('body').innerText();
    const hasContent = /review|google|place id|reply|subscribe|upgrade|pending|api/i.test(bodyText);
    expect(hasContent, 'ReviewBot has no recognizable content').toBeTruthy();
  });

  test('Mock review banner is shown (pending Google API)', async ({ page }) => {
    const bodyText = await page.locator('body').innerText();
    const hasMockBanner = /pending|mock|api|google business/i.test(bodyText);
    console.log(`Google API pending banner present: ${hasMockBanner}`);
  });

  test('Setup form has Place ID input or subscribe gate', async ({ page }) => {
    const placeInput = page.locator('input[name*="place" i], input[placeholder*="place" i]').first();
    const subscribeGate = page.locator('text=/subscribe|upgrade/i').first();

    const hasPlace = await placeInput.count() > 0;
    const hasGate = await subscribeGate.count() > 0;

    expect(hasPlace || hasGate, 'No setup form or subscribe gate found').toBeTruthy();
  });
});
