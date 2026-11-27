import { afterEach, describe, expect, test, vi } from "vitest";

const probe = vi.hoisted(() => vi.fn());

vi.mock("../src/lib/auth/server-session-probe.ts", () => ({
  probeServerAuthSession: probe,
}));

import { authGate, authRedirectTarget, injectBeforeHeadClose } from "./auth-gate";

const user = { id: "u1", name: "Ada", email: "ada@example.test", handle: "ada_writer" };

function pageEvent(path: string, init?: RequestInit) {
  return {
    request: new Request(`http://localhost:3001${path}`, {
      headers: { accept: "text/html", cookie: "practice_access=t" },
      ...init,
    }),
    locals: {} as Record<string, unknown>,
  };
}

function htmlResponse(body: string | ReadableStream<Uint8Array>) {
  return new Response(body, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", "content-length": "1" },
  });
}

function streamOf(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}

describe("authRedirectTarget", () => {
  const url = (path: string) => new URL(`http://localhost:3001${path}`);
  const authed = { kind: "authenticated" as const, user };

  test("signed-in guest pages go to next or /app", () => {
    expect(authRedirectTarget(url("/login"), authed)).toBe("/app");
    expect(authRedirectTarget(url("/register"), authed)).toBe("/app");
    expect(authRedirectTarget(url("/"), authed)).toBeUndefined();
    expect(authRedirectTarget(url("/login?next=%2Fapp%2Fproblems"), authed)).toBe(
      "/app/problems",
    );
    expect(authRedirectTarget(url("/login?next=https%3A%2F%2Fevil.test"), authed)).toBe(
      "/app",
    );
  });

  test("signed-in /account aliases to profile; /app renders", () => {
    expect(authRedirectTarget(url("/account"), authed)).toBe("/app/profile");
    expect(authRedirectTarget(url("/app/problems"), authed)).toBeUndefined();
  });

  test("anonymous protected pages go to login with next", () => {
    const anon = { kind: "anonymous" as const };
    expect(authRedirectTarget(url("/app"), anon)).toBe("/login?next=%2Fapp");
    expect(authRedirectTarget(url("/app/problems?page=2"), anon)).toBe(
      "/login?next=%2Fapp%2Fproblems%3Fpage%3D2",
    );
    expect(authRedirectTarget(url("/account"), anon)).toBe(
      "/login?next=%2Fapp%2Fprofile",
    );
    expect(authRedirectTarget(url("/login"), anon)).toBeUndefined();
    expect(authRedirectTarget(url("/"), anon)).toBeUndefined();
  });

  test("checking and unavailable never redirect", () => {
    for (const kind of ["checking", "unavailable"] as const) {
      expect(authRedirectTarget(url("/app"), { kind })).toBeUndefined();
      expect(authRedirectTarget(url("/login"), { kind })).toBeUndefined();
    }
  });
});

describe("injectBeforeHeadClose", () => {
  test("injects before </head> even when the tag spans chunks", async () => {
    const out = await new Response(
      injectBeforeHeadClose(
        streamOf(["<html><head><title>x</title></he", "ad><body>ok</body></html>"]),
        "<script>seed</script>",
      ),
    ).text();
    expect(out).toBe(
      "<html><head><title>x</title><script>seed</script></head><body>ok</body></html>",
    );
  });

  test("passes the body through unchanged when there is no </head>", async () => {
    const out = await new Response(
      injectBeforeHeadClose(streamOf(["<p>", "fragment</p>"]), "<script></script>"),
    ).text();
    expect(out).toBe("<p>fragment</p>");
  });
});

describe("authGate", () => {
  afterEach(() => {
    probe.mockReset();
  });

  test("ignores API, asset, and non-GET requests", async () => {
    const next = vi.fn().mockResolvedValue(new Response("x"));
    await authGate(pageEvent("/api/auth/session") as never, next);
    await authGate(pageEvent("/api/auth/google") as never, next);
    await authGate(pageEvent("/api/auth/google/callback") as never, next);
    await authGate(pageEvent("/assets/app.js") as never, next);
    await authGate(pageEvent("/@vite/client") as never, next);
    await authGate(pageEvent("/login", { method: "POST" }) as never, next);
    expect(probe).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(6);
  });

  test("home bypasses auth even with cookies", async () => {
    const response = htmlResponse("<html><head></head><body>marketing</body></html>");
    const next = vi.fn().mockResolvedValue(response);
    const event = pageEvent("/");
    expect(await authGate(event as never, next)).toBe(response);
    expect(probe).not.toHaveBeenCalled();
    expect(event.locals).toEqual({});
  });

  test("non-redirecting documents bypass session probes even with cookies", async () => {
    for (const path of ["/u/ada", "/u/ada/topics/example", "/forgot-password", "/reset-password", "/missing-page"]) {
      const response = htmlResponse("<html><head></head><body>page</body></html>");
      const next = vi.fn().mockResolvedValue(response);
      const event = pageEvent(path);
      expect(await authGate(event as never, next)).toBe(response);
      expect(event.locals).toEqual({});
    }
    expect(probe).not.toHaveBeenCalled();
  });

  test("cookie-free protected requests skip backend probe", async () => {
    const next = vi.fn();
    const response = await authGate(pageEvent("/app", { headers: { accept: "text/html" } }) as never, next);
    expect(response.status).toBe(302);
    expect(probe).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test("anonymous /app gets a no-store 302 without rendering", async () => {
    probe.mockResolvedValue({ kind: "anonymous" });
    const next = vi.fn();
    const response = await authGate(pageEvent("/app") as never, next);
    expect(next).not.toHaveBeenCalled();
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("/login?next=%2Fapp");
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(response.headers.get("Vary")).toBe("Cookie");
    expect(probe).toHaveBeenCalledWith("practice_access=t", expect.any(Object));
  });

  test("stores the snapshot on locals and injects an escaped seed", async () => {
    const tricky = { ...user, name: "</script><script>alert(1)</script>" };
    probe.mockResolvedValue({ kind: "authenticated", user: tricky });
    const event = pageEvent("/app");
    const next = vi
      .fn()
      .mockResolvedValue(htmlResponse("<html><head></head><body></body></html>"));
    const response = await authGate(event as never, next);

    expect(event.locals.practiceAuthBootstrap).toEqual({
      kind: "authenticated",
      user: tricky,
    });
    expect(response.headers.get("content-length")).toBeNull();
    const html = await response.text();
    expect(html).toContain('<script id="practice-auth-bootstrap" type="application/json">');
    expect(html).not.toContain("</script><script>alert");
    expect(html).toContain("\\u003c/script\\u003e");
    const json = html.slice(
      html.indexOf('json">') + 'json">'.length,
      html.indexOf("</script></head>"),
    );
    expect(JSON.parse(json)).toEqual({ kind: "authenticated", user: tricky });
  });

  test("treats a */* accept header as a document request", async () => {
    probe.mockResolvedValue({ kind: "anonymous" });
    const response = await authGate(
      {
        request: new Request("http://localhost:3001/app", {
          headers: { accept: "*/*" },
        }),
        locals: {},
      } as never,
      vi.fn(),
    );
    expect(response.status).toBe(302);
  });
});
