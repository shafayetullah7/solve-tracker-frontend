import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getDiscoverMode,
  isDiscoverFullEnabled,
  isDiscoverOff,
  isDiscoverSharingEnabled,
} from "./flag";

describe("discover flag", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults to off", () => {
    vi.stubEnv("VITE_DISCOVER_MODE", undefined);
    expect(getDiscoverMode()).toBe("off");
    expect(isDiscoverOff()).toBe(true);
    expect(isDiscoverSharingEnabled()).toBe(false);
    expect(isDiscoverFullEnabled()).toBe(false);
  });

  it.each(["sharing", "full"] as const)("enables sharing UI for %s", (mode) => {
    vi.stubEnv("VITE_DISCOVER_MODE", mode);
    expect(isDiscoverSharingEnabled()).toBe(true);
  });

  it("enables full discovery only for full", () => {
    vi.stubEnv("VITE_DISCOVER_MODE", "full");
    expect(isDiscoverFullEnabled()).toBe(true);
    vi.stubEnv("VITE_DISCOVER_MODE", "sharing");
    expect(isDiscoverFullEnabled()).toBe(false);
  });
});