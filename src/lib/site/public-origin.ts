import { getRequestEvent, isServer } from "@solidjs/web";
import { validatePublicOrigin } from "./validate-public-origin";

/** One build-time public origin for both SSR and browser metadata. */
export function sitePublicOrigin(): string {
  const configured = validatePublicOrigin(import.meta.env.VITE_PUBLIC_SITE_URL);
  if (configured) return configured;
  if (import.meta.env.PROD) return "";
  if (isServer) {
    const request = getRequestEvent()?.request;
    return request ? new URL(request.url).origin : "";
  }
  return typeof window !== "undefined" ? window.location.origin : "";
}

export function absoluteSitePath(pathname: string): string | undefined {
  const origin = sitePublicOrigin();
  if (!origin) return undefined;
  return origin + (pathname.startsWith("/") ? pathname : "/" + pathname);
}
