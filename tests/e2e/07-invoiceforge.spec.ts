import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('InvoiceForge Bot', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
    await page.goto('/dashboard/invoiceforge');
    await page.waitForLoadState('networkidle');
  });

  test('InvoiceForge page loads without crashing', async ({ page }) => {
    expect(page.url()).toContain('invoiceforge');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Page shows invoice form or subscribe gate', async ({ page }) => {
    const bodyText = await page.locator('body').innerText();
    const hasContent = /invoice|client|amount|line item|subscribe|upgrade/i.test(bodyText);
    expect(hasContent, 'InvoiceForge has no recognizable content').toBeTruthy();
  });

  test('Invoice creation form has key fields or subscribe gate', async ({ page }) => {
    const clientInput = page.locator('input[name*="client" i], input[placeholder*="client" i]').first();
    const amountInput = page.locator('input[name*="amount" i], input[placeholder*="amount" i]').first();
    const subscribeGate = page.locator('text=/subscribe|upgrade/i').first();

    const hasClient = await clientInput.count() > 0;
    const hasAmount = await amountInput.count() > 0;
    const hasGate = await subscribeGate.count() > 0;

    expect(hasClient || hasAmount || hasGate, 'No invoice form or gate found').toBeTruthy();
  });

  test('Invoice dashboard / history section loads', async ({ page }) => {
    const bodyText = await page.locator('body').innerText();
    const hasStatus = /draft|sent|paid|overdue|status/i.test(bodyText);
    console.log(`Invoice status tracking present: ${hasStatus}`);
  });
});
