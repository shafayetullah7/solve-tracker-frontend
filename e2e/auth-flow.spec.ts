import { expect, test } from "@playwright/test";
import {
  assertNoSecretsInStorage,
  loginUser,
  registerUser,
  uniqueUser,
  waitForAccountEmail,
} from "./fixtures";

test.describe("auth flow", () => {
  test("register, login, account, logout, and gate", async ({ page }) => {
    const user = uniqueUser();
    await registerUser(page, user);
    await expect(page.getByText(/Account created/i)).toBeVisible();
    await loginUser(page, user);
    await waitForAccountEmail(page, user.email);
    await assertNoSecretsInStorage(page);

    await page.reload();
    await waitForAccountEmail(page, user.email);

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/account");
    await expect(page).toHaveURL(/\/login\?next=/);
  });

  test("wrong password shows credential error", async ({ page }) => {
    const user = uniqueUser();
    await registerUser(page, user);
    await page.goto("/login");
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password", { exact: true }).fill("wrong-password-here");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText(/Invalid email or password/i)).toBeVisible();
  });
});