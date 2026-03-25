import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/integration',
  timeout: 30_000,
  use: {
    headless: true,
    baseURL: 'http://127.0.0.1:3000'
  },
  webServer: {
    command: 'npm run serve -- --listen 3000',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true
  }
});
