#!/usr/bin/env node
/**
 * Minimal SSR liveness — expects a running `pnpm start` (or equivalent) on BASE_URL.
 */
const base = process.env.BASE_URL ?? "http://127.0.0.1:3001";

let exitCode = 0;

try {
  const res = await fetch(`${base}/`);
  if (!res.ok) {
    throw new Error(`GET / returned ${res.status}`);
  }
  const type = res.headers.get("content-type") ?? "";
  if (!type.includes("text/html")) {
    throw new Error(`expected text/html, got ${type || "(none)"}`);
  }
  const html = await res.text();
  if (!html.trim()) {
    throw new Error("empty HTML body");
  }
  if (!/<html[\s>]/i.test(html)) {
    throw new Error("response does not look like HTML");
  }
  console.log("ok smoke-ssr GET / returns text/html");
} catch (error) {
  console.error("fail smoke-ssr:", error);
  console.error(
    "Hint: run `pnpm build && pnpm start` in another terminal (free port 3001 first).",
  );
  exitCode = 1;
}

process.exit(exitCode);