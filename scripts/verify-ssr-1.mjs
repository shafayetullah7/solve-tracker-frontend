#!/usr/bin/env node
/**
 * SSR-1 smoke checks — expects `pnpm start` (or dev) on BASE_URL with API_PROXY_TARGET set.
 */
const base = process.env.BASE_URL ?? "http://127.0.0.1:3001";

async function check(name, fn) {
  try {
    await fn();
    console.log(`ok ${name}`);
  } catch (error) {
    console.error(`fail ${name}:`, error);
    process.exitCode = 1;
  }
}

await check("anonymous GET /login server-renders the sign-in form", async () => {
  const res = await fetch(`${base}/login`, { redirect: "manual" });
  if (res.status !== 200) {
    throw new Error(`expected 200, got ${res.status}`);
  }
  const html = await res.text();
  if (!html.includes("Sign in") || !html.includes('id="login-email"')) {
    throw new Error("expected sign-in form markup in HTML");
  }
});

await check("GET /missing returns 404", async () => {
  const res = await fetch(`${base}/does-not-exist-route`);
  if (res.status !== 404) {
    throw new Error(`expected 404, got ${res.status}`);
  }
});

await check("HTML Cache-Control on /", async () => {
  const res = await fetch(`${base}/`);
  const cc = res.headers.get("cache-control") ?? "";
  if (!cc.includes("no-store")) {
    throw new Error(`expected no-store, got ${cc}`);
  }
});

if (process.exitCode) {
  process.exit(process.exitCode);
}
