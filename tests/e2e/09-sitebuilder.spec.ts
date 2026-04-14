import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('SiteBuilder Pro', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
    await page.goto('/dashboard/bots/sitebuilder');
    await page.waitForLoadState('networkidle');
  });

  test('SiteBuilder page loads without crashing', async ({ page }) => {
    expect(page.url()).toContain('sitebuilder');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Page shows site generation form or subscribe gate', async ({ page }) => {
    const bodyText = await page.locator('body').innerText();
    const hasContent = /business type|generate|site|subscribe|upgrade/i.test(bodyText);
    expect(hasContent, 'SiteBuilder has no recognizable content').toBeTruthy();
  });

  test('Business type dropdown exists or subscribe gate shown', async ({ page }) => {
    const dropdown = page.locator('select').first();
    const subscribeGate = page.locator('text=/subscribe|upgrade/i').first();

    const hasDropdown = await dropdown.count() > 0;
    const hasGate = await subscribeGate.count() > 0;

    expect(hasDropdown || hasGate, 'No dropdown or subscribe gate found').toBeTruthy();
  });

  test('Pipeline page loads at /dashboard/sitebuilder/pipeline', async ({ page }) => {
    await page.goto('/dashboard/sitebuilder/pipeline');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
    const bodyText = await page.locator('body').innerText();
    const hasPipeline = /pipeline|kanban|column|card|subscribe|upgrade/i.test(bodyText);
    expect(hasPipeline, 'Pipeline page has no recognizable content').toBeTruthy();
  });
});
