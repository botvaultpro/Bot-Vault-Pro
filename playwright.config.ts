import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './',
  timeout: 60000,
  use: {
    baseURL: 'https://botvaultpro.com',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'off',
  },
  reporter: [
    ['list'],
    ['json', { outputFile: 'bvp-tests/test-results.json' }],
    ['html', { outputFolder: 'bvp-tests/html-report', open: 'never' }],
  ],
});
