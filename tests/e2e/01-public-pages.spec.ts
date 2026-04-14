import { test, expect } from '@playwright/test';

test.describe('Public Pages', () => {
  test('Landing page loads with correct headline', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle(/Bot Vault Pro/i);
    const hero = page.locator('h1');
    await expect(hero).toBeVisible();
    await expect(hero).toContainText(/Stop Prompting|Bot Vault Pro|Automat/i);
  });

  test('Pricing page loads', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
    const pricingContent = page.locator('text=/\\$|per month|pricing/i').first();
    await expect(pricingContent).toBeVisible({ timeout: 10000 });
  });

  test('Login page loads', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('Signup page loads', async ({ page }) => {
    await page.goto('/auth/signup');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('Protected dashboard redirects unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const url = page.url();
    expect(url).toMatch(/auth|login|signin/i);
  });

  test('All 6 bot names mentioned on landing page or pricing', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const bodyText = await page.locator('body').innerText();
    const bots = ['EmailCoach', 'WeeklyPulse', 'ClauseCheck', 'InvoiceForge', 'ReviewBot', 'SiteBuilder'];
    const missing: string[] = [];
    for (const bot of bots) {
      if (!bodyText.includes(bot)) missing.push(bot);
    }
    if (missing.length > 0) {
      await page.goto('/pricing');
      await page.waitForLoadState('networkidle');
      const pricingText = await page.locator('body').innerText();
      const stillMissing = missing.filter(b => !pricingText.includes(b));
      expect(stillMissing, `Bots not found on landing or pricing: ${stillMissing.join(', ')}`).toHaveLength(0);
    }
  });
});
