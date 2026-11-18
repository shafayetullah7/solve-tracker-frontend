import type { StartMiddleware } from "@solidjs/vite-plugin";
import { loginPathWithReturn, safeReturnPath } from "../src/lib/auth/forms.ts";
import {
  bootstrapScriptTag,
  type ServerAuthBootstrap,
} from "../src/lib/auth/server-session.ts";
import { probeServerAuthSession } from "../src/lib/auth/server-session-probe.ts";

const APP_HOME = "/app";
const PROFILE_PATH = "/app/profile";
const LOGIN_PATH = "/login";
const GUEST_ONLY_PATHS = new Set(["/", "/login", "/register"]);
const HEAD_CLOSE = "</head>";
/** Give up on injection rather than buffer an unbounded document head. */
const MAX_HEAD_BUFFER = 256 * 1024;

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

/** Splice `markup` in front of the first `</head>` of a streamed HTML body. */
export function injectBeforeHeadClose(
  body: ReadableStream<Uint8Array>,
  markup: string,
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let pending = "";
  let injected = false;

  return body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        const text = decoder.decode(chunk, { stream: true });
        if (injected) {
          if (text) controller.enqueue(encoder.encode(text));
          return;
        }
        pending += text;
        const index = pending.indexOf(HEAD_CLOSE);
        if (index === -1) {
          if (pending.length > MAX_HEAD_BUFFER) {
            controller.enqueue(encoder.encode(pending));
            pending = "";
            injected = true;
          }
          return;
        }
        controller.enqueue(
          encoder.encode(pending.slice(0, index) + markup + pending.slice(index)),
        );
        pending = "";
        injected = true;
      },
      flush(controller) {
        const rest = pending + decoder.decode();
        if (rest) controller.enqueue(encoder.encode(rest));
      },
    }),
  );
}

/**
 * Single per-request session probe for document requests: stores the result
 * on `event.locals` (read by `AuthProvider` during SSR), answers auth
 * redirects with a real 302, and seeds the client with a JSON block placed
 * outside the hydrated tree.
 */
export const authGate: StartMiddleware = async (event, next) => {
  const url = new URL(event.request.url);
  if (!isDocumentRequest(event.request, url)) return next();

  const bootstrap = await probeServerAuthSession(
    event.request.headers.get("cookie"),
    { signal: event.request.signal },
  );

  const location = authRedirectTarget(url, bootstrap);
  if (location) return redirectResponse(location);

  event.locals ??= {};
  event.locals.practiceAuthBootstrap = bootstrap;
  const response = await next();
  const contentType = response.headers.get("content-type") ?? "";
  if (!response.body || !contentType.includes("text/html")) return response;

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(
    injectBeforeHeadClose(response.body, bootstrapScriptTag(bootstrap)),
    { status: response.status, statusText: response.statusText, headers },
  );
};
