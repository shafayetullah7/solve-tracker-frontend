#!/usr/bin/env node
/**
 * SSR-2 smoke checks — per-request auth probe, no secrets in HTML.
 * Expects `pnpm start` on BASE_URL with API_PROXY_TARGET set (backend optional for anonymous checks).
 */
const base = process.env.BASE_URL ?? "http://127.0.0.1:3001";

const BOOTSTRAP_ID = 'id="practice-auth-bootstrap"';
function assertNoSecretsInHtml(html) {
  const blob = html.toLowerCase();
  if (/eyj[a-z0-9_-]+\.eyj/.test(blob)) {
    throw new Error("JWT-like string in HTML");
  }
  if (blob.includes("practice_access=") || blob.includes("practice_refresh=")) {
    throw new Error("cookie name=value in HTML");
  }
  if (blob.includes("__host-access") || blob.includes("__host-refresh")) {
    throw new Error("production cookie name in HTML");
  }
}

async function check(name, fn) {
  try {
    await fn();
    console.log(`ok ${name}`);
  } catch (error) {
    console.error(`fail ${name}:`, error);
    process.exitCode = 1;
  }
}

await check("server reachable", async () => {
  try {
    const res = await fetch(`${base}/`);
    if (!res.ok && res.status >= 500) {
      throw new Error(`GET / returned ${res.status}`);
    }
  } catch (error) {
    throw new Error(
      `cannot reach ${base} (${error instanceof Error ? error.message : error}). ` +
        "Run `pnpm build && pnpm start` with API_PROXY_TARGET set; free port 3001 first.",
    );
  }
});

await check("login HTML is session-neutral", async () => {
  const res = await fetch(`${base}/login`, { redirect: "manual" });
  const html = await res.text();
  if (html.includes(BOOTSTRAP_ID)) throw new Error("unexpected auth bootstrap");
  assertNoSecretsInHtml(html);
});

await check("anonymous GET /app is a 302 to /login?next=%2Fapp", async () => {
  const res = await fetch(`${base}/app`, { redirect: "manual" });
  const location = res.headers.get("location") ?? "";
  if (res.status !== 302 || location !== "/login?next=%2Fapp") {
    throw new Error(`expected 302 → /login?next=%2Fapp, got ${res.status} → ${location}`);
  }
});

await check("anonymous GET /account is a 302 to login with profile next", async () => {
  const res = await fetch(`${base}/account`, { redirect: "manual" });
  const location = res.headers.get("location") ?? "";
  if (res.status !== 302 || !location.startsWith("/login?next=%2Fapp%2Fprofile")) {
    throw new Error(`expected 302 → /login?next=%2Fapp%2Fprofile, got ${res.status} → ${location}`);
  }
});

await check("anonymous GET / includes landing meta description", async () => {
  const res = await fetch(`${base}/`, { redirect: "manual" });
  const html = await res.text();
  if (!html.includes('name="description"')) {
    throw new Error('expected meta description on /');
  }
  if (!html.includes("Your practice library, across every platform.")) {
    throw new Error("expected landing hero in SSR HTML");
  }
  if (!html.includes("/og-image.jpg")) {
    throw new Error("expected og-image path in SSR HTML");
  }
  assertNoSecretsInHtml(html);
  if (html.includes(BOOTSTRAP_ID)) throw new Error("marketing must not contain an auth seed");
});

await check("non-indexable login sends noindex", async () => {
  const res = await fetch(`${base}/login`, { redirect: "manual" });
  if (res.headers.get("x-robots-tag") !== "noindex") throw new Error("expected noindex");
});

await check("HTML still private no-store with Vary Cookie", async () => {
  const res = await fetch(`${base}/login`, { redirect: "manual" });
  const cc = res.headers.get("cache-control") ?? "";
  const vary = res.headers.get("vary") ?? "";
  if (!cc.includes("no-store")) {
    throw new Error(`expected no-store, got ${cc}`);
  }
  if (!vary.toLowerCase().includes("cookie")) {
    throw new Error(`expected Vary: Cookie, got ${vary}`);
  }
});

if (process.exitCode) {
  process.exit(process.exitCode);
}