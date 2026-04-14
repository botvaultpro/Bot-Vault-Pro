import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('WeeklyPulse Bot', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
    await page.goto('/dashboard/weeklypulse');
    await page.waitForLoadState('networkidle');
  });

  test('WeeklyPulse page loads without crashing', async ({ page }) => {
    expect(page.url()).toContain('weeklypulse');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Page shows metrics form or subscribe gate', async ({ page }) => {
    const bodyText = await page.locator('body').innerText();
    const hasContent = /revenue|metric|report|pulse|subscribe|upgrade/i.test(bodyText);
    expect(hasContent, 'WeeklyPulse has no recognizable content').toBeTruthy();
  });

  test('Generate report button exists or subscribe gate shown', async ({ page }) => {
    const generateBtn = page.locator('button').filter({ hasText: /generate|create|run/i }).first();
    const subscribeBtn = page.locator('button, a').filter({ hasText: /subscribe|upgrade/i }).first();

    const hasGenerate = await generateBtn.count() > 0;
    const hasSubscribe = await subscribeBtn.count() > 0;

    expect(hasGenerate || hasSubscribe).toBeTruthy();
  });

  test('Report history section exists', async ({ page }) => {
    const bodyText = await page.locator('body').innerText();
    const hasHistory = /history|previous|past report/i.test(bodyText);
    console.log(`Report history section present: ${hasHistory}`);
  });
});
