import { afterEach, describe, expect, test, vi } from "vitest";
import middleware from "./start-middleware";

const [proxyApi, , , , cachePolicy, securityHeaders] = middleware;

describe("start-middleware proxyApi", () => {
  const prevTarget = process.env.API_PROXY_TARGET;

  afterEach(() => {
    vi.unstubAllGlobals();
    if (prevTarget === undefined) delete process.env.API_PROXY_TARGET;
    else process.env.API_PROXY_TARGET = prevTarget;
  });

  test("passes through non-API requests", async () => {
    const next = vi.fn().mockResolvedValue(new Response("page", { status: 200 }));
    const event = {
      request: new Request("http://localhost:3001/app"),
    };
    const response = await proxyApi(event as never, next);
    expect(next).toHaveBeenCalledOnce();
    expect(response).toBe(await next.mock.results[0]!.value);
  });

  test("proxies /api and strips prefix", async () => {
    process.env.API_PROXY_TARGET = "http://localhost:3000";
    const upstream = new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
    const fetch = vi.fn().mockResolvedValue(upstream);
    vi.stubGlobal("fetch", fetch);

    const event = {
      request: new Request("http://localhost:3001/api/auth/session", {
        method: "GET",
        headers: { cookie: "practice_access=x" },
      }),
    };
    const next = vi.fn();
    const response = await proxyApi(event as never, next);
    expect(next).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledOnce();
    expect(String(fetch.mock.calls[0]![0])).toBe(
      "http://localhost:3000/auth/session",
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});

describe("start-middleware cachePolicy", () => {
  test("adds no-store and Vary on HTML", async () => {
    const next = vi.fn().mockResolvedValue(
      new Response("<html></html>", {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" },
      }),
    );
    const response = await cachePolicy(
      { request: new Request("http://localhost:3001/") } as never,
      next,
    );
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(response.headers.get("Vary")).toBe("Cookie");
  });

  test("adds baseline security headers on HTML", async () => {
    const next = vi.fn().mockResolvedValue(
      new Response("<html></html>", {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" },
      }),
    );
    const response = await securityHeaders(
      { request: new Request("http://localhost:3001/"), nonce: "abc" } as never,
      next,
    );
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin",
    );
  });

  test("leaves non-HTML responses unchanged", async () => {
    const body = new Response("{}", {
      status: 200,
      headers: { "content-type": "application/json" },
    });
    const next = vi.fn().mockResolvedValue(body);
    const response = await cachePolicy(
      { request: new Request("http://localhost:3001/api/x") } as never,
      next,
    );
    expect(response.headers.get("Cache-Control")).toBeNull();
    expect(response).toBe(body);
  });
});