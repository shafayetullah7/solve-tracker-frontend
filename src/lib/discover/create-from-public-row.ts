import type { ApiClient } from "../api/client";
import { ApiError } from "../api/errors";
import {
  createProblemsApi,
  type CreateProblemInput,
} from "../api/modules/problems.api";
import type { PublicProblemRow } from "../api/modules/people.api";
import type { DiscoverHubProblemsResponse } from "../api/modules/discover.api";

export function createProblemInputFromPublicRow(
  row: Pick<
    PublicProblemRow,
  "title" | "url" | "platformProblemId" | "difficulty" | "rating"
  >,
  topicIds?: string[],
): CreateProblemInput {
  return {
    title: row.title,
    url: row.url,
    ...(row.platformProblemId ? { platformProblemId: row.platformProblemId } : {}),
    ...(row.difficulty ? { difficulty: row.difficulty } : {}),
    ...(row.rating != null ? { rating: row.rating } : {}),
    ...(topicIds?.length ? { topicIds } : {}),
    status: "unsolved",
  };
}

export function createProblemInputFromHubRow(
  row: DiscoverHubProblemsResponse["items"][number],
  topicIds?: string[],
): CreateProblemInput {
  return {
    title: row.title,
    url: row.normalizedUrl.startsWith("http") ? row.normalizedUrl : row.normalizedUrl,
    ...(row.difficulty ? { difficulty: row.difficulty } : {}),
    ...(topicIds?.length ? { topicIds } : {}),
    status: "unsolved",
  };
}

export function isProblemDuplicateError(error: unknown): boolean {
  return error instanceof ApiError && error.kind === "http" && error.status === 409;
}

export async function addProblemFromRow(
  client: ApiClient,
  input: CreateProblemInput,
  signal?: AbortSignal,
): Promise<"added" | "already"> {
  const api = createProblemsApi(client);
  try {
    await api.create(input, signal);
    return "added";
  } catch (error) {
    if (isProblemDuplicateError(error)) return "already";
    throw error;
  }
}