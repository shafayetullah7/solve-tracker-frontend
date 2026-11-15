import { randomUUID } from "node:crypto";
import { expect, type Page } from "@playwright/test";

export function uniqueUser() {
  const id = randomUUID().slice(0, 8);
  return {
    name: `E2E User ${id}`,
    email: `phase47-${id}@example.test`,
    password: "long-phase47-passphrase",
  };
}

export async function registerUser(page: Page, user: ReturnType<typeof uniqueUser>) {
  await page.goto("/register");
  await page.getByLabel("Name").fill(user.name);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill(user.password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/login\?registered=1/);
}

export async function loginUser(page: Page, user: ReturnType<typeof uniqueUser>) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill(user.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/account/);
}

export async function assertNoSecretsInStorage(page: Page) {
  const storage = await page.evaluate(() => {
    const collect = (store: Storage) => {
      const out: string[] = [];
      for (let i = 0; i < store.length; i++) {
        const key = store.key(i);
        if (key) out.push(`${key}=${store.getItem(key) ?? ""}`);
      }
      return out.join("\n");
    };
    return {
      cookie: document.cookie,
      local: collect(localStorage),
      session: collect(sessionStorage),
    };
  });
  const blob = `${storage.cookie}\n${storage.local}\n${storage.session}`.toLowerCase();
  expect(blob).not.toMatch(/eyJ[a-zA-Z0-9_-]+\.eyJ/);
  expect(blob).not.toContain("practice_access=");
  expect(blob).not.toContain("practice_refresh=");
}

export async function waitForAccountEmail(page: Page, email: string) {
  await expect
    .poll(
      async () => (await page.getByText(email).count()) > 0,
      { timeout: 15_000 },
    )
    .toBe(true);
}