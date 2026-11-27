import { describe, expect, test } from "vitest";
import { buildNavItems, SIDEBAR_LABELS } from "./app-sidebar-nav";

describe("buildNavItems", () => {
  test("orders nav without learning or discover", () => {
    const items = buildNavItems(
      { learningEnabled: false, discoverFullEnabled: false },
      "Discover",
    );
    expect(items.map((item) => item.label)).toEqual([
      SIDEBAR_LABELS.overview,
      SIDEBAR_LABELS.problems,
      SIDEBAR_LABELS.topics,
      SIDEBAR_LABELS.profile,
    ]);
  });

  test("inserts My guides after Overview when learning enabled", () => {
    const items = buildNavItems(
      { learningEnabled: true, discoverFullEnabled: false },
      "Discover",
    );
    expect(items.map((item) => item.label)).toEqual([
      SIDEBAR_LABELS.overview,
      SIDEBAR_LABELS.myGuides,
      SIDEBAR_LABELS.problems,
      SIDEBAR_LABELS.topics,
      SIDEBAR_LABELS.profile,
    ]);
  });

  test("places Discover before Profile when full discover enabled", () => {
    const items = buildNavItems(
      { learningEnabled: true, discoverFullEnabled: true },
      "Discover",
    );
    expect(items.map((item) => item.key)).toEqual([
      "dashboard",
      "learning",
      "library",
      "topics",
      "discover",
      "profile",
    ]);
  });
});