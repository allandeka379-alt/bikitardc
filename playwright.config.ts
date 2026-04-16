// ─────────────────────────────────────────────
// Playwright smoke-test config
//
// Spec §11.1 deliverable: "Playwright smoke tests
// for the two critical journeys". Covers Journey A
// (resident pays rates) and Journey D (staff
// processes a service request) end-to-end against
// a locally running dev server.
// ─────────────────────────────────────────────

import { defineConfig, devices } from '@playwright/test';

const PORT = 3000;

export default defineConfig({
  testDir: './tests/smoke',
  fullyParallel: false,
  retries: 1,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1440, height: 900 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    // Uses dev server so MSW / Zustand / fixtures
    // respond exactly as the demo is seen by the user.
    command: 'pnpm dev',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
