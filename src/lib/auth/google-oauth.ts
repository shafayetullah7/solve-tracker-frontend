import { safeReturnPath } from "./forms";

export function isGoogleOAuthEnabled(): boolean {
  return import.meta.env.VITE_GOOGLE_OAUTH_ENABLED === "true";
}

/** Same-origin full navigation to Nest OAuth start (proxied GET; not the JSON API client). */
export function googleOAuthStartHref(next?: string): string {
  const safe = safeReturnPath(next);
  const query = safe ? `?${new URLSearchParams({ next: safe }).toString()}` : "";
  return `/api/auth/google${query}`;
}

export function googleOAuthLinkHref(next = "/app/profile"): string {
  const safe = safeReturnPath(next) ?? "/app/profile";
  const params = new URLSearchParams({ mode: "link", next: safe });
  return `/api/auth/google?${params.toString()}`;
}