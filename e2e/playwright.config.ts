import { defineConfig, devices } from "@playwright/test";

const baseURL =
  process.env.PHASE_47_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:3001";

export default defineConfig({
  testDir: ".",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});