import type { ApiClient } from "../client";
import { ApiError } from "../errors";
import type { operations } from "../generated/backend";
import { isPlatformSlug } from "../../platforms/catalog";

export type ProgressResponse =
  operations["ProgressController_getSummaries"]["responses"][200]["content"]["application/json"];
export type ProgressCounts = ProgressResponse["overall"];
export type TopicProgress = ProgressResponse["topics"][number];
export type PlatformProgress = ProgressResponse["platforms"][number];
export type ProgressActivityResponse =
  operations["ProgressController_getActivity"]["responses"][200]["content"]["application/json"];
export type ActivityWeekBucket = ProgressActivityResponse["weeks"][number];
export type ActivityStreak = ProgressActivityResponse["streak"];

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

function decodePlatformProgress(value: unknown): PlatformProgress {
  if (!isRecord(value) || typeof value.name !== "string")
    throw new ApiError("contract", "Invalid progress response.");
  const slug = value.slug;
  if (slug !== "other" && (typeof slug !== "string" || !isPlatformSlug(slug)))
    throw new ApiError("contract", "Invalid progress response.");
  const counts = decodeCounts(value);
  return {
    slug: slug as PlatformProgress["slug"],
    name: value.name,
    ...counts,
  };
}

function decodeProgress(value: unknown): ProgressResponse {
  if (
    !isRecord(value) ||
    !Array.isArray(value.topics) ||
    !Array.isArray(value.platforms)
  )
    throw new ApiError("contract", "Invalid progress response.");
  return {
    overall: decodeCounts(value.overall),
    topics: value.topics.map(decodeTopicProgress),
    platforms: value.platforms.map(decodePlatformProgress),
  };
}

function decodeActivityWeek(value: unknown): ActivityWeekBucket {
  if (!isRecord(value) || typeof value.weekStart !== "string")
    throw new ApiError("contract", "Invalid activity response.");
  return {
    weekStart: value.weekStart,
    added: decodeNonNegativeInt(value.added, "added"),
    solved: decodeNonNegativeInt(value.solved, "solved"),
  };
}

function decodeActivityStreak(value: unknown): ActivityStreak {
  if (!isRecord(value))
    throw new ApiError("contract", "Invalid activity response.");
  const lastSolveDate =
    value.lastSolveDate === null
      ? null
      : typeof value.lastSolveDate === "string"
        ? value.lastSolveDate
        : null;
  if (value.lastSolveDate !== null && lastSolveDate === null)
    throw new ApiError("contract", "Invalid activity response.");
  return {
    currentDays: decodeNonNegativeInt(value.currentDays, "currentDays"),
    lastSolveDate,
  };
}

function decodeActivity(value: unknown): ProgressActivityResponse {
  if (!isRecord(value) || !Array.isArray(value.weeks))
    throw new ApiError("contract", "Invalid activity response.");
  if (value.timezone !== "UTC")
    throw new ApiError("contract", "Invalid activity response.");
  return {
    weeks: value.weeks.map(decodeActivityWeek),
    streak: decodeActivityStreak(value.streak),
    timezone: "UTC",
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
    async getActivity(
      weeks = 12,
      signal?: AbortSignal,
    ): Promise<ProgressActivityResponse> {
      return decodeActivity(
        await client.request({
          path: "/progress/activity",
          query: { weeks },
          signal,
          recoverAuth: true,
        }),
      );
    },
  };
}