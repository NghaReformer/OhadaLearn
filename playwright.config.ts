import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60000,
  // Run tests serially to avoid parallel connection issues on WSL/NTFS
  workers: 1,
  webServer: {
    command: 'npm run preview -- --port 4173',
    port: 4173,
    reuseExistingServer: true,
    // Build takes ~90s on first run; preview is instant once built.
    // Requires adapter-node (installed) and .env file for $env/static/private.
    timeout: 180000,
  },
  use: {
    baseURL: 'http://localhost:4173',
  },
});
