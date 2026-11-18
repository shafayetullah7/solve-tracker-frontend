import { describe, expect, test, vi } from "vitest";
import { ApiError } from "../api/errors";
import { createAuthCoordinator, type AuthApi } from "./coordinator";
import { createMemoryLockAdapter } from "./locks";

const refreshRequired = () =>
  new ApiError("http", "Access expired.", 401, "AUTH_REFRESH_REQUIRED");
const refreshInvalid = () =>
  new ApiError("http", "Session recovery failed.", 401, "AUTH_REFRESH_INVALID");
const user = {
  user: { id: "u1", name: "Test", email: "t@example.test", handle: "test_user" },
};

function authApi(overrides: Partial<AuthApi> = {}): AuthApi {
  return {
    getSession: vi.fn().mockResolvedValue(user),
    refresh: vi.fn().mockResolvedValue(user),
    ...overrides,
  };
}

function unsupportedLocks() {
  return { isSupported: () => false, request: vi.fn() };
}

describe("auth coordinator", () => {
  test("returns false without calling auth when Web Locks are unsupported", async () => {
    const api = authApi();
    const coordinator = createAuthCoordinator({
      authApi: api,
      locks: unsupportedLocks(),
    });
    expect(await coordinator.recoverSession()).toBe(false);
    expect(api.getSession).not.toHaveBeenCalled();
    expect(api.refresh).not.toHaveBeenCalled();
  });

  test("probe success skips refresh", async () => {
    const api = authApi({
      getSession: vi.fn().mockResolvedValue(user),
    });
    const coordinator = createAuthCoordinator({
      authApi: api,
      locks: createMemoryLockAdapter(),
    });
    expect(await coordinator.recoverSession()).toBe(true);
    expect(api.getSession).toHaveBeenCalledTimes(1);
    expect(api.refresh).not.toHaveBeenCalled();
  });

  test("refreshes once after AUTH_REFRESH_REQUIRED probe", async () => {
    const api = authApi({
      getSession: vi.fn().mockRejectedValueOnce(refreshRequired()),
      refresh: vi.fn().mockResolvedValue(user),
    });
    const coordinator = createAuthCoordinator({
      authApi: api,
      locks: createMemoryLockAdapter(),
    });
    expect(await coordinator.recoverSession()).toBe(true);
    expect(api.getSession).toHaveBeenCalledTimes(1);
    expect(api.refresh).toHaveBeenCalledTimes(1);
  });

  test("terminal probe error does not refresh", async () => {
    const api = authApi({
      getSession: vi.fn().mockRejectedValue(refreshInvalid()),
    });
    const coordinator = createAuthCoordinator({
      authApi: api,
      locks: createMemoryLockAdapter(),
    });
    expect(await coordinator.recoverSession()).toBe(false);
    expect(api.refresh).not.toHaveBeenCalled();
  });

  test("ambiguous refresh failure re-probes session once", async () => {
    const api = authApi({
      getSession: vi
        .fn()
        .mockRejectedValueOnce(refreshRequired())
        .mockRejectedValueOnce(refreshInvalid()),
      refresh: vi.fn().mockRejectedValue(refreshInvalid()),
    });
    const coordinator = createAuthCoordinator({
      authApi: api,
      locks: createMemoryLockAdapter(),
    });
    expect(await coordinator.recoverSession()).toBe(false);
    expect(api.getSession).toHaveBeenCalledTimes(2);
    expect(api.refresh).toHaveBeenCalledTimes(1);
  });

  test("ambiguous refresh failure can succeed on re-probe", async () => {
    const api = authApi({
      getSession: vi
        .fn()
        .mockRejectedValueOnce(refreshRequired())
        .mockResolvedValueOnce(user),
      refresh: vi.fn().mockRejectedValue(refreshInvalid()),
    });
    const coordinator = createAuthCoordinator({
      authApi: api,
      locks: createMemoryLockAdapter(),
    });
    expect(await coordinator.recoverSession()).toBe(true);
    expect(api.getSession).toHaveBeenCalledTimes(2);
    expect(api.refresh).toHaveBeenCalledTimes(1);
  });

  test("concurrent recoverSession shares one refresh", async () => {
    let releaseRefresh: () => void = () => {};
    const refreshReady = new Promise<void>((resolve) => {
      releaseRefresh = resolve;
    });
    const api = authApi({
      getSession: vi.fn().mockRejectedValue(refreshRequired()),
      refresh: vi.fn(async () => {
        await refreshReady;
        return user;
      }),
    });
    const coordinator = createAuthCoordinator({
      authApi: api,
      locks: createMemoryLockAdapter(),
    });
    const pending = Promise.all([
      coordinator.recoverSession(),
      coordinator.recoverSession(),
      coordinator.recoverSession(),
    ]);
    await vi.waitFor(() => expect(api.refresh).toHaveBeenCalledTimes(1));
    releaseRefresh();
    const results = await pending;
    expect(results).toEqual([true, true, true]);
  });

  test("bumpEpoch during refresh yields false", async () => {
    const api = authApi({
      getSession: vi.fn().mockRejectedValue(refreshRequired()),
      refresh: vi.fn().mockImplementation(async () => user),
    });
    const coordinator = createAuthCoordinator({
      authApi: api,
      locks: createMemoryLockAdapter(),
    });
    const refreshMock = api.refresh as ReturnType<typeof vi.fn>;
    refreshMock.mockImplementation(async () => {
      coordinator.bumpEpoch();
      return user;
    });
    expect(await coordinator.recoverSession()).toBe(false);
  });

  test("suppressed recovery skips getSession and refresh", async () => {
    const api = authApi();
    const coordinator = createAuthCoordinator({
      authApi: api,
      locks: createMemoryLockAdapter(),
    });
    coordinator.suppressRecovery();
    expect(await coordinator.recoverSession()).toBe(false);
    expect(api.getSession).not.toHaveBeenCalled();
    expect(api.refresh).not.toHaveBeenCalled();
  });

  test("releaseRecoverySuppression restores recovery", async () => {
    const api = authApi();
    const coordinator = createAuthCoordinator({
      authApi: api,
      locks: createMemoryLockAdapter(),
    });
    coordinator.suppressRecovery();
    coordinator.releaseRecoverySuppression();
    expect(await coordinator.recoverSession()).toBe(true);
    expect(api.getSession).toHaveBeenCalled();
  });
});