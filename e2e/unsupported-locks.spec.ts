import { test, expect } from "@playwright/test";
import { loginUser, registerUser, uniqueUser, waitForAccountEmail } from "./fixtures";

test.describe("unsupported Web Locks", () => {
  test.use({
    contextOptions: {},
  });

  test("login still works when navigator.locks is missing", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "locks", {
        value: undefined,
        configurable: true,
      });
    });
    const page = await context.newPage();
    const user = uniqueUser();
    await registerUser(page, user);
    await loginUser(page, user);
    await waitForAccountEmail(page, user.email);
    await expect(page.getByText(user.name)).toBeVisible();
    await context.close();
  });
});