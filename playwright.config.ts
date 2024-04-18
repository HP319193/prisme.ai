import { defineConfig, devices } from '@playwright/test';
import dotevn from 'dotenv';

dotevn.config();

const { TESTS_E2E_BASE_URL = '' } = process.env;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests-e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    baseURL: TESTS_E2E_BASE_URL,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'setup',
      testMatch: /tests-e2e\/.*\.setup\.ts/,
      use: {
        storageState: './tests-e2e/.auth/user.json',
      },
    },
    {
      name: 'Builder',
      use: {
        ...devices['Desktop Chrome'],
        storageState: './tests-e2e/.auth/user.json',
      },
      testMatch: /tests-e2e\/builder\/*/,
      dependencies: ['setup'],
    },
    {
      name: 'Public pages',
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: /tests-e2e\/public\/\/*/,
    },
  ],
});
