import { afterEach, describe, expect, test, vi } from "vitest";

const probe = vi.hoisted(() => vi.fn());

vi.mock("../src/lib/auth/server-session-probe.ts", () => ({
  probeServerAuthSession: probe,
}));

import { authGate, authRedirectTarget } from "./auth-gate";

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

  test("authenticated document passes through without injecting session data", async () => {
    probe.mockResolvedValue({ kind: "authenticated", user });
    const event = pageEvent("/app");
    const response = htmlResponse("<html><head></head><body>shell</body></html>");
    const next = vi.fn().mockResolvedValue(response);
    expect(await authGate(event as never, next)).toBe(response);
    expect(event.locals).toEqual({});
    expect(await response.text()).not.toContain(user.email);
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
