import { describe, expect, test } from "vitest";
import { formatTopicProgress } from "./progress-display";

describe("formatTopicProgress", () => {
  test("formats empty topic as 0%", () => {
    expect(
      formatTopicProgress({
        id: "11111111-1111-4111-8111-111111111111",
        name: "Empty",
        total: 0,
        solved: 0,
        unsolved: 0,
        percentComplete: 0,
      }),
    ).toBe("0 / 0 solved (0%)");
  });

  test("formats full completion", () => {
    expect(
      formatTopicProgress({
        id: "22222222-2222-4222-8222-222222222222",
        name: "Arrays",
        total: 1,
        solved: 1,
        unsolved: 0,
        percentComplete: 100,
      }),
    ).toBe("1 / 1 solved (100%)");
  });
});