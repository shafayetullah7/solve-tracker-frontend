import type { StartMiddleware } from "@solidjs/vite-plugin";
import { validatePublicOrigin } from "../src/lib/site/validate-public-origin.ts";

const PUBLIC_PATHS = ["/"] as const;

function escapeXml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

function buildSitemap(origin: string): string {
  const urls = PUBLIC_PATHS.map((path) => `  <url><loc>${escapeXml(origin + path)}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export const seoDocuments: StartMiddleware = async (event, next) => {
  const url = new URL(event.request.url);
  if (url.pathname !== "/sitemap.xml" && url.pathname !== "/robots.txt") return next();
  if (event.request.method !== "GET" && event.request.method !== "HEAD") {
    return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
  }
  const origin = validatePublicOrigin(import.meta.env.VITE_PUBLIC_SITE_URL)
    ?? (import.meta.env.PROD ? undefined : url.origin);
  if (!origin) return new Response("Public origin not configured", { status: 503, headers: { "Cache-Control": "no-store" } });
  const sitemap = url.pathname === "/sitemap.xml";
  const body = sitemap ? buildSitemap(origin)
    : `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`;
  return new Response(event.request.method === "HEAD" ? null : body, {
    headers: {
      "Content-Type": sitemap ? "application/xml; charset=utf-8" : "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
