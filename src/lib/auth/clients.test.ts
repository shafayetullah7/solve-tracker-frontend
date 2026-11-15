import { describe, expect, test, vi } from "vitest";
import { createAuthClients } from "./clients";
import { createMemoryLockAdapter } from "./locks";

const json = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const expired = () =>
  json({ code: "AUTH_REFRESH_REQUIRED", message: "Expired" }, 401);

describe("createAuthClients", () => {
  test("product client recovers through coordinator and retries once", async () => {
    const user = {
      user: { id: "u1", name: "Jane", email: "jane@example.com" },
    };
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(expired())
      .mockResolvedValueOnce(expired())
      .mockResolvedValueOnce(json(user))
      .mockResolvedValueOnce(json({ ok: true }));
    const { productClient, coordinator } = createAuthClients({
      fetch: fetcher,
      locks: createMemoryLockAdapter(),
    });
    const refreshSpy = vi.spyOn(coordinator, "recoverSession");
    await expect(
      productClient.request({ path: "/topics", recoverAuth: true }),
    ).resolves.toEqual({ ok: true });
    expect(refreshSpy).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledTimes(4);
  });
});