import { expect, test } from "@playwright/test";

const DEMO = {
  email: "demo-viewer@discover.test",
  password: "demo-password-1",
};

async function loginDiscover(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEMO.email);
  await page.getByLabel("Password", { exact: true }).fill(DEMO.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/app/);
}

test.describe("discover compare J1", () => {
  test.skip(!process.env.E2E_DISCOVER_SEED, "requires seeded backend (E2E_DISCOVER_SEED=1)");

  test("benchmark → peers compare → profile compare → copy topic", async ({ page }) => {
    await loginDiscover(page);

    await page.goto("/app");
    const benchmark = page.getByRole("heading", { name: /How you compare/i });
    if (await benchmark.isVisible()) {
      await page.getByRole("link", { name: /Compare/i }).first().click();
      await expect(page).toHaveURL(/\/app\/discover\/compare/);
    } else {
      await page.goto("/app/discover/compare");
    }

    await page.goto("/app/u/demo-topics/compare");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/demo-topics/i);

    await page.goto("/app/u/demo-topics");
    await page.getByRole("link", { name: /topics/i }).first().click().catch(() => {});
    const topicLink = page.locator('a[href*="/topics/"]').first();
    await topicLink.click();
    await page.getByRole("button", { name: /Copy topic/i }).click();
    await expect(page.getByText(/into your topic|Added/i)).toBeVisible({ timeout: 15_000 });
  });

  test("compare route renders summary table", async ({ page }) => {
    await loginDiscover(page);
    await page.goto("/app/u/demo-topics/compare");
    await expect(page.getByRole("heading", { name: /Summary/i })).toBeVisible();
  });
});