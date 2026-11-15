import { expect, test } from "@playwright/test";
import { loginUser, registerUser, uniqueUser, waitForAccountEmail } from "./fixtures";

test.describe("cross-tab", () => {
  test("login and logout propagate across tabs", async ({ context }) => {
    const user = uniqueUser();
    const pageA = await context.newPage();
    const pageB = await context.newPage();

    await registerUser(pageA, user);
    await loginUser(pageA, user);

    await pageB.goto("/account");
    await waitForAccountEmail(pageB, user.email);

    await pageA.getByRole("button", { name: "Sign out" }).click();
    await expect(pageA).toHaveURL(/\/login/);

    await expect
      .poll(
        async () => pageB.url(),
        { timeout: 15_000 },
      )
      .toMatch(/\/login/);
  });
});