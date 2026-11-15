import { describe, test, expect, vi } from "vitest";
import { createAuthApi } from "./auth.api";
import { createApiClient } from "../client";
describe("typed auth API", () => {
  test("decodes public user fields and does not expose extra token values", async () => {
    const request = vi
      .fn()
      .mockResolvedValue({
        user: {
          id: "id",
          name: "Jane",
          email: "jane@example.com",
          passwordHash: "secret",
        },
        access: "secret",
      });
    expect(
      await createAuthApi({ request }).login({
        email: "jane@example.com",
        password: "long-password-here",
      }),
    ).toEqual({ user: { id: "id", name: "Jane", email: "jane@example.com" } });
    expect(request.mock.calls[0][0]).toMatchObject({
      path: "/auth/login",
      recoverAuth: false,
    });
  });
  test("rejects invalid session payloads", async () => {
    await expect(
      createAuthApi({
        request: vi.fn().mockResolvedValue({ user: null }),
      }).getSession(),
    ).rejects.toMatchObject({ kind: "contract" });
  });
  test("a failed raw refresh never recursively invokes session recovery", async () => {
    const recover = vi.fn();
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(JSON.stringify({ code: "AUTH_REFRESH_REQUIRED" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      );
    await expect(
      createAuthApi(
        createApiClient({ fetch: fetcher, recoverSession: recover }),
      ).refresh(),
    ).rejects.toMatchObject({ kind: "http" });
    expect(recover).not.toHaveBeenCalled();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
