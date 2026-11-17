import { expect, test } from "@playwright/test";
import { assertNoSecretsInHtml } from "./fixtures";
import { LANDING_HERO, LANDING_SEO } from "../src/components/landing/landing-copy";

function metaContent(html: string, selector: string): string | null {
  const match = html.match(
    new RegExp(`<meta[^>]+${selector}[^>]+content="([^"]*)"`, "i"),
  );
  return match?.[1] ?? null;
}

test.describe("Landing SEO (SSR)", () => {
  test("anonymous GET / includes marketing copy and head tags", async ({ request }) => {
    const response = await request.get("/", { maxRedirects: 0 });
    expect(response.ok()).toBeTruthy();
    const html = await response.text();
    assertNoSecretsInHtml(html);
    expect(html).toContain(LANDING_HERO.title);
    expect(html).toContain('name="description"');
    expect(metaContent(html, 'name="description"')).toBe(LANDING_SEO.description);
    expect(html).toContain('property="og:image"');
    expect(html).toContain(LANDING_SEO.ogImagePath);
    expect(html).toContain("application/ld+json");
    expect(html).toContain("WebApplication");
  });

  test("home hydrates without mismatch warnings", async ({ page }) => {
    const warnings: string[] = [];
    page.on("console", (message) => {
      if (/Hydration key miss|unclaimed server-rendered/i.test(message.text())) {
        warnings.push(message.text());
      }
    });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(LANDING_HERO.title);
    expect(warnings).toEqual([]);
  });
});