import { describe, expect, test } from "vitest";
import { problemNewFromStudy } from "../problems/paths";
import {
  effectiveProblemResolution,
  hasOpenProblems,
  problemResolutionBadgeText,
} from "./problem-resolution";

describe("problemResolutionBadgeText", () => {
  test("returns manual-solved copy for each state", () => {
    expect(problemResolutionBadgeText("unresolved")).toBe("Not in your library");
    expect(problemResolutionBadgeText("linked_unsolved")).toBe(
      "In library · not solved (manual)",
    );
    expect(problemResolutionBadgeText("solved")).toBe("Solved (manual)");
  });
});

describe("effectiveProblemResolution", () => {
  test("defaults missing to unresolved", () => {
    expect(effectiveProblemResolution(undefined)).toBe("unresolved");
  });
});

describe("hasOpenProblems", () => {
  test("is false without problem blocks", () => {
    expect(hasOpenProblems({})).toBe(false);
    expect(hasOpenProblems({ problemBlocks: undefined })).toBe(false);
  });

  test("is true when any block is not solved", () => {
    expect(
      hasOpenProblems({
        problemBlocks: [
          {
            blockId: "11111111-1111-4111-8111-111111111111",
            problemResolution: "solved",
          },
          {
            blockId: "22222222-2222-4222-8222-222222222222",
            problemResolution: "unresolved",
          },
        ],
      }),
    ).toBe(true);
  });
});

describe("problemNewFromStudy", () => {
  test("encodes url and next", () => {
    const href = problemNewFromStudy({
      url: "https://leetcode.com/problems/two-sum/",
      title: "Two Sum",
      next: "/app/learning/g1/study/n1",
    });
    expect(href).toContain("/app/problems/new?");
    expect(href).toContain(encodeURIComponent("https://leetcode.com/problems/two-sum/"));
    expect(href).toContain(encodeURIComponent("/app/learning/g1/study/n1"));
    expect(href).toContain("title=Two+Sum");
  });
});