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