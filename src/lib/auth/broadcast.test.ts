import { describe, expect, test, vi } from "vitest";
import {
  createMemoryBroadcastHub,
  createNoopBroadcastAdapter,
  parseAuthBroadcastMessage,
} from "./broadcast";

describe("auth broadcast", () => {
  test("parseAuthBroadcastMessage validates shape", () => {
    expect(parseAuthBroadcastMessage({ type: "logged-out", tabId: "t1" })).toEqual(
      { type: "logged-out", tabId: "t1" },
    );
    expect(parseAuthBroadcastMessage({ type: "nope", tabId: "t1" })).toBeUndefined();
    expect(parseAuthBroadcastMessage("bad")).toBeUndefined();
  });

  test("memory hub delivers to peer subscribers", () => {
    const hub = createMemoryBroadcastHub();
    const peer = vi.fn();
    hub.subscribe(peer);
    hub.publish({ type: "session-changed", tabId: "tab-a" });
    expect(peer).toHaveBeenCalledWith({ type: "session-changed", tabId: "tab-a" });
  });

  test("memory hub deliver ignores malformed payloads", () => {
    const hub = createMemoryBroadcastHub();
    const peer = vi.fn();
    hub.subscribe(peer);
    hub.deliver({ type: "logged-out" });
    expect(peer).not.toHaveBeenCalled();
  });

  test("noop adapter does not invoke subscribers", () => {
    const noop = createNoopBroadcastAdapter();
    const peer = vi.fn();
    noop.subscribe(peer);
    noop.publish({ type: "logged-out", tabId: "x" });
    expect(peer).not.toHaveBeenCalled();
    expect(noop.isSupported()).toBe(false);
  });
});