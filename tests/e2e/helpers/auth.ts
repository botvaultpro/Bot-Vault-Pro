import { Page } from '@playwright/test';

export const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'testuser@botvaultpro.com',
  password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
};

export async function loginAs(page: Page, email = TEST_USER.email, password = TEST_USER.password) {
  await page.goto('/auth/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
}

export async function logout(page: Page) {
  try {
    await page.click('[data-testid="logout-button"]', { timeout: 3000 });
  } catch {
    await page.goto('/api/auth/signout');
  }
  await page.waitForURL(/\/(auth|$)/, { timeout: 10000 });
}
