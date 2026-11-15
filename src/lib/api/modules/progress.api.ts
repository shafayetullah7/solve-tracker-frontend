import type { ApiClient } from "../client";
import { ApiError } from "../errors";
import type { operations } from "../generated/backend";

export type ProgressResponse =
  operations["ProgressController_getSummaries"]["responses"][200]["content"]["application/json"];
export type ProgressCounts = ProgressResponse["overall"];
export type TopicProgress = ProgressResponse["topics"][number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function decodeNonNegativeInt(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0)
    throw new ApiError("contract", `Invalid progress response (${label}).`);
  return value;
}

function decodeCounts(value: unknown): ProgressCounts {
  if (!isRecord(value))
    throw new ApiError("contract", "Invalid progress response.");
  const total = decodeNonNegativeInt(value.total, "total");
  const solved = decodeNonNegativeInt(value.solved, "solved");
  const unsolved = decodeNonNegativeInt(value.unsolved, "unsolved");
  if (solved + unsolved !== total)
    throw new ApiError("contract", "Invalid progress response.");
  return { total, solved, unsolved };
}

function decodeTopicProgress(value: unknown): TopicProgress {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.name !== "string"
  )
    throw new ApiError("contract", "Invalid progress response.");
  const total = decodeNonNegativeInt(value.total, "topic total");
  const solved = decodeNonNegativeInt(value.solved, "topic solved");
  const unsolved = decodeNonNegativeInt(value.unsolved, "topic unsolved");
  if (solved + unsolved !== total)
    throw new ApiError("contract", "Invalid progress response.");
  const percentComplete = decodeNonNegativeInt(
    value.percentComplete,
    "percentComplete",
  );
  if (percentComplete > 100)
    throw new ApiError("contract", "Invalid progress response.");
  return {
    id: value.id,
    name: value.name,
    total,
    solved,
    unsolved,
    percentComplete,
  };
}

function decodeProgress(value: unknown): ProgressResponse {
  if (!isRecord(value) || !Array.isArray(value.topics))
    throw new ApiError("contract", "Invalid progress response.");
  return {
    overall: decodeCounts(value.overall),
    topics: value.topics.map(decodeTopicProgress),
  };
}

export function createProgressApi(client: ApiClient) {
  return {
    async getSummaries(signal?: AbortSignal): Promise<ProgressResponse> {
      return decodeProgress(
        await client.request({
          path: "/progress",
          signal,
          recoverAuth: true,
        }),
      );
    },
  };
}