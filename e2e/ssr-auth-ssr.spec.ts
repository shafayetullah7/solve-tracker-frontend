import { expect, test } from "@playwright/test";
import {
  assertNoSecretsInHtml,
  loginUser,
  registerUser,
  uniqueUser,
} from "./fixtures";

function cookieHeader(cookies: Awaited<ReturnType<import("@playwright/test").BrowserContext["cookies"]>>) {
  return cookies.map((c) => `${c.name}=${c.value}`).join("; ");
}

const HYDRATION_WARNING = /Hydration key miss|unclaimed server-rendered/i;

function collectHydrationWarnings(page: import("@playwright/test").Page) {
  const warnings: string[] = [];
  page.on("console", (message) => {
    if (HYDRATION_WARNING.test(message.text())) warnings.push(message.text());
  });
  return warnings;
}

test.describe("SSR hydration", () => {
  test("anonymous /login hydrates cleanly and the form is interactive", async ({
    page,
  }) => {
    const warnings = collectHydrationWarnings(page);
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign in" }).click();
    // Client validation only runs once hydrated; a dead SSR form would navigate to `/login?`.
    await expect(page.getByText("Invalid email")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
    expect(warnings).toEqual([]);
  });

  test("signed-in /app and /app/problems hydrate cleanly and load data", async ({
    page,
  }) => {
    const user = uniqueUser();
    await registerUser(page, user);
    await loginUser(page, user);

    const warnings = collectHydrationWarnings(page);
    await page.goto("/app");
    await expect(page.getByRole("heading", { name: "Your practice" })).toBeVisible();
    await expect(page.getByRole("status", { name: "Loading" })).toHaveCount(0, {
      timeout: 15_000,
    });

    await page.goto("/app/problems");
    await expect(page.getByText("Loading progress…")).toHaveCount(0, {
      timeout: 15_000,
    });
    expect(warnings).toEqual([]);
  });
});

test.describe("SSR auth gate", () => {
  test("anonymous /app is a 302 to login with next", async ({ request }) => {
    const response = await request.get("/app", { maxRedirects: 0 });
    expect(response.status()).toBe(302);
    expect(response.headers()["location"]).toBe("/login?next=%2Fapp");
  });

  test("signed-in /login is a 302 to /app", async ({ page, context }) => {
    const user = uniqueUser();
    await registerUser(page, user);
    await loginUser(page, user);
    const response = await page.request.get("/login", {
      headers: { Cookie: cookieHeader(await context.cookies()) },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(302);
    expect(response.headers()["location"]).toBe("/app");
  });
});

test.describe("SSR auth (track B)", () => {
  test("logged-in GET /app includes signed-in chrome and no secrets", async ({
    page,
    context,
  }) => {
    const user = uniqueUser();
    await registerUser(page, user);
    await loginUser(page, user);

    const header = cookieHeader(await context.cookies());
    const response = await page.request.get("/app", {
      headers: { Cookie: header },
    });
    expect(response.ok()).toBeTruthy();
    const html = await response.text();
    assertNoSecretsInHtml(html);
    expect(html).toContain('id="practice-auth-bootstrap"');
    expect(html).toMatch(/Library/);
    expect(html).not.toMatch(/>Sign in</);
  });

  test("two sessions render different profile HTML", async ({ browser }) => {
    const userA = uniqueUser();
    const userB = uniqueUser();

    const ctxA = await browser.newContext();
    const pageA = await ctxA.newPage();
    await registerUser(pageA, userA);
    await loginUser(pageA, userA);
    const headerA = cookieHeader(await ctxA.cookies());

    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    await registerUser(pageB, userB);
    await loginUser(pageB, userB);
    const headerB = cookieHeader(await ctxB.cookies());

    const htmlA = await (
      await pageA.request.get("/app/profile", { headers: { Cookie: headerA } })
    ).text();
    const htmlB = await (
      await pageB.request.get("/app/profile", { headers: { Cookie: headerB } })
    ).text();

    assertNoSecretsInHtml(htmlA);
    assertNoSecretsInHtml(htmlB);
    expect(htmlA).toContain(userA.email);
    expect(htmlA).not.toContain(userB.email);
    expect(htmlB).toContain(userB.email);
    expect(htmlB).not.toContain(userA.email);
    expect(htmlA).not.toBe(htmlB);

    await ctxA.close();
    await ctxB.close();
  });
});