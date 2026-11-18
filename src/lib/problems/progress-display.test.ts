import { describe, expect, test } from "vitest";
import {
  formatTopicProgress,
  formatTopicProgressDetail,
  overallPercentComplete,
  summarizeTopicsLibrary,
  topicProgressForItem,
} from "./progress-display";

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

  test("overallPercentComplete", () => {
    expect(overallPercentComplete({ total: 0, solved: 0, unsolved: 0 })).toBe(0);
    expect(overallPercentComplete({ total: 4, solved: 1, unsolved: 3 })).toBe(25);
    expect(overallPercentComplete({ total: 3, solved: 3, unsolved: 0 })).toBe(100);
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

describe("formatTopicProgressDetail", () => {
  test("empty topic uses friendly copy", () => {
    expect(
      formatTopicProgressDetail({
        id: "11111111-1111-4111-8111-111111111111",
        name: "Empty",
        total: 0,
        solved: 0,
        unsolved: 0,
        percentComplete: 0,
      }),
    ).toBe("No problems linked yet");
  });

  test("non-empty topic uses numeric copy", () => {
    expect(
      formatTopicProgressDetail({
        id: "22222222-2222-4222-8222-222222222222",
        name: "Arrays",
        total: 4,
        solved: 1,
        unsolved: 3,
        percentComplete: 25,
      }),
    ).toBe("1 / 4 solved (25%)");
  });
});

describe("topicProgressForItem", () => {
  test("returns map row when present", () => {
    const row = {
      id: "11111111-1111-4111-8111-111111111111",
      name: "Arrays",
      total: 2,
      solved: 1,
      unsolved: 1,
      percentComplete: 50,
    };
    const map = new Map([[row.id, row]]);
    expect(topicProgressForItem({ id: row.id, name: row.name }, map)).toEqual(row);
  });

  test("synthesizes zeros when missing from map", () => {
    const id = "11111111-1111-4111-8111-111111111111";
    expect(topicProgressForItem({ id, name: "New" }, new Map())).toEqual({
      id,
      name: "New",
      total: 0,
      solved: 0,
      unsolved: 0,
      percentComplete: 0,
    });
  });
});

describe("summarizeTopicsLibrary", () => {
  test("pluralizes counts", () => {
    expect(
      summarizeTopicsLibrary([
        {
          id: "a",
          name: "A",
          total: 3,
          solved: 0,
          unsolved: 3,
          percentComplete: 0,
        },
        {
          id: "b",
          name: "B",
          total: 2,
          solved: 2,
          unsolved: 0,
          percentComplete: 100,
        },
      ]),
    ).toBe("2 topics · 5 problems");
  });

  test("singularizes when one topic and one problem", () => {
    expect(
      summarizeTopicsLibrary([
        {
          id: "a",
          name: "A",
          total: 1,
          solved: 0,
          unsolved: 1,
          percentComplete: 0,
        },
      ]),
    ).toBe("1 topic · 1 problem");
  });
});