import { test, expect } from '@playwright/test';
import { loginAs, TEST_USER } from './helpers/auth';

test.describe('Authentication', () => {
  test('Login with valid credentials reaches dashboard', async ({ page }) => {
    await loginAs(page);
    expect(page.url()).toContain('/dashboard');
  });

  test('Login with bad password shows error', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', 'wrongpassword999');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    const hasError = await page.locator('text=/invalid|incorrect|wrong|error/i').count();
    const stillOnLogin = page.url().includes('login') || page.url().includes('auth');
    expect(hasError > 0 || stillOnLogin).toBeTruthy();
  });

  test('Dashboard routes are protected after logout', async ({ page }) => {
    await page.goto('/dashboard/emailcoach');
    await page.waitForLoadState('networkidle');
    expect(page.url()).not.toContain('/dashboard');
  });

  test('Dashboard loads with all 6 bot cards visible', async ({ page }) => {
    await loginAs(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const bodyText = await page.locator('body').innerText();
    const bots = ['EmailCoach', 'WeeklyPulse', 'ClauseCheck', 'InvoiceForge', 'ReviewBot', 'SiteBuilder'];
    const missing = bots.filter(b => !bodyText.includes(b));
    expect(missing, `Missing bots on dashboard: ${missing.join(', ')}`).toHaveLength(0);
  });

  test('Sidebar shows all 6 bots', async ({ page }) => {
    await loginAs(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const sidebar = page.locator('nav, aside, [data-testid="sidebar"]').first();
    const sidebarText = await sidebar.innerText().catch(() => '');
    const bots = ['EmailCoach', 'WeeklyPulse', 'ClauseCheck', 'InvoiceForge', 'ReviewBot', 'SiteBuilder'];
    const missing = bots.filter(b => !sidebarText.includes(b));
    if (sidebarText.length < 10) {
      const bodyText = await page.locator('body').innerText();
      const missingFromBody = bots.filter(b => !bodyText.includes(b));
      expect(missingFromBody, `Missing bots: ${missingFromBody.join(', ')}`).toHaveLength(0);
    } else {
      expect(missing, `Missing from sidebar: ${missing.join(', ')}`).toHaveLength(0);
    }
  });
});
