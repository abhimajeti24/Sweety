// End-to-end tests: build the client, start the production server on port 4100, and drive it in
// Chromium at desktop and phone sizes. The "demo" project records a captioned walkthrough video.
//   npm run test:e2e        desktop + phone
//   npm run demo:record     the walkthrough video (e2e/results/.../video.webm)
import { defineConfig, devices } from '@playwright/test';

const PORT = 4100;
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './tests',
  outputDir: './results',
  globalSetup: './global-setup.js',
  globalTeardown: './global-teardown.js',
  // The tests share one database and some change the demo data, so they run one at a time.
  fullyParallel: false,
  workers: 1,
  retries: isCI ? 1 : 0,
  reporter: isCI
    ? [['github'], ['html', { open: 'never', outputFolder: 'report' }]]
    : [['list'], ['html', { open: 'never', outputFolder: 'report' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    // The seed and the server default both use India time; the browser matches them.
    timezoneId: 'Asia/Kolkata',
    locale: 'en-IN',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      testIgnore: /demo\.spec/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'phone',
      testMatch: /(rules|a11y)\.spec/,
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'demo',
      testMatch: /demo\.spec/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        video: { mode: 'on', size: { width: 1280, height: 800 } },
        launchOptions: { slowMo: 120 },
      },
    },
  ],
  webServer: {
    command: 'npm run build && node server/src/index.js',
    cwd: '..',
    port: PORT,
    reuseExistingServer: !isCI,
    timeout: 180_000,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: String(PORT),
      CLIENT_ORIGIN: `http://localhost:${PORT}`,
      COOKIE_SECURE: 'false',
      LOG_LEVEL: 'warn',
      REDIS_URL: '',
    },
  },
});
