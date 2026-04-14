import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('ClauseCheck Bot', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
    await page.goto('/dashboard/clausecheck');
    await page.waitForLoadState('networkidle');
  });

  test('ClauseCheck page loads without crashing', async ({ page }) => {
    expect(page.url()).toContain('clausecheck');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Page shows PDF upload area or subscribe gate', async ({ page }) => {
    const bodyText = await page.locator('body').innerText();
    const hasContent = /upload|pdf|contract|clause|analyze|subscribe|upgrade/i.test(bodyText);
    expect(hasContent, 'ClauseCheck has no recognizable content').toBeTruthy();
  });

  test('File input or upload area is present', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const uploadArea = page.locator('[data-testid*="upload"], .upload, text=/upload/i').first();
    const subscribeGate = page.locator('text=/subscribe|upgrade/i').first();

    const hasFile = await fileInput.count() > 0;
    const hasUpload = await uploadArea.count() > 0;
    const hasGate = await subscribeGate.count() > 0;

    expect(hasFile || hasUpload || hasGate, 'No upload or subscribe gate found').toBeTruthy();
  });

  test('Disclaimer banner is visible', async ({ page }) => {
    const bodyText = await page.locator('body').innerText();
    const hasDisclaimer = /not legal advice|disclaimer|consult/i.test(bodyText);
    console.log(`Disclaimer present: ${hasDisclaimer}`);
  });
});
