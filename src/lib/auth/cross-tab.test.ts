import { describe, expect, test, vi } from "vitest";
import { createMemoryBroadcastHub } from "./broadcast";
import { createAuthCoordinator } from "./coordinator";
import { createAuthCrossTab, createTabId } from "./cross-tab";
import { createMemoryLockAdapter } from "./locks";

function coordinator() {
  return createAuthCoordinator({
    authApi: {
      getSession: vi.fn(),
      refresh: vi.fn(),
    },
    locks: createMemoryLockAdapter(),
  });
}

describe("auth cross-tab", () => {
  test("createTabId returns a non-empty string", () => {
    expect(createTabId().length).toBeGreaterThan(0);
  });

  test("ignores echo from same tabId", () => {
    const hub = createMemoryBroadcastHub();
    const coord = coordinator();
    const onInvalidate = vi.fn();
    const crossTab = createAuthCrossTab({
      tabId: "tab-1",
      broadcast: hub,
      coordinator: coord,
      onInvalidate,
    });
    crossTab.handleMessage({ type: "logged-out", tabId: "tab-1" });
    expect(onInvalidate).not.toHaveBeenCalled();
    expect(coord.isRecoverySuppressed()).toBe(false);
  });

  test("session-changed bumps epoch and invalidates", () => {
    const hub = createMemoryBroadcastHub();
    const coord = coordinator();
    const onInvalidate = vi.fn();
    const crossTab = createAuthCrossTab({
      tabId: "tab-a",
      broadcast: hub,
      coordinator: coord,
      onInvalidate,
    });
    expect(coord.getEpoch()).toBe(0);
    crossTab.handleMessage({ type: "session-changed", tabId: "tab-b" });
    expect(coord.getEpoch()).toBe(1);
    expect(onInvalidate).toHaveBeenCalled();
  });

  test("logged-out suppresses recovery until invalidate completes", async () => {
    const hub = createMemoryBroadcastHub();
    const coord = coordinator();
    let resolveInvalidate: () => void = () => {};
    const onInvalidate = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveInvalidate = resolve;
        }),
    );
    const crossTab = createAuthCrossTab({
      tabId: "tab-a",
      broadcast: hub,
      coordinator: coord,
      onInvalidate,
    });
    crossTab.handleMessage({ type: "logged-out", tabId: "tab-b" });
    expect(coord.isRecoverySuppressed()).toBe(true);
    resolveInvalidate();
    await vi.waitFor(() => expect(coord.isRecoverySuppressed()).toBe(false));
  });

  test("publish posts to hub peers", () => {
    const hub = createMemoryBroadcastHub();
    const peer = vi.fn();
    const coord = coordinator();
    createAuthCrossTab({
      tabId: "tab-a",
      broadcast: hub,
      coordinator: coord,
      onInvalidate: vi.fn(),
    });
    const peerTab = createAuthCrossTab({
      tabId: "tab-b",
      broadcast: hub,
      coordinator: coordinator(),
      onInvalidate: peer,
    });
    hub.subscribe((msg) => peerTab.handleMessage(msg));
    const local = createAuthCrossTab({
      tabId: "tab-a",
      broadcast: hub,
      coordinator: coord,
      onInvalidate: vi.fn(),
    });
    local.publishLoggedOut();
    expect(peer).toHaveBeenCalled();
  });
});