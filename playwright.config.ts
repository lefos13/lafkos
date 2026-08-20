import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  /* A single worker keeps the first Vite dependency optimization deterministic
   * across desktop and mobile projects, while the browser matrix still runs. */
  workers: 1,
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'ASTRO_DEV_BACKGROUND=0 pnpm dev --host 127.0.0.1',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: true,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
});
