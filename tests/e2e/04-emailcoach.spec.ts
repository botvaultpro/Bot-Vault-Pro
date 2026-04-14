import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('EmailCoach Bot', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
    await page.goto('/dashboard/emailcoach');
    await page.waitForLoadState('networkidle');
  });

  test('EmailCoach page loads without crashing', async ({ page }) => {
    expect(page.url()).toContain('emailcoach');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Page shows email input area or subscribe gate', async ({ page }) => {
    const bodyText = await page.locator('body').innerText();
    const hasContent = /paste|email|reply|compose|subscribe|upgrade/i.test(bodyText);
    expect(hasContent, 'EmailCoach page has no recognizable content').toBeTruthy();
  });

  test('Email input textarea is present (if subscribed/trial)', async ({ page }) => {
    const textarea = page.locator('textarea').first();
    const inputArea = page.locator('input[placeholder*="email" i], textarea[placeholder*="email" i]').first();
    const subscribeGate = page.locator('text=/subscribe|upgrade/i').first();

    const hasTextarea = await textarea.count() > 0;
    const hasInput = await inputArea.count() > 0;
    const hasGate = await subscribeGate.count() > 0;

    expect(hasTextarea || hasInput || hasGate, 'No email input or subscribe gate found').toBeTruthy();
  });

  test('Generate button is present or subscribe prompt shown', async ({ page }) => {
    const generateBtn = page.locator('button').filter({ hasText: /generate|create|write/i }).first();
    const subscribeBtn = page.locator('button, a').filter({ hasText: /subscribe|upgrade/i }).first();

    const hasGenerate = await generateBtn.count() > 0;
    const hasSubscribe = await subscribeBtn.count() > 0;

    expect(hasGenerate || hasSubscribe, 'No action button found on EmailCoach').toBeTruthy();
  });
});
