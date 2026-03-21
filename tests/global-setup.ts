import { chromium, FullConfig } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

export default async function globalSetup(_config: FullConfig) {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  const authDir = path.resolve(__dirname, '../playwright/.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const authFile = path.resolve(authDir, 'user.json');

  if (!email || !password) {
    // Write an empty storageState so the file exists and public tests can still run.
    // Authenticated tests that depend on this file will fail with a redirect to login,
    // which makes the failure reason obvious in the test output.
    fs.writeFileSync(
      authFile,
      JSON.stringify({ cookies: [], origins: [] }, null, 2)
    );
    console.error(
      '\n[global-setup] ERROR: TEST_USER_EMAIL and TEST_USER_PASSWORD must be set in .env.local\n' +
      '[global-setup] Authenticated tests will fail — public tests will still run.\n'
    );
    return;
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('[global-setup] Navigating to /auth/login...');
    await page.goto('https://botvaultpro.com/auth/login', { waitUntil: 'domcontentloaded' });

    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.locator('button[type="submit"]').click();

    // Wait for redirect to /dashboard after successful login
    await page.waitForURL('**/dashboard**', { timeout: 30000 });
    console.log(`[global-setup] Login succeeded — landed on: ${page.url()}`);

    await context.storageState({ path: authFile });
    console.log(`[global-setup] Session saved to ${authFile}`);
  } catch (err) {
    await browser.close();
    throw new Error(
      `[global-setup] Login failed. Check TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local.\n${err}`
    );
  }

  await browser.close();
}
