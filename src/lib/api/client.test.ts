import { describe, expect, test, vi } from "vitest";
import { createApiClient } from "./client";
import { ApiError } from "./errors";
const json = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
const expired = () =>
  json({ code: "AUTH_REFRESH_REQUIRED", message: "Expired" }, 401);

describe("API transport", () => {
  test("encodes values, omits undefined, and sends browser credentials", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(json({ ok: true }));
    const result = await createApiClient({ fetch: fetcher }).request({
      path: "/items",
      query: {
        q: "a & b",
        flag: false,
        count: 0,
        omitted: undefined,
        tag: ["x", "y"],
      },
    });
    expect(result).toEqual({ ok: true });
    expect(fetcher.mock.calls[0][0]).toBe(
      "/api/items?q=a+%26+b&flag=false&count=0&tag=x&tag=y",
    );
    expect(fetcher.mock.calls[0][1]).toMatchObject({
      credentials: "same-origin",
      redirect: "error",
    });
  });
  test("sends JSON and required write header", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 204 }));
    expect(
      await createApiClient({ fetch: fetcher }).request({
        path: "/items",
        method: "POST",
        body: { title: "x" },
      }),
    ).toBeUndefined();
    expect(fetcher.mock.calls[0][1]).toMatchObject({
      body: '{"title":"x"}',
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "practice",
      },
    });
  });
  test("supports explicitly requested text", async () => {
    const client = createApiClient({
      fetch: vi.fn<typeof fetch>().mockResolvedValue(new Response("hello")),
    });
    expect(await client.request({ path: "/", response: "text" })).toBe("hello");
  });
  test.each([
    "https://evil.test/",
    "//evil.test/",
    "/../secret",
    "/%2e%2e/secret",
    "/x\\y",
    "/x?secret=yes",
    "/x#frag",
  ])("rejects unsafe path %s before fetch", async (path) => {
    const fetcher = vi.fn<typeof fetch>();
    await expect(
      createApiClient({ fetch: fetcher }).request({ path }),
    ).rejects.toMatchObject({ kind: "contract" });
    expect(fetcher).not.toHaveBeenCalled();
  });
  test("keeps structured HTTP errors and Retry-After", async () => {
    const response = json(
      { code: "RATE_LIMITED", message: "Slow down", details: { field: "x" } },
      429,
    );
    response.headers.set("Retry-After", "60");
    await expect(
      createApiClient({
        fetch: vi.fn<typeof fetch>().mockResolvedValue(response),
      }).request({ path: "/" }),
    ).rejects.toMatchObject({
      kind: "http",
      status: 429,
      code: "RATE_LIMITED",
      retryAfter: "60",
    });
  });
  test("does not expose HTML error bodies", async () => {
    await expect(
      createApiClient({
        fetch: vi
          .fn<typeof fetch>()
          .mockResolvedValue(new Response("<secret/>", { status: 502 })),
      }).request({ path: "/" }),
    ).rejects.toMatchObject({ message: "API request failed." });
  });
  test("rejects malformed success JSON", async () => {
    await expect(
      createApiClient({
        fetch: vi.fn<typeof fetch>().mockResolvedValue(
          new Response("{", {
            headers: { "Content-Type": "application/json" },
          }),
        ),
      }).request({ path: "/" }),
    ).rejects.toMatchObject({ kind: "contract" });
  });
  test("classifies network failure", async () => {
    await expect(
      createApiClient({
        fetch: vi
          .fn<typeof fetch>()
          .mockRejectedValue(new TypeError("fetch failed")),
      }).request({ path: "/" }),
    ).rejects.toMatchObject({ kind: "network" });
  });
  test("times out an abortable request", async () => {
    const fetcher: typeof fetch = (_url, init) =>
      new Promise((_resolve, reject) =>
        init?.signal?.addEventListener("abort", () =>
          reject(new DOMException("Aborted", "AbortError")),
        ),
      );
    await expect(
      createApiClient({ fetch: fetcher, timeoutMs: 10 }).request({ path: "/" }),
    ).rejects.toMatchObject({ kind: "timeout" });
  });
  test("does not fetch for an already cancelled caller", async () => {
    const controller = new AbortController();
    controller.abort();
    const fetcher = vi.fn<typeof fetch>();
    await expect(
      createApiClient({ fetch: fetcher }).request({
        path: "/",
        signal: controller.signal,
      }),
    ).rejects.toMatchObject({ kind: "cancelled" });
    expect(fetcher).not.toHaveBeenCalled();
  });
  test("retries once after eligible recovery, preserving JSON body", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(expired())
      .mockResolvedValueOnce(json({ ok: true }));
    const recover = vi.fn().mockResolvedValue(true);
    await createApiClient({ fetch: fetcher, recoverSession: recover }).request({
      path: "/items",
      method: "POST",
      body: { title: "x" },
      recoverAuth: true,
    });
    expect(recover).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls[1][1]?.body).toBe(fetcher.mock.calls[0][1]?.body);
  });
  test("does not recursively recover after a second expiry", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => expired());
    const recover = vi.fn().mockResolvedValue(true);
    await expect(
      createApiClient({ fetch: fetcher, recoverSession: recover }).request({
        path: "/",
        recoverAuth: true,
      }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(recover).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  test.each([401, 403, 429, 500])(
    "does not refresh for unrelated status %s",
    async (status) => {
      const recover = vi.fn();
      const fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValue(json({ code: "OTHER" }, status));
      await expect(
        createApiClient({ fetch: fetcher, recoverSession: recover }).request({
          path: "/",
          recoverAuth: true,
        }),
      ).rejects.toBeInstanceOf(ApiError);
      expect(recover).not.toHaveBeenCalled();
    },
  );
  test("recovery defaults to disabled", async () => {
    const recover = vi.fn();
    await expect(
      createApiClient({
        fetch: vi.fn<typeof fetch>().mockResolvedValue(expired()),
        recoverSession: recover,
      }).request({ path: "/" }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(recover).not.toHaveBeenCalled();
  });
  test("cancellation while awaiting recovery stops retry but not recovery", async () => {
    const controller = new AbortController();
    const recover = vi.fn(async () => {
      controller.abort();
      return true;
    });
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(expired());
    await expect(
      createApiClient({ fetch: fetcher, recoverSession: recover }).request({
        path: "/",
        recoverAuth: true,
        signal: controller.signal,
      }),
    ).rejects.toMatchObject({ kind: "cancelled" });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(recover).toHaveBeenCalledWith();
  });
  test("ignores a late successful response after an account change", async () => {
    let epoch = 0;
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async () => {
      epoch++;
      return json({ private: true });
    });
    await expect(
      createApiClient({ fetch: fetcher, getAuthEpoch: () => epoch }).request({
        path: "/",
      }),
    ).rejects.toMatchObject({ kind: "context-changed" });
  });
  test("cancels an in-flight request without treating it as a network failure", async () => {
    const controller = new AbortController();
    const fetcher: typeof fetch = (_url, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () =>
          reject(new DOMException("Aborted", "AbortError")),
        );
        controller.abort();
      });
    await expect(
      createApiClient({ fetch: fetcher }).request({
        path: "/",
        signal: controller.signal,
      }),
    ).rejects.toMatchObject({ kind: "cancelled" });
  });
  test("rejects unsupported JSON bodies without fetching", async () => {
    const fetcher = vi.fn<typeof fetch>();
    await expect(
      createApiClient({ fetch: fetcher }).request({
        path: "/",
        method: "POST",
        body: new FormData(),
      }),
    ).rejects.toMatchObject({ kind: "contract" });
    expect(fetcher).not.toHaveBeenCalled();
  });
  test("invalidates session when recovery fails", async () => {
    const invalidate = vi.fn();
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(expired());
    const recover = vi.fn().mockResolvedValue(false);
    await expect(
      createApiClient({
        fetch: fetcher,
        recoverSession: recover,
        onSessionInvalidated: invalidate,
      }).request({ path: "/", recoverAuth: true }),
    ).rejects.toMatchObject({ code: "AUTH_REFRESH_REQUIRED" });
    expect(invalidate).toHaveBeenCalledTimes(1);
  });

  test("invalidates session on terminal auth without refresh", async () => {
    const invalidate = vi.fn();
    await expect(
      createApiClient({
        fetch: vi
          .fn<typeof fetch>()
          .mockResolvedValue(
            json({ code: "AUTH_SESSION_INVALID", message: "Invalid session." }, 401),
          ),
        onSessionInvalidated: invalidate,
      }).request({ path: "/", recoverAuth: true }),
    ).rejects.toMatchObject({ code: "AUTH_SESSION_INVALID" });
    expect(invalidate).toHaveBeenCalledTimes(1);
  });

  test("invalidates session when retry after recovery is unauthorized", async () => {
    const invalidate = vi.fn();
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(expired())
      .mockResolvedValueOnce(
        json({ code: "AUTH_SESSION_INVALID", message: "Invalid session." }, 401),
      );
    await expect(
      createApiClient({
        fetch: fetcher,
        recoverSession: async () => true,
        onSessionInvalidated: invalidate,
      }).request({ path: "/", recoverAuth: true }),
    ).rejects.toMatchObject({ code: "AUTH_SESSION_INVALID" });
    expect(invalidate).toHaveBeenCalledTimes(1);
  });

  test("ignores a late failed retry after account change", async () => {
    let epoch = 0;
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(expired())
      .mockImplementationOnce(async () => {
        epoch++;
        return json({ code: "AUTH_SESSION_INVALID" }, 401);
      });
    await expect(
      createApiClient({
        fetch: fetcher,
        getAuthEpoch: () => epoch,
        recoverSession: async () => true,
      }).request({ path: "/", recoverAuth: true }),
    ).rejects.toMatchObject({ kind: "context-changed" });
  });
});
