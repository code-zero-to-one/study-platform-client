import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'fs';

const authFile = 'e2e/fixtures/auth.json';
const baseURL = process.env.E2E_BASE_URL ?? 'https://test.zeroone.it.kr';
const isStaging = baseURL.includes('zeroone.it.kr');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 60000,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL,
    storageState: isStaging && existsSync(authFile) ? authFile : undefined,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
