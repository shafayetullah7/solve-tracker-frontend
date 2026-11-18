import { describe, expect, test, vi } from "vitest";
import { ApiError } from "../api/errors";
import { resolveBootstrapSession } from "./session-state";
import { createMemoryLockAdapter } from "./locks";
import { createAuthCoordinator, type AuthApi } from "./coordinator";

const user = { id: "u1", name: "Test", email: "t@example.test", handle: "test_user" };

function coordinator(
  recoverImpl: () => Promise<boolean> = () => Promise.resolve(false),
) {
  const authApi: AuthApi = {
    getSession: vi.fn(),
    refresh: vi.fn(),
  };
  const coord = createAuthCoordinator({
    authApi,
    locks: createMemoryLockAdapter(),
  });
  const recover = vi
    .spyOn(coord, "recoverSession")
    .mockImplementation(recoverImpl);
  return { coord, recover };
}

describe("resolveBootstrapSession", () => {
  test("returns authenticated when probe succeeds", async () => {
    const api = { getSession: vi.fn().mockResolvedValue({ user }) };
    const { coord } = coordinator();
    await expect(resolveBootstrapSession(api, coord)).resolves.toEqual({
      kind: "authenticated",
      user,
    });
  });

  test("recovers then probes again", async () => {
    const api = {
      getSession: vi
        .fn()
        .mockRejectedValueOnce(
          new ApiError("http", "Expired", 401, "AUTH_REFRESH_REQUIRED"),
        )
        .mockResolvedValueOnce({ user }),
    };
    const { coord, recover } = coordinator(() => Promise.resolve(true));
    await expect(resolveBootstrapSession(api, coord)).resolves.toEqual({
      kind: "authenticated",
      user,
    });
    expect(recover).toHaveBeenCalledTimes(1);
  });

  test("fails recovery as anonymous", async () => {
    const api = {
      getSession: vi
        .fn()
        .mockRejectedValue(
          new ApiError("http", "Expired", 401, "AUTH_REFRESH_REQUIRED"),
        ),
    };
    const { coord } = coordinator(() => Promise.resolve(false));
    await expect(resolveBootstrapSession(api, coord)).resolves.toEqual({
      kind: "anonymous",
    });
  });

  test("terminal auth is anonymous", async () => {
    const api = {
      getSession: vi
        .fn()
        .mockRejectedValue(
          new ApiError("http", "Invalid", 401, "AUTH_SESSION_INVALID"),
        ),
    };
    const { coord } = coordinator();
    await expect(resolveBootstrapSession(api, coord)).resolves.toEqual({
      kind: "anonymous",
    });
  });

  test("network errors are unavailable", async () => {
    const api = {
      getSession: vi.fn().mockRejectedValue(new ApiError("network", "Down")),
    };
    const { coord } = coordinator();
    await expect(resolveBootstrapSession(api, coord)).resolves.toEqual({
      kind: "unavailable",
    });
  });

  test("respects abort flag", async () => {
    const api = {
      getSession: vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ user }), 20);
          }),
      ),
    };
    const { coord } = coordinator();
    let aborted = false;
    const pending = resolveBootstrapSession(api, coord, {
      isAborted: () => aborted,
    });
    aborted = true;
    await expect(pending).resolves.toEqual({ kind: "cancelled" });
  });
});