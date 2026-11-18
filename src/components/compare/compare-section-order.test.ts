import { describe, expect, it } from "vitest";
import { compareSectionOrder } from "./compare-section-order";

describe("compareSectionOrder", () => {
  it("puts topics before platforms when focus=topics", () => {
    expect(compareSectionOrder("topics")).toEqual([
      "summary",
      "topics",
      "platforms",
      "insights",
    ]);
  });

  it("defaults to cadence ordering", () => {
    expect(compareSectionOrder("cadence")).toEqual([
      "summary",
      "platforms",
      "topics",
      "insights",
    ]);
    expect(compareSectionOrder(undefined)).toEqual([
      "summary",
      "platforms",
      "topics",
      "insights",
    ]);
  });
});