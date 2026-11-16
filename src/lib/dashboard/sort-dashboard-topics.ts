import type { TopicProgress } from "../api/modules/progress.api";

export type DashboardTopicSortMode = "default" | "mostIncomplete" | "mostRemaining";

/** Topics with total === 0 sort after those with problems in highlight modes. */
export function sortDashboardTopics(
  topics: TopicProgress[],
  mode: DashboardTopicSortMode,
): TopicProgress[] {
  if (mode === "default") return topics;

  const withProblems: TopicProgress[] = [];
  const empty: TopicProgress[] = [];
  for (const row of topics) {
    if (row.total > 0) withProblems.push(row);
    else empty.push(row);
  }

  const byName = (a: TopicProgress, b: TopicProgress) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

  if (mode === "mostIncomplete") {
    withProblems.sort((a, b) => {
      const byPercent = a.percentComplete - b.percentComplete;
      return byPercent !== 0 ? byPercent : byName(a, b);
    });
  } else {
    withProblems.sort((a, b) => {
      const byUnsolved = b.unsolved - a.unsolved;
      return byUnsolved !== 0 ? byUnsolved : byName(a, b);
    });
  }

  return [...withProblems, ...empty];
}