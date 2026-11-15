#!/usr/bin/env node
/**
 * Step 4.1 — verify dev origin + Vite /api proxy + auth cookie boundary.
 * Requires backend on :3000 and `pnpm dev` on :3001 with API_PROXY_TARGET set.
 * Does not log cookie values.
 */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const BASE = (process.env.PHASE_41_BASE_URL ?? "http://localhost:3001").replace(
  /\/$/,
  "",
);
const API = `${BASE}/api`;
const ORIGIN = process.env.PHASE_41_ORIGIN ?? "http://localhost:3001";
const ACCESS = process.env.AUTH_ACCESS_COOKIE_NAME ?? "practice_access";
const REFRESH = process.env.AUTH_REFRESH_COOKIE_NAME ?? "practice_refresh";

const writeHeaders = {
  Origin: ORIGIN,
  "X-Requested-With": "practice",
  "Content-Type": "application/json",
};

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
  throw new Error(message);
}

function ok(label) {
  console.log(`OK: ${label}`);
}

function cookieNames(setCookie) {
  return setCookie.map((line) => line.split(";")[0].trim().split("=")[0]);
}

function cookieHeader(setCookie) {
  return setCookie.map((line) => line.split(";")[0].trim()).join("; ");
}

function assertNoJwtInJson(bodyText, context) {
  const lower = bodyText.toLowerCase();
  if (lower.includes('"access"') || lower.includes('"refresh"'))
    fail(`${context}: JSON must not expose token fields`);
  if (/eyJ[a-zA-Z0-9_-]+\.eyJ/.test(bodyText))
    fail(`${context}: JSON must not contain JWT strings`);
}

async function request(method, urlPath, { body, cookie, headers = {} } = {}) {
  const url = `${API}${urlPath}`;
  const init = {
    method,
    headers: { ...headers },
    redirect: "error",
  };
  if (body !== undefined) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  if (cookie) init.headers.Cookie = cookie;
  const response = await fetch(url, init);
  const setCookie =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : [];
  let text = "";
  if (response.status !== 204) {
    try {
      text = await response.text();
    } catch {
      text = "";
    }
  }
  let json;
  try {
    json = text ? JSON.parse(text) : undefined;
  } catch {
    json = undefined;
  }
  return { response, setCookie, text, json };
}

async function main() {
  console.log(`Phase 4.1 proxy verification → ${API} (Origin ${ORIGIN})`);

  const anonymous = await request("GET", "/auth/session");
  if (anonymous.response.status !== 401)
    fail(`anonymous session expected 401, got ${anonymous.response.status}`);
  if (anonymous.json?.code !== "AUTH_REFRESH_REQUIRED")
    fail(
      `anonymous session expected AUTH_REFRESH_REQUIRED, got ${anonymous.json?.code}`,
    );
  ok("GET /auth/session without cookies → 401 AUTH_REFRESH_REQUIRED");

  const email = `phase41-${randomUUID()}@example.test`;
  const password = "long-test-password-12";
  const name = "Phase 4.1";

  const reg = await request("POST", "/auth/register", {
    body: { name, email, password },
    headers: writeHeaders,
  });
  if (reg.response.status !== 201)
    fail(`register expected 201, got ${reg.response.status}: ${reg.text}`);
  assertNoJwtInJson(reg.text, "register");
  const regNames = cookieNames(reg.setCookie);
  if (regNames.includes(ACCESS) || regNames.includes(REFRESH))
    fail("register must not set session cookies");
  ok("POST /auth/register → 201 without session cookies");

  const badOrigin = await request("POST", "/auth/login", {
    body: { email, password },
    headers: {
      Origin: "http://127.0.0.1:3001",
      "X-Requested-With": "practice",
    },
  });
  if (badOrigin.response.status !== 403)
    fail(`wrong Origin login expected 403, got ${badOrigin.response.status}`);
  ok("POST /auth/login with mismatched Origin → 403");

  const noHeader = await request("POST", "/auth/login", {
    body: { email, password },
    headers: { Origin: ORIGIN },
  });
  if (noHeader.response.status !== 403)
    fail(`missing X-Requested-With expected 403, got ${noHeader.response.status}`);
  ok("POST /auth/login without X-Requested-With → 403");

  const login = await request("POST", "/auth/login", {
    body: { email, password },
    headers: writeHeaders,
  });
  if (login.response.status !== 200)
    fail(`login expected 200, got ${login.response.status}: ${login.text}`);
  assertNoJwtInJson(login.text, "login");
  if (!login.json?.user?.id) fail("login response must include user metadata");
  const names = cookieNames(login.setCookie);
  if (!names.includes(ACCESS) || !names.includes(REFRESH))
    fail(`login must set ${ACCESS} and ${REFRESH}`);
  if (
    !login.setCookie.every(
      (c) => c.includes("HttpOnly") && c.includes("SameSite=Lax"),
    )
  )
    fail("login cookies must be HttpOnly with SameSite=Lax");
  ok("POST /auth/login → 200, two HttpOnly cookies, user JSON only");

  const jar = cookieHeader(login.setCookie);

  const session = await request("GET", "/auth/session", { cookie: jar });
  if (session.response.status !== 200)
    fail(`session expected 200, got ${session.response.status}`);
  if (session.setCookie.length)
    fail("GET /auth/session must not emit Set-Cookie");
  const cache = session.response.headers.get("cache-control");
  if (cache !== "private, no-store")
    fail(`session cache-control expected private, no-store, got ${cache}`);
  ok("GET /auth/session → 200 read-only (no Set-Cookie, private no-store)");

  const refresh = await request("POST", "/auth/refresh", { headers: writeHeaders });
  if (refresh.response.status !== 401)
    fail(`refresh without cookie expected 401, got ${refresh.response.status}`);
  if (refresh.json?.code !== "AUTH_REFRESH_INVALID")
    fail(
      `refresh without cookie expected AUTH_REFRESH_INVALID, got ${refresh.json?.code}`,
    );
  ok("POST /auth/refresh without cookie → 401 AUTH_REFRESH_INVALID");

  const logout = await request("POST", "/auth/logout", {
    cookie: jar,
    headers: writeHeaders,
  });
  if (logout.response.status !== 204)
    fail(`logout expected 204, got ${logout.response.status}`);
  ok("POST /auth/logout → 204");

  const after = await request("GET", "/auth/session", { cookie: jar });
  if (after.response.status !== 401)
    fail(`session after logout expected 401, got ${after.response.status}`);
  ok("GET /auth/session after logout → 401");

  const rootDir = path.dirname(fileURLToPath(import.meta.url));
  const frontendRoot = path.resolve(rootDir, "..");
  await new Promise((resolve, reject) => {
    const child = spawn(
      "pnpm",
      ["exec", "vitest", "run", "src/lib/api/modules/auth.api.test.ts"],
      { cwd: frontendRoot, stdio: "inherit", shell: false },
    );
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`auth.api tests exited ${code}`)),
    );
  });
  ok("createAuthApi unit tests (recoverAuth disabled, user-only decode)");

  if (process.exitCode) process.exit(process.exitCode);
  console.log("Phase 4.1 proxy verification passed.");
}

main().catch((error) => {
  if (!process.exitCode) process.exitCode = 1;
  console.error(error.message ?? error);
  process.exit(process.exitCode);
});