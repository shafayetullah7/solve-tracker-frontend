import type {
  ProgressCounts,
  TopicProgress,
} from "../api/modules/progress.api";

export type OverallProgressParts = {
  total: number;
  solved: number;
  unsolved: number;
};

export function formatOverallProgress(counts: ProgressCounts): OverallProgressParts {
  return {
    total: counts.total,
    solved: counts.solved,
    unsolved: counts.unsolved,
  };
}

export function overallPercentComplete(counts: ProgressCounts): number {
  if (counts.total === 0) return 0;
  return Math.round((counts.solved / counts.total) * 100);
}

export function formatTopicProgress(topic: TopicProgress): string {
  return `${topic.solved} / ${topic.total} solved (${topic.percentComplete}%)`;
}

export function topicProgressById(
  topics: TopicProgress[],
): Map<string, TopicProgress> {
  return new Map(topics.map((row) => [row.id, row]));
}

const ZERO_TOPIC_PROGRESS = {
  total: 0,
  solved: 0,
  unsolved: 0,
  percentComplete: 0,
} as const;

/** Row progress for a catalog topic when summaries omit or lag an id. */
export function topicProgressForItem(
  topic: Pick<TopicProgress, "id" | "name">,
  byId: Map<string, TopicProgress>,
): TopicProgress {
  return byId.get(topic.id) ?? { ...ZERO_TOPIC_PROGRESS, id: topic.id, name: topic.name };
}

export function formatTopicProgressDetail(topic: TopicProgress): string {
  if (topic.total === 0) return "No problems linked yet";
  return formatTopicProgress(topic);
}

export function summarizeTopicsLibrary(rows: TopicProgress[]): string {
  const topicCount = rows.length;
  const problemTotal = rows.reduce((sum, row) => sum + row.total, 0);
  const topicLabel = topicCount === 1 ? "topic" : "topics";
  const problemLabel = problemTotal === 1 ? "problem" : "problems";
  return `${topicCount} ${topicLabel} · ${problemTotal} ${problemLabel}`;
}