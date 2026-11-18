import { describe, expect, it } from "vitest";
import {
  allDiscoverCopyStrings,
  DISCOVER_FORBIDDEN_WORDS,
  discoverCopy,
} from "./copy";

describe("discover copy deck", () => {
  it("interpolates parameters", () => {
    expect(
      discoverCopy("visibility.systemHandleHint", { handle: "ayesha" }),
    ).toContain("@ayesha");
  });

  it("forbids ranking language (U12)", () => {
    const lower = allDiscoverCopyStrings().join("\n").toLowerCase();
    for (const word of DISCOVER_FORBIDDEN_WORDS) {
      const pattern = new RegExp(`\\b${word.replace("#", "\\#")}\\b`, "i");
      expect(lower).not.toMatch(pattern);
    }
  });
});