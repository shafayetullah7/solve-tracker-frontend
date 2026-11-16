import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { loginUser, registerUser, uniqueUser, waitForAccountEmail } from "./fixtures";

const backendRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../backend",
);

function issueResetToken(email: string): string {
  return execFileSync(
    "node",
    ["scripts/phase-4.7-issue-reset-token.mjs", email],
    {
      cwd: backendRoot,
      env: {
        ...process.env,
        PHASE_47_ISSUE_RESET: "1",
        PHASE_47_ALLOW_DEV_DB: process.env.PHASE_47_ALLOW_DEV_DB ?? "1",
      },
      encoding: "utf8",
    },
  ).trim();
}

test.describe("reset password", () => {
  test("reset clears session and strips hash", async ({ page, context }) => {
    const user = uniqueUser();
    const newPassword = "another-long-passphrase!";
    await registerUser(page, user);
    await loginUser(page, user);
    await waitForAccountEmail(page, user.email);

    const token = issueResetToken(user.email);
    const pageB = await context.newPage();
    await pageB.goto("/account");
    await waitForAccountEmail(pageB, user.email);

    await page.goto(`/reset-password#token=${encodeURIComponent(token)}`);
    await expect(page).toHaveURL(/\/reset-password(?!#)/);
    await page.getByLabel("New password").fill(newPassword);
    await page.getByLabel("Confirm password").fill(newPassword);
    await page.getByRole("button", { name: "Update password" }).click();
    await expect(page).toHaveURL(/\/login/);

    await expect
      .poll(async () => pageB.url(), { timeout: 15_000 })
      .toMatch(/\/login/);

    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password", { exact: true }).fill(newPassword);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/app(?:\/|$)/, { timeout: 15_000 });
  });
});