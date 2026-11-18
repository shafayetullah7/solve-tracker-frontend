import { afterEach, describe, expect, test, vi } from "vitest";

describe("discover route-access", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("blocks discover when mode is not full", async () => {
    vi.stubEnv("VITE_DISCOVER_MODE", "sharing");
    const { shouldBlockDiscoverAppRoute } = await import("./route-access");
    expect(shouldBlockDiscoverAppRoute("/app/discover")).toBe(true);
  });

  test("allows self profile in sharing mode", async () => {
    vi.stubEnv("VITE_DISCOVER_MODE", "sharing");
    const { shouldBlockPeopleRoute } = await import("./route-access");
    expect(shouldBlockPeopleRoute("/app/u/me", "me", "me")).toBe(false);
    expect(shouldBlockPeopleRoute("/app/u/other", "me", "other")).toBe(true);
  });
});