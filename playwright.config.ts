import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

// Locally this environment ships a preinstalled full Chromium; use it directly to
// avoid a browser-revision mismatch. In CI, Playwright installs its own browsers.
const localChromium = '/opt/pw-browsers/chromium';
const chromiumExecutable =
  !process.env.CI && existsSync(localChromium) ? localChromium : undefined;

// Only run the browsers that are actually installed. In CI all three are
// installed via `playwright install`; locally only Chromium is preinstalled.
// Set E2E_BROWSERS="chromium,firefox,webkit" to control which projects run.
const requested = (process.env.E2E_BROWSERS ?? 'chromium,firefox,webkit')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const allProjects = [
  {
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
      launchOptions: chromiumExecutable ? { executablePath: chromiumExecutable } : {},
    },
  },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
];

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}/inv/`,
    trace: 'on-first-retry',
  },
  projects: allProjects.filter((p) => requested.includes(p.name)),
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/inv/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
