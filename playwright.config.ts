import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 1,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'web',
      testDir: './tests/web',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://front.serverest.dev',
        // Se o download dos navegadores do Playwright falhar (comum em redes
        // corporativas), descomente a linha abaixo para usar o Chrome já
        // instalado na máquina em vez do Chromium do Playwright.
        // channel: 'chrome',
      },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: 'https://serverest.dev',
      },
    },
  ],
});
