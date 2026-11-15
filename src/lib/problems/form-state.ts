import type { ProblemResponse } from "../api/modules/problems.api";
import type { CreateProblemInput, UpdateProblemInput } from "../api/modules/problems.api";

export function topicIdsFromSet(selected: Set<string>): string[] {
  return [...selected];
}

export function toggleTopicId(selected: Set<string>, topicId: string, checked: boolean): Set<string> {
  const next = new Set(selected);
  if (checked) next.add(topicId);
  else next.delete(topicId);
  return next;
}

export function buildCreateInput(values: {
  title: string;
  url: string;
  topicIds: Set<string>;
  platformProblemId: string;
  difficulty: string;
  rating: string;
  notes: string;
  alreadySolved: boolean;
}): CreateProblemInput {
  const input: CreateProblemInput = {
    title: values.title,
    url: values.url,
    topicIds: topicIdsFromSet(values.topicIds),
    status: values.alreadySolved ? "solved" : "unsolved",
  };
  const platform = values.platformProblemId.trim();
  if (platform) input.platformProblemId = platform;
  const difficulty = values.difficulty.trim();
  if (difficulty) input.difficulty = difficulty;
  const ratingRaw = values.rating.trim();
  if (ratingRaw) input.rating = Number.parseInt(ratingRaw, 10);
  const notes = values.notes.trim();
  if (notes) input.notes = notes;
  return input;
}

export function buildUpdateInput(values: {
  title: string;
  url: string;
  topicIds: Set<string>;
  platformProblemId: string;
  difficulty: string;
  rating: string;
  notes: string;
}): UpdateProblemInput {
  const platform = values.platformProblemId.trim();
  const difficulty = values.difficulty.trim();
  const ratingRaw = values.rating.trim();
  const notes = values.notes.trim();
  return {
    title: values.title,
    url: values.url,
    topicIds: topicIdsFromSet(values.topicIds),
    platformProblemId: platform ? platform : null,
    difficulty: difficulty ? difficulty : null,
    rating: ratingRaw ? Number.parseInt(ratingRaw, 10) : null,
    notes: notes ? notes : null,
  };
}

export function hydrateFormFromProblem(problem: ProblemResponse): {
  title: string;
  url: string;
  platformProblemId: string;
  difficulty: string;
  rating: string;
  notes: string;
  topicIds: Set<string>;
} {
  return {
    title: problem.title,
    url: problem.url,
    platformProblemId: problem.platformProblemId ?? "",
    difficulty: problem.difficulty ?? "",
    rating: problem.rating == null ? "" : String(problem.rating),
    notes: problem.notes ?? "",
    topicIds: new Set(problem.topics.map((topic) => topic.id)),
  };
}

const TOPIC_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function topicIdFromSearch(search: string): string | undefined {
  const raw = new URLSearchParams(search).get("topicId");
  if (!raw || !TOPIC_ID.test(raw)) return undefined;
  return raw;
}