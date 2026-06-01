import { defineConfig, devices } from "@playwright/test";

// Plan 02 mandate: "Playwright + axe-core for the chrome around the
// scene; manual perf testing for the scene itself." Scene-route smoke
// (the /alice WebXR-ish surface) needs a real browser session and
// device-class context that headless Playwright can't simulate
// faithfully — so e2e here is for non-scene UX, not the A-Frame
// content itself.

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Mobile emulation via Chromium (Pixel 7 device profile). Plan 05's
    // gate is iPhone SE 1st gen — true iOS / WebKit testing happens on
    // BrowserStack or real-device pre-launch QA. WebKit doesn't install
    // on macOS 13, so we don't gate the dev workflow on it.
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
