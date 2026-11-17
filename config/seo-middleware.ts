import type { StartMiddleware } from "@solidjs/vite-plugin";

const PUBLIC_PATHS = ["/", "/login", "/register"] as const;

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function buildSitemap(origin: string): string {
  const urls = PUBLIC_PATHS.map((path) => {
    const loc = escapeXml(`${origin}${path}`);
    const priority = path === "/" ? "1.0" : "0.6";
    return `  <url><loc>${loc}</loc><changefreq>weekly</changefreq><priority>${priority}</priority></url>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/** Absolute sitemap using the request host (or `PUBLIC_SITE_URL`). */
export const seoDocuments: StartMiddleware = async (event, next) => {
  const url = new URL(event.request.url);
  if (url.pathname !== "/sitemap.xml") return next();

  const envOrigin = process.env.PUBLIC_SITE_URL?.trim();
  let origin = url.origin;
  if (envOrigin) {
    try {
      origin = new URL(envOrigin).origin;
    } catch {
      /* Keep request origin. */
    }
  }

  return new Response(buildSitemap(origin), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};