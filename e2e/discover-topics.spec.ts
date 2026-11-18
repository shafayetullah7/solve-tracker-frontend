import { test, expect } from "@playwright/test";

const DEMO = {
  email: "demo-viewer@discover.test",
  password: "demo-password-1",
};

test.describe("Discover topics", () => {
  test.skip(!process.env.E2E_DISCOVER_SEED, "requires seeded backend (E2E_DISCOVER_SEED=1)");

  test("J2: topics directory and hub", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(DEMO.email);
    await page.getByLabel("Password", { exact: true }).fill(DEMO.password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/app/);

    await page.goto("/app/discover/topics");
    await expect(page.getByRole("heading", { name: "Your topics" })).toBeVisible();
    await page.getByRole("link", { name: /dynamic programming/i }).first().click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("J3: library ideas panel", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(DEMO.email);
    await page.getByLabel("Password", { exact: true }).fill(DEMO.password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.goto("/app/problems");
    await page.locator("select").first().selectOption({ index: 1 });
    await expect(page.getByText(/ideas from others/i)).toBeVisible({ timeout: 15_000 });
  });
});