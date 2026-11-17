import { describe, expect, test } from "vitest";
import { seoDocuments } from "./seo-middleware";

describe("seoDocuments", () => {
  test("serves sitemap.xml with public marketing paths", async () => {
    const prevSite = process.env.PUBLIC_SITE_URL;
    delete process.env.PUBLIC_SITE_URL;
    const request = new Request("http://127.0.0.1:3001/sitemap.xml");
    const response = await seoDocuments(
      { request } as Parameters<typeof seoDocuments>[0],
      async () => new Response("not found", { status: 404 }),
    );
    expect(response.headers.get("content-type")).toContain("application/xml");
    const body = await response.text();
    const origin = new URL(request.url).origin;
    expect(body).toContain(`<loc>${origin}/</loc>`);
    expect(body).toContain(`<loc>${origin}/login</loc>`);
    expect(body).not.toContain("/app/");
    if (prevSite === undefined) delete process.env.PUBLIC_SITE_URL;
    else process.env.PUBLIC_SITE_URL = prevSite;
  });

  test("passes through non-sitemap requests", async () => {
    const request = new Request("http://127.0.0.1:3001/");
    const fallback = new Response("html", { status: 200 });
    const response = await seoDocuments(
      { request } as Parameters<typeof seoDocuments>[0],
      async () => fallback,
    );
    expect(response).toBe(fallback);
  });
});