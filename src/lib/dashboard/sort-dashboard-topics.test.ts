import { describe, expect, test } from "vitest";
import type { TopicProgress } from "../api/modules/progress.api";
import { sortDashboardTopics } from "./sort-dashboard-topics";

const id = (n: number) =>
  `${String(n).padStart(8, "0")}-0000-4000-8000-000000000000`;

function row(
  n: number,
  overrides: Partial<TopicProgress> & Pick<TopicProgress, "name">,
): TopicProgress {
  return {
    id: id(n),
    name: overrides.name,
    total: overrides.total ?? 2,
    solved: overrides.solved ?? 1,
    unsolved: overrides.unsolved ?? 1,
    percentComplete: overrides.percentComplete ?? 50,
  };
}

describe("sortDashboardTopics", () => {
  test("mostRemaining puts highest unsolved first", () => {
    const topics = [
      row(1, { name: "Arrays", unsolved: 1, solved: 4, total: 5, percentComplete: 80 }),
      row(2, { name: "Graphs", unsolved: 5, solved: 0, total: 5, percentComplete: 0 }),
    ];
    const sorted = sortDashboardTopics(topics, "mostRemaining");
    expect(sorted[0].name).toBe("Graphs");
  });

  test("mostIncomplete puts lowest percent first and empty topics last", () => {
    const topics = [
      row(1, { name: "Done", total: 10, solved: 10, unsolved: 0, percentComplete: 100 }),
      row(2, { name: "Stale", total: 10, solved: 1, unsolved: 9, percentComplete: 10 }),
      row(3, { name: "Empty", total: 0, solved: 0, unsolved: 0, percentComplete: 0 }),
    ];
    const sorted = sortDashboardTopics(topics, "mostIncomplete");
    expect(sorted.map((t) => t.name)).toEqual(["Stale", "Done", "Empty"]);
  });
});