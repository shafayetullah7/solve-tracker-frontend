import { expect, test } from "@playwright/test";
import { loginUser, uniqueUser } from "./fixtures";

const DEMO = {
  email: "demo-viewer@discover.test",
  password: "demo-password-1",
};

test.describe("discover people J4", () => {
  test.skip(!process.env.E2E_DISCOVER_SEED, "requires seeded backend (E2E_DISCOVER_SEED=1)");

  test("search opens profile", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(DEMO.email);
    await page.getByLabel("Password", { exact: true }).fill(DEMO.password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/app/);

    await page.goto("/app/discover");
    await page.getByLabel(/Search/i).fill("demo-summary");
    await page.getByRole("option").first().click();
    await expect(page).toHaveURL(/\/app\/u\/demo-summary/);

    const follow = page.getByRole("button", { name: "Follow" });
    if (await follow.isVisible()) {
      await follow.click();
      await expect(page.getByRole("button", { name: "Following" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    }
  });
});