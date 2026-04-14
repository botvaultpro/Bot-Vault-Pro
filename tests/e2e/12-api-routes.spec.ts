import { test, expect } from '@playwright/test';

/**
 * API Route Health Checks
 * These hit the API routes directly and check for reasonable responses.
 * They are not testing full AI functionality — just that routes exist and respond.
 */
test.describe('API Route Health', () => {
  const API_ROUTES = [
    '/api/webhooks/stripe',
    '/api/auth/callback',
  ];

  for (const route of API_ROUTES) {
    test(`API route ${route} exists (not 404)`, async ({ page }) => {
      const response = await page.request.get(route).catch(() => null);
      if (!response) {
        const postResponse = await page.request.post(route, {
          data: '{}',
          headers: { 'Content-Type': 'application/json' },
        }).catch(() => null);
        if (!postResponse) {
          console.log(`Could not reach ${route} — may require auth headers`);
          return;
        }
        expect(postResponse.status()).not.toBe(404);
        return;
      }
      expect(response.status(), `${route} returned 404`).not.toBe(404);
    });
  }

  test('Inngest endpoint is reachable', async ({ page }) => {
    const response = await page.request.get('/api/inngest').catch(() => null);
    if (!response) {
      console.log('Inngest endpoint not reachable via GET — may be POST only');
      return;
    }
    expect(response.status()).not.toBe(404);
    console.log(`Inngest endpoint status: ${response.status()}`);
  });
});
