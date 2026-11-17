import { randomUUID } from "node:crypto";
import type { StartMiddleware } from "@solidjs/vite-plugin";
import { rewriteApiPath } from "./api-proxy-origin.ts";
import { apiProxyTargetForRuntime } from "./runtime-env.ts";
import {
  buildContentSecurityPolicy,
  nodeCspEnabled,
  scriptNonce,
} from "./node-csp.ts";
import { headersForApiProxy } from "./proxy-request-headers.ts";
import { authGate } from "./auth-gate.ts";

const API_PREFIX = /^\/api(?:\/|\?|$)/;

function apiOrigin(): string {
  return apiProxyTargetForRuntime();
}

/** Same-origin `/api` → Nest; used in dev, preview, and `node dist/server/node.js`. */
const proxyApi: StartMiddleware = async (event, next) => {
  const url = new URL(event.request.url);
  const pathWithSearch = url.pathname + url.search;
  if (!API_PREFIX.test(pathWithSearch)) {
    return next();
  }

  const backendPath = rewriteApiPath(pathWithSearch);
  const targetUrl = new URL(backendPath, apiOrigin());
  const headers = headersForApiProxy(event.request.headers);

  const init: RequestInit & { duplex?: "half" } = {
    method: event.request.method,
    headers,
    redirect: "manual",
  };
  if (event.request.method !== "GET" && event.request.method !== "HEAD") {
    init.body = event.request.body;
    init.duplex = "half";
  }

  const upstream = await fetch(targetUrl, init);
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: upstream.headers,
  });
};

/** Seed CSP nonce before SSR when Node owns CSP (see docs/DEPLOY.md). */
const assignCspNonce: StartMiddleware = async (event, next) => {
  if (nodeCspEnabled() && !API_PREFIX.test(new URL(event.request.url).pathname)) {
    event.nonce ??= randomUUID();
  }
  return next();
};

const cachePolicy: StartMiddleware = async (_event, next) => {
  const response = await next();
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    return response;
  }
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "private, no-store");
  headers.set("Vary", "Cookie");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

const securityHeaders: StartMiddleware = async (event, next) => {
  const response = await next();
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    return response;
  }
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  const nonceValue = scriptNonce(event.nonce ?? undefined);
  if (nodeCspEnabled() && nonceValue) {
    headers.set("Content-Security-Policy", buildContentSecurityPolicy(nonceValue));
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export default [
  proxyApi,
  authGate,
  assignCspNonce,
  cachePolicy,
  securityHeaders,
] satisfies StartMiddleware[];