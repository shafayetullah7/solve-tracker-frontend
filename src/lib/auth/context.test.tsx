import { render } from "@solidjs/testing-library";
import { flush, onSettled } from "solid-js";
import { describe, expect, test, vi } from "vitest";
import { ApiError } from "../api/errors";
import type { AuthClientsBundle } from "./context";
import { AuthProvider, useAuth } from "./context";
import { createMemoryBroadcastHub } from "./broadcast";
import { createAuthCoordinator } from "./coordinator";
import { createMemoryLockAdapter } from "./locks";

const user = { id: "u1", name: "Test", email: "t@example.test" };

function Probe(props: { onAuth?: (auth: ReturnType<typeof useAuth>) => void }) {
  const auth = useAuth();
  onSettled(() => {
    props.onAuth?.(auth);
  });
  return (
    <p data-testid="status">{auth.status()}</p>
  );
}

function bundleFromSession(
  getSession: ReturnType<typeof vi.fn>,
  recoverResult = false,
): AuthClientsBundle {
  const authApi = {
    getSession,
    refresh: vi.fn(),
  };
  const coordinator = createAuthCoordinator({
    authApi: authApi as Parameters<typeof createAuthCoordinator>[0]["authApi"],
    locks: createMemoryLockAdapter(),
  });
  vi.spyOn(coordinator, "recoverSession").mockResolvedValue(recoverResult);
  return {
    authApi: authApi as unknown as AuthClientsBundle["authApi"],
    coordinator,
    productClient: { request: vi.fn() } as AuthClientsBundle["productClient"],
    rawClient: { request: vi.fn() } as AuthClientsBundle["rawClient"],
    broadcast: createMemoryBroadcastHub(),
  };
}

describe("AuthProvider", () => {
  test("starts in checking then becomes authenticated", async () => {
    const clients = bundleFromSession(vi.fn().mockResolvedValue({ user }));
    const { getByTestId } = render(() => (
      <AuthProvider clients={clients}>
        <Probe />
      </AuthProvider>
    ));
    expect(getByTestId("status")).toHaveTextContent("checking");
    await vi.waitFor(() =>
      expect(getByTestId("status")).toHaveTextContent("authenticated"),
    );
    expect(clients.authApi.getSession).toHaveBeenCalledTimes(1);
  });

  test("recovery path authenticates", async () => {
    const getSession = vi
      .fn()
      .mockRejectedValueOnce(
        new ApiError("http", "Expired", 401, "AUTH_REFRESH_REQUIRED"),
      )
      .mockResolvedValueOnce({ user });
    const clients = bundleFromSession(getSession, true);
    const { getByTestId } = render(() => (
      <AuthProvider clients={clients}>
        <Probe />
      </AuthProvider>
    ));
    await vi.waitFor(() =>
      expect(getByTestId("status")).toHaveTextContent("authenticated"),
    );
    expect(clients.coordinator.recoverSession).toHaveBeenCalledTimes(1);
  });

  test("failed recovery becomes anonymous", async () => {
    const getSession = vi
      .fn()
      .mockRejectedValue(
        new ApiError("http", "Expired", 401, "AUTH_REFRESH_REQUIRED"),
      );
    const clients = bundleFromSession(getSession, false);
    const { getByTestId } = render(() => (
      <AuthProvider clients={clients}>
        <Probe />
      </AuthProvider>
    ));
    await vi.waitFor(() =>
      expect(getByTestId("status")).toHaveTextContent("anonymous"),
    );
  });

  test("network failure becomes unavailable and retryBootstrap rechecks", async () => {
    const getSession = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("network", "Down"))
      .mockResolvedValueOnce({ user });
    const clients = bundleFromSession(getSession);
    let authRef: ReturnType<typeof useAuth> | undefined;
    const { getByTestId } = render(() => (
      <AuthProvider clients={clients}>
        <Probe onAuth={(auth) => (authRef = auth)} />
      </AuthProvider>
    ));
    await vi.waitFor(() =>
      expect(getByTestId("status")).toHaveTextContent("unavailable"),
    );
    await authRef!.retryBootstrap();
    await vi.waitFor(() =>
      expect(getByTestId("status")).toHaveTextContent("authenticated"),
    );
  });

  test("peer logged-out hint re-probes session", async () => {
    const hub = createMemoryBroadcastHub();
    const getSession = vi.fn().mockResolvedValue({ user });
    const authApi = {
      getSession,
      refresh: vi.fn(),
      logout: vi.fn(),
    };
    const coordinator = createAuthCoordinator({
      authApi: authApi as Parameters<typeof createAuthCoordinator>[0]["authApi"],
      locks: createMemoryLockAdapter(),
    });
    const clients: AuthClientsBundle = {
      authApi: authApi as unknown as AuthClientsBundle["authApi"],
      coordinator,
      productClient: { request: vi.fn() } as AuthClientsBundle["productClient"],
      rawClient: { request: vi.fn() } as AuthClientsBundle["rawClient"],
      broadcast: hub,
    };
    const { getByTestId } = render(() => (
      <AuthProvider clients={clients}>
        <Probe />
      </AuthProvider>
    ));
    await vi.waitFor(() =>
      expect(getByTestId("status")).toHaveTextContent("authenticated"),
    );
    const callsBefore = getSession.mock.calls.length;
    getSession.mockRejectedValueOnce(
      new ApiError("http", "Unauthorized", 401, "AUTH_REFRESH_INVALID"),
    );
    hub.deliver({ type: "logged-out", tabId: "peer-tab" });
    await vi.waitFor(() =>
      expect(getByTestId("status")).toHaveTextContent("anonymous"),
    );
    expect(getSession.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  test("login publishes session-changed on memory broadcast hub", async () => {
    const hub = createMemoryBroadcastHub();
    const publish = vi.spyOn(hub, "publish");
    const loginFn = vi.fn().mockResolvedValue({ user });
    const clients = bundleFromSession(vi.fn().mockResolvedValue({ user }));
    clients.broadcast = hub;
    clients.authApi.login = loginFn as AuthClientsBundle["authApi"]["login"];
    let authRef: ReturnType<typeof useAuth> | undefined;
    render(() => (
      <AuthProvider clients={clients}>
        <Probe onAuth={(auth) => (authRef = auth)} />
      </AuthProvider>
    ));
    await vi.waitFor(() => expect(authRef!.status()).toBe("authenticated"));
    await authRef!.login({
      email: "t@example.test",
      password: "long-test-password-12",
    });
    await vi.waitFor(() =>
      expect(publish).toHaveBeenCalledWith(
        expect.objectContaining({ type: "session-changed" }),
      ),
    );
  });

  test("clearSession bumps epoch and sets anonymous", async () => {
    const clients = bundleFromSession(vi.fn().mockResolvedValue({ user }));
    const bump = vi.spyOn(clients.coordinator, "bumpEpoch");
    let authRef: ReturnType<typeof useAuth> | undefined;
    render(() => (
      <AuthProvider clients={clients}>
        <Probe onAuth={(auth) => (authRef = auth)} />
      </AuthProvider>
    ));
    await vi.waitFor(() => expect(authRef!.status()).toBe("authenticated"));
    authRef!.clearSession();
    flush();
    expect(authRef!.status()).toBe("anonymous");
    expect(bump).toHaveBeenCalledTimes(1);
  });
});