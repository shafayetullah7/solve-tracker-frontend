#!/usr/bin/env node
/**
 * Step 4.7 — API-level auth races and error paths through the Vite proxy.
 * Requires backend :3000 and frontend dev/preview :3001.
 */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

const BASE = (process.env.PHASE_47_BASE_URL ?? "http://localhost:3001").replace(
  /\/$/,
  "",
);
const API = `${BASE}/api`;
const ORIGIN = process.env.PHASE_47_ORIGIN ?? "http://localhost:3001";
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

function stripAccessCookie(jar) {
  return jar
    .split(";")
    .map((p) => p.trim())
    .filter((p) => p && !p.startsWith(`${ACCESS}=`))
    .join("; ");
}

function mergeCookies(...parts) {
  const map = new Map();
  for (const part of parts) {
    for (const pair of part.split(";").map((p) => p.trim()).filter(Boolean)) {
      const eq = pair.indexOf("=");
      if (eq > 0) map.set(pair.slice(0, eq), pair);
    }
  }
  return [...map.values()].join("; ");
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
  console.log(`Phase 4.7 API verification → ${API}`);

  const email = `phase47-${randomUUID()}@example.test`;
  const password = "long-phase47-passphrase";
  const name = "Phase 4.7 API";

  const reg = await request("POST", "/auth/register", {
    body: { name, email, password },
    headers: writeHeaders,
  });
  if (reg.response.status !== 201) fail(`register ${reg.response.status}`);
  assertNoJwtInJson(reg.text, "register");
  if (cookieNames(reg.setCookie).some((n) => n === ACCESS || n === REFRESH))
    fail("register must not set session cookies");
  ok("register → 201 without session cookies");

  const login = await request("POST", "/auth/login", {
    body: { email, password },
    headers: writeHeaders,
  });
  if (login.response.status !== 200) fail(`login ${login.response.status}`);
  assertNoJwtInJson(login.text, "login");
  let jar = cookieHeader(login.setCookie);
  ok("login → cookies + user metadata");

  const parallel = await Promise.all(
    Array.from({ length: 10 }, () => request("GET", "/auth/session", { cookie: jar })),
  );
  if (!parallel.every((r) => r.response.status === 200))
    fail("parallel session probes with valid jar");
  ok("10 parallel GET /auth/session → 200");

  const jarNoAccess = stripAccessCookie(jar);
  const expiredProbes = await Promise.all(
    Array.from({ length: 5 }, () =>
      request("GET", "/auth/session", { cookie: jarNoAccess }),
    ),
  );
  if (
    !expiredProbes.every(
      (r) =>
        r.response.status === 401 &&
        r.json?.code === "AUTH_REFRESH_REQUIRED",
    )
  )
    fail("session without access cookie → AUTH_REFRESH_REQUIRED");
  ok("parallel probes without access → refresh required");

  const refresh = await request("POST", "/auth/refresh", {
    cookie: jarNoAccess,
    headers: writeHeaders,
  });
  if (refresh.response.status !== 200) fail(`refresh ${refresh.response.status}`);
  jar = mergeCookies(jarNoAccess, cookieHeader(refresh.setCookie));
  const afterRefresh = await request("GET", "/auth/session", { cookie: jar });
  if (afterRefresh.response.status !== 200) fail("session after refresh");
  ok("single refresh after access loss → session restored");

  const dualRefresh = await Promise.all([
    request("POST", "/auth/refresh", { cookie: jar, headers: writeHeaders }),
    request("POST", "/auth/refresh", { cookie: jar, headers: writeHeaders }),
  ]);
  const successes = dualRefresh.filter((r) => r.response.status === 200);
  if (successes.length < 1) fail("dual refresh: at least one success expected");
  jar = mergeCookies(jar, cookieHeader(successes[0].setCookie));
  ok("dual parallel refresh: at least one success (shared cookie simulation)");

  const wrong = await request("POST", "/auth/login", {
    body: { email, password: "wrong-password-here" },
    headers: writeHeaders,
  });
  if (wrong.response.status !== 401) fail(`wrong password expected 401`);
  ok("wrong credentials → 401");

  const badOrigin = await request("POST", "/auth/login", {
    body: { email, password },
    headers: {
      Origin: "http://127.0.0.1:3001",
      "X-Requested-With": "practice",
    },
  });
  if (badOrigin.response.status !== 403) fail(`bad origin expected 403`);
  ok("mismatched Origin → 403");

  const logout = await request("POST", "/auth/logout", {
    cookie: jar,
    headers: writeHeaders,
  });
  if (logout.response.status !== 204) fail(`logout ${logout.response.status}`);
  const afterLogout = await request("GET", "/auth/session", { cookie: jar });
  if (afterLogout.response.status !== 401) fail("session after logout");
  ok("logout → session rejected");

  if (process.exitCode) process.exit(process.exitCode);
  console.log("Phase 4.7 API verification passed.");
}

main().catch((error) => {
  if (!process.exitCode) process.exitCode = 1;
  console.error(error.message ?? error);
  process.exit(process.exitCode);
});