import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const runId =
    process.env.REPORT_NAME ||
    new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .replace("T", "_")
        .replace("Z", "");

export default defineConfig({
  testDir: './src/tests',
  fullyParallel: false,
  workers: 1,
  retries: 1,
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  reporter: [
    ['list'],
    [
      'html',
      {
        open: 'never',
        outputFolder: `playwright-report/${runId}`,
        title: 'NewPage - AI Assistant',
      },
    ],
  ],

  use: {
    baseURL: process.env.BASE_URL,
    headless: process.env.CI ? true : process.env.HEADED !== 'true',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',

    extraHTTPHeaders: {
      Accept: 'application/json',
    },

    viewport: {
      width: 1920,
      height: 1080,
    },
  },

  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
      },
    },
  ],
});