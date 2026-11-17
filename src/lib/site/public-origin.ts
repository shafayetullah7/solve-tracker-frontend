import { getRequestEvent, isServer } from "@solidjs/web";

/**
 * Public site origin for canonical and Open Graph URLs.
 * SSR uses the incoming request; the client uses `location` after hydrate.
 * Optional `PUBLIC_SITE_URL` overrides both when the edge host differs from the public URL.
 */
export function sitePublicOrigin(): string {
  const fromEnv = readPublicSiteUrlEnv();
  if (fromEnv) return fromEnv;
  if (isServer) {
    const url = getRequestEvent()?.request.url;
    if (url) return new URL(url).origin;
    return "";
  }
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

function readPublicSiteUrlEnv(): string | undefined {
  const raw =
    (typeof process !== "undefined" && process.env?.PUBLIC_SITE_URL) ||
    import.meta.env.VITE_PUBLIC_SITE_URL;
  if (typeof raw !== "string" || !raw.trim()) return undefined;
  try {
    return new URL(raw.trim()).origin;
  } catch {
    return undefined;
  }
}

export function absoluteSitePath(pathname: string): string | undefined {
  const origin = sitePublicOrigin();
  if (!origin) return undefined;
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${origin}${path}`;
}