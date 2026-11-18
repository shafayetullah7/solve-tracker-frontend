import { describe, expect, test } from "vitest";
import { buildForYouSections } from "./for-you-layout";

describe("for-you-layout", () => {
  test("hides rails below 3 cards", () => {
    const sections = buildForYouSections({
      rails: [{ kind: "peers", peopleCount: 2 }],
      viewerHasGoal: false,
      goalPatternItems: 0,
      yourTopicsCount: 1,
      starterListsCount: 1,
    });
    expect(sections.some((s) => s.type === "rail")).toBe(false);
    expect(sections).toContainEqual({ type: "yourTopics" });
  });

  test("moves same_goal to top when viewer has goal", () => {
    const sections = buildForYouSections({
      rails: [
        { kind: "peers", peopleCount: 3 },
        { kind: "same_goal", peopleCount: 4 },
      ],
      viewerHasGoal: true,
      goalPatternItems: 0,
      yourTopicsCount: 0,
      starterListsCount: 0,
    });
    expect(sections[0]).toEqual({ type: "rail", kind: "same_goal" });
  });
});