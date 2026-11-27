import { describe, expect, test, vi } from "vitest";
import { probeServerAuthSession } from "./server-session-probe";

const user = {
  id: "u1",
  name: "Ada",
  email: "ada@example.test",
  handle: "ada_writer",
};

describe("probeServerAuthSession", () => {
  test("maps 200 with user to authenticated", async () => {
    const fetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({ user }),
    });
    const result = await probeServerAuthSession("practice_access=x", {
      fetch,
      apiOrigin: "http://localhost:3000",
    });
    expect(result).toEqual({ kind: "authenticated", user });
    expect(fetch).toHaveBeenCalledWith(
      new URL("/auth/session", "http://localhost:3000"),
      expect.objectContaining({
        method: "GET",
        headers: expect.any(Headers),
      }),
    );
    const headers = fetch.mock.calls[0]![1]!.headers as Headers;
    expect(headers.get("Cookie")).toBe("practice_access=x");
  });

  test("maps 401 AUTH_REFRESH_REQUIRED to checking (browser may still refresh)", async () => {
    const fetch = vi.fn().mockResolvedValue({
      status: 401,
      ok: false,
      json: async () => ({ code: "AUTH_REFRESH_REQUIRED" }),
    });
    const result = await probeServerAuthSession("practice_refresh=x", {
      fetch,
      apiOrigin: "http://localhost:3000",
    });
    expect(result).toEqual({ kind: "checking" });
  });

  test("maps cookie-less AUTH_REFRESH_REQUIRED to anonymous", async () => {
    const fetch = vi.fn().mockResolvedValue({
      status: 401,
      ok: false,
      json: async () => ({ code: "AUTH_REFRESH_REQUIRED" }),
    });
    const result = await probeServerAuthSession(null, {
      fetch,
      apiOrigin: "http://localhost:3000",
    });
    expect(result).toEqual({ kind: "anonymous" });
  });

  test("maps other 401 codes to anonymous", async () => {
    const fetch = vi.fn().mockResolvedValue({
      status: 401,
      ok: false,
      json: async () => ({ code: "AUTH_REFRESH_INVALID" }),
    });
    const result = await probeServerAuthSession(null, {
      fetch,
      apiOrigin: "http://localhost:3000",
    });
    expect(result).toEqual({ kind: "anonymous" });
  });

  test("maps 401 without a JSON body to anonymous", async () => {
    const fetch = vi.fn().mockResolvedValue({
      status: 401,
      ok: false,
      json: async () => {
        throw new SyntaxError("not json");
      },
    });
    const result = await probeServerAuthSession(null, {
      fetch,
      apiOrigin: "http://localhost:3000",
    });
    expect(result).toEqual({ kind: "anonymous" });
  });

  test("maps 5xx to unavailable", async () => {
    const fetch = vi.fn().mockResolvedValue({
      status: 503,
      ok: false,
    });
    const result = await probeServerAuthSession(null, {
      fetch,
      apiOrigin: "http://localhost:3000",
    });
    expect(result).toEqual({ kind: "unavailable" });
  });

  test("maps invalid JSON shape to unavailable", async () => {
    const fetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({ user: { id: 1 } }),
    });
    const result = await probeServerAuthSession(null, {
      fetch,
      apiOrigin: "http://localhost:3000",
    });
    expect(result).toEqual({ kind: "unavailable" });
  });

  test("maps fetch failure to unavailable", async () => {
    const fetch = vi.fn().mockRejectedValue(new Error("network"));
    const result = await probeServerAuthSession(null, {
      fetch,
      apiOrigin: "http://localhost:3000",
    });
    expect(result).toEqual({ kind: "unavailable" });
  });

  test("invalid API origin returns unavailable without fetch", async () => {
    const fetch = vi.fn();
    const result = await probeServerAuthSession(null, {
      fetch,
      apiOrigin: "not-a-valid-origin",
    });
    expect(result).toEqual({ kind: "unavailable" });
    expect(fetch).not.toHaveBeenCalled();
  });
});

