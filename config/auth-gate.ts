import type { StartMiddleware } from "@solidjs/vite-plugin";
import { loginPathWithReturn, safeReturnPath } from "../src/lib/auth/forms.ts";
import type { ServerAuthBootstrap } from "../src/lib/auth/server-session.ts";
import { probeServerAuthSession } from "../src/lib/auth/server-session-probe.ts";

const APP_HOME = "/app";
const PROFILE_PATH = "/app/profile";
const LOGIN_PATH = "/login";
const GUEST_ONLY_PATHS = new Set(["/login", "/register"]);

function isDocumentRequest(request: Request, url: URL): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  const path = url.pathname;
  // OAuth start/callback and all JSON APIs proxy via /api — never SSR the app shell.
  if (/^\/api(?:\/|$)/.test(path)) return false;
  if (path.startsWith("/@") || path.startsWith("/__")) return false;
  const lastSegment = path.slice(path.lastIndexOf("/") + 1);
  if (lastSegment.includes(".")) return false;
  const accept = request.headers.get("accept");
  return !accept || accept.includes("text/html") || accept.includes("*/*");
}

function isProtectedPath(path: string): boolean {
  return (
    path === "/app" ||
    path.startsWith("/app/") ||
    path === "/account" ||
    path.startsWith("/account/")
  );
}

function isAccountAlias(path: string): boolean {
  return path === "/account" || path.startsWith("/account/");
}

/** 302 target for this document request, or undefined to render it. */
export function authRedirectTarget(
  url: URL,
  bootstrap: ServerAuthBootstrap,
): string | undefined {
  const path = url.pathname;
  if (bootstrap.kind === "authenticated") {
    if (GUEST_ONLY_PATHS.has(path)) {
      return safeReturnPath(url.searchParams.get("next")) ?? APP_HOME;
    }
    if (isAccountAlias(path)) return PROFILE_PATH;
    return undefined;
  }
  if (bootstrap.kind === "anonymous" && isProtectedPath(path)) {
    const returnTo = isAccountAlias(path) ? PROFILE_PATH : path + url.search;
    return loginPathWithReturn(returnTo, LOGIN_PATH);
  }
  return undefined;
}

function redirectResponse(location: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      "Cache-Control": "private, no-store",
      Vary: "Cookie",
    },
  });
}

/** Read-only session probe for HTTP redirects; rendering remains session-neutral. */
export const authGate: StartMiddleware = async (event, next) => {
  const url = new URL(event.request.url);
  if (!isDocumentRequest(event.request, url)) return next();
  // Only routes with a server-side auth redirect need a session snapshot.
  // Share-only and recovery pages bootstrap in the browser instead.
  if (!isProtectedPath(url.pathname) && !GUEST_ONLY_PATHS.has(url.pathname)) {
    return next();
  }

  const cookie = event.request.headers.get("cookie");
  const bootstrap: ServerAuthBootstrap = cookie
    ? await probeServerAuthSession(cookie, {
        signal: AbortSignal.any([event.request.signal, AbortSignal.timeout(3000)]),
      })
    : { kind: "anonymous" };

  const location = authRedirectTarget(url, bootstrap);
  if (location) return redirectResponse(location);

  return next();
};
