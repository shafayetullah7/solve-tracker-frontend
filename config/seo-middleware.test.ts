import { afterEach, describe, expect, test, vi } from "vitest";
import { seoDocuments } from "./seo-middleware";
import { validatePublicOrigin } from "../src/lib/site/validate-public-origin";

afterEach(() => vi.unstubAllEnvs());

describe("public origin", () => {
  test("accepts HTTPS and local HTTP only", () => {
    expect(validatePublicOrigin("https://practice.example/")).toBe("https://practice.example");
    expect(validatePublicOrigin("http://localhost:3001")).toBe("http://localhost:3001");
    for (const value of ["http://practice.example", "https://practice.example/path", "https://user@practice.example", "https://practice.example/?x=1", "invalid"]) {
      expect(validatePublicOrigin(value)).toBeUndefined();
    }
  });
});

describe("seoDocuments", () => {
  const request = (path: string, method = "GET") => seoDocuments(
    { request: new Request("http://untrusted.example" + path, { method }) } as Parameters<typeof seoDocuments>[0],
    async () => new Response("fallback", { status: 404 }),
  );
  test("uses configured origin and only indexable URLs", async () => {
    vi.stubEnv("VITE_PUBLIC_SITE_URL", "https://practice.example");
    const response = await request("/sitemap.xml");
    expect(response.headers.get("content-type")).toContain("application/xml");
    const body = await response.text();
    expect(body).toContain("<loc>https://practice.example/</loc>");
    expect(body).not.toMatch(/untrusted|\/login|\/register|\/app\//);
    const robots = await (await request("/robots.txt")).text();
    expect(robots).toContain("Sitemap: https://practice.example/sitemap.xml");
    expect(robots).not.toContain("Disallow: /app");
  });
  test("supports HEAD and rejects writes", async () => {
    vi.stubEnv("VITE_PUBLIC_SITE_URL", "https://practice.example");
    expect(await (await request("/sitemap.xml", "HEAD")).text()).toBe("");
    expect((await request("/robots.txt", "POST")).status).toBe(405);
    expect((await request("/")).status).toBe(404);
  });
});
