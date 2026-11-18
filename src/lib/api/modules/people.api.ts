import type { ApiClient } from "../client";
import { ApiError } from "../errors";
import type { operations } from "../generated/backend";
import { isKnownCatalogSlug } from "../../platforms/platform-slugs";
import {
  decodeProgressActivity,
  type ProgressActivityResponse,
  type ProgressCounts,
} from "./progress.api";

export type PersonHeader =
  operations["PeopleController_getProfile"]["responses"][200]["content"]["application/json"];
export type PeopleTopicBoardRow =
  operations["PeopleController_getTopics"]["responses"][200]["content"]["application/json"]["items"][number];
export type PeopleTopicsResponse =
  operations["PeopleController_getTopics"]["responses"][200]["content"]["application/json"];
export type PublicTopicHeader =
  operations["PeopleController_getPublicTopic"]["responses"][200]["content"]["application/json"];
export type PublicProblemRow =
  operations["PeopleController_listPublicProblems"]["responses"][200]["content"]["application/json"]["items"][number];
export type PublicProblemsListResponse =
  operations["PeopleController_listPublicProblems"]["responses"][200]["content"]["application/json"];
export type ListPublicProblemsQuery = NonNullable<
  operations["PeopleController_listPublicProblems"]["parameters"]["query"]
>;
export type CompareResponse =
  operations["PeopleController_getCompare"]["responses"][200]["content"]["application/json"];
export type CopyTopicResponse =
  operations["PeopleController_copyTopic"]["responses"][201]["content"]["application/json"];

export type PeopleActivityResponse = ProgressActivityResponse;

export type PeopleProfileResult =
  | { ok: true; data: PersonHeader }
  | { ok: false; reason: "unavailable" };

export type PeopleTopicHeaderResult =
  | { ok: true; data: PublicTopicHeader }
  | { ok: false; reason: "unavailable" };

const PROFILE_NOT_FOUND = "PROFILE_NOT_FOUND";
const GOALS = new Set([
  "interview",
  "contests",
  "fundamentals",
  "coaching",
] as const);
const TOPIC_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function decodeNonNegativeInt(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0)
    throw new ApiError("contract", `Invalid people response (${label}).`);
  return value;
}

function isProfileNotFound(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.kind === "http" &&
    error.status === 404 &&
    error.code === PROFILE_NOT_FOUND
  );
}

async function mapUnavailable<T>(
  run: () => Promise<T>,
): Promise<{ ok: true; data: T } | { ok: false; reason: "unavailable" }> {
  try {
    return { ok: true, data: await run() };
  } catch (error) {
    if (isProfileNotFound(error)) return { ok: false, reason: "unavailable" };
    throw error;
  }
}

function decodeCounts(value: unknown): ProgressCounts {
  if (!isRecord(value))
    throw new ApiError("contract", "Invalid people response.");
  const total = decodeNonNegativeInt(value.total, "total");
  const solved = decodeNonNegativeInt(value.solved, "solved");
  const unsolved = decodeNonNegativeInt(value.unsolved, "unsolved");
  if (solved + unsolved !== total)
    throw new ApiError("contract", "Invalid people response.");
  return { total, solved, unsolved };
}

function decodePlatformRow(
  value: unknown,
): PersonHeader["platforms"][number] {
  if (!isRecord(value) || typeof value.name !== "string")
    throw new ApiError("contract", "Invalid people response.");
  const slug = value.slug;
  if (slug !== "other" && (typeof slug !== "string" || !isKnownCatalogSlug(slug)))
    throw new ApiError("contract", "Invalid people response.");
  return {
    slug: slug as PersonHeader["platforms"][number]["slug"],
    name: value.name,
    ...decodeCounts(value),
  };
}

export function decodePersonHeader(value: unknown): PersonHeader {
  if (
    !isRecord(value) ||
    typeof value.handle !== "string" ||
    typeof value.name !== "string" ||
    typeof value.bio !== "string" ||
    typeof value.practicingSince !== "string" ||
    !Array.isArray(value.platforms)
  )
    throw new ApiError("contract", "Invalid people response.");
  const goal = value.practiceGoal;
  if (goal !== null && (typeof goal !== "string" || !GOALS.has(goal as never)))
    throw new ApiError("contract", "Invalid people response.");
  if (
    !isRecord(value.streak) ||
    (value.streak.lastSolveDate !== null &&
      typeof value.streak.lastSolveDate !== "string")
  )
    throw new ApiError("contract", "Invalid people response.");
  if (value.avatarUrl !== undefined && typeof value.avatarUrl !== "string")
    throw new ApiError("contract", "Invalid people response.");
  if (
    value.viewerFollows !== undefined &&
    typeof value.viewerFollows !== "boolean"
  )
    throw new ApiError("contract", "Invalid people response.");
  return {
    handle: value.handle,
    name: value.name,
    bio: value.bio,
    ...(typeof value.avatarUrl === "string" ? { avatarUrl: value.avatarUrl } : {}),
    practiceGoal: goal as PersonHeader["practiceGoal"],
    overall: decodeCounts(value.overall),
    streak: {
      currentDays: decodeNonNegativeInt(
        value.streak.currentDays,
        "currentDays",
      ),
      lastSolveDate: value.streak.lastSolveDate as string | null,
    },
    platforms: value.platforms.map(decodePlatformRow),
    practicingSince: value.practicingSince,
    ...(typeof value.viewerFollows === "boolean"
      ? { viewerFollows: value.viewerFollows }
      : {}),
  };
}

function decodeTopicBoardRow(value: unknown): PeopleTopicBoardRow {
  if (!isRecord(value) || typeof value.name !== "string")
    throw new ApiError("contract", "Invalid people response.");
  if (typeof value.isPublic !== "boolean")
    throw new ApiError("contract", "Invalid people response.");
  const total = decodeNonNegativeInt(value.total, "total");
  const solved = decodeNonNegativeInt(value.solved, "solved");
  const unsolved = decodeNonNegativeInt(value.unsolved, "unsolved");
  const percentComplete = decodeNonNegativeInt(
    value.percentComplete,
    "percentComplete",
  );
  if (percentComplete > 100 || solved + unsolved !== total)
    throw new ApiError("contract", "Invalid people response.");
  const row: PeopleTopicBoardRow = {
    name: value.name,
    total,
    solved,
    unsolved,
    percentComplete,
    isPublic: value.isPublic,
  };
  if (value.id !== undefined) {
    if (typeof value.id !== "string" || !TOPIC_ID.test(value.id))
      throw new ApiError("contract", "Invalid people response.");
    row.id = value.id;
  }
  return row;
}

export function decodePeopleTopics(value: unknown): PeopleTopicsResponse {
  if (!isRecord(value) || !Array.isArray(value.items))
    throw new ApiError("contract", "Invalid people response.");
  return { items: value.items.map(decodeTopicBoardRow) };
}

export function decodePublicTopicHeader(value: unknown): PublicTopicHeader {
  if (
    !isRecord(value) ||
    typeof value.name !== "string" ||
    typeof value.description !== "string" ||
    !Array.isArray(value.difficultyHistogram)
  )
    throw new ApiError("contract", "Invalid people response.");
  if (
    value.difficultyHistogram.length !== 6 ||
    !value.difficultyHistogram.every(
      (n) => typeof n === "number" && Number.isInteger(n) && n >= 0,
    )
  )
    throw new ApiError("contract", "Invalid people response.");
  const owner = decodeCounts(value.ownerCompletion);
  const percentComplete = decodeNonNegativeInt(
    (value.ownerCompletion as Record<string, unknown>).percentComplete,
    "percentComplete",
  );
  if (percentComplete > 100)
    throw new ApiError("contract", "Invalid people response.");
  const moreLists = Array.isArray(value.moreLists)
    ? value.moreLists.map((row) => {
        if (
          !isRecord(row) ||
          typeof row.topicId !== "string" ||
          typeof row.handle !== "string" ||
          typeof row.name !== "string"
        )
          throw new ApiError("contract", "Invalid people response.");
        return {
          topicId: row.topicId,
          handle: row.handle,
          name: row.name,
          total: decodeNonNegativeInt(row.total, "total"),
          solved: decodeNonNegativeInt(row.solved, "solved"),
        };
      })
    : [];
  return {
    name: value.name,
    description: value.description,
    ownerCompletion: { ...owner, percentComplete },
    copies30d: decodeNonNegativeInt(value.copies30d, "copies30d"),
    difficultyHistogram: value.difficultyHistogram,
    moreLists,
  };
}

function decodePublicProblemRow(value: unknown): PublicProblemRow {
  if (
    !isRecord(value) ||
    typeof value.title !== "string" ||
    typeof value.url !== "string" ||
    typeof value.ownerStatus !== "string" ||
    typeof value.inViewerLibrary !== "boolean"
  )
    throw new ApiError("contract", "Invalid people response.");
  if (value.ownerStatus !== "solved" && value.ownerStatus !== "unsolved")
    throw new ApiError("contract", "Invalid people response.");
  const slug = value.platformSlug;
  if (slug !== "other" && (typeof slug !== "string" || !isKnownCatalogSlug(slug)))
    throw new ApiError("contract", "Invalid people response.");
  return {
    title: value.title,
    url: value.url,
    platformSlug: slug as PublicProblemRow["platformSlug"],
    platformProblemId:
      value.platformProblemId === null
        ? null
        : typeof value.platformProblemId === "string"
          ? value.platformProblemId
          : (() => {
              throw new ApiError("contract", "Invalid people response.");
            })(),
    difficulty:
      value.difficulty === null
        ? null
        : typeof value.difficulty === "string"
          ? value.difficulty
          : (() => {
              throw new ApiError("contract", "Invalid people response.");
            })(),
    rating:
      value.rating === null
        ? null
        : typeof value.rating === "number" && Number.isInteger(value.rating)
          ? value.rating
          : (() => {
              throw new ApiError("contract", "Invalid people response.");
            })(),
    ownerStatus: value.ownerStatus,
    inViewerLibrary: value.inViewerLibrary,
  };
}

export function decodePublicProblemsList(
  value: unknown,
): PublicProblemsListResponse {
  if (!isRecord(value) || !Array.isArray(value.items) || !isRecord(value.meta))
    throw new ApiError("contract", "Invalid people response.");
  const page = decodeNonNegativeInt(value.meta.page, "page");
  const pageSize = decodeNonNegativeInt(value.meta.pageSize, "pageSize");
  const total = decodeNonNegativeInt(value.meta.total, "total");
  if (page < 1 || pageSize < 1)
    throw new ApiError("contract", "Invalid people response.");
  return {
    items: value.items.map(decodePublicProblemRow),
    meta: { page, pageSize, total },
  };
}

function peoplePath(handle: string, suffix = ""): string {
  const trimmed = handle.trim();
  return `/people/${encodeURIComponent(trimmed)}${suffix}`;
}

export function createPeopleApi(client: ApiClient) {
  return {
    getProfile(
      handle: string,
      signal?: AbortSignal,
    ): Promise<PeopleProfileResult> {
      return mapUnavailable(async () =>
        decodePersonHeader(
          await client.request({
            path: peoplePath(handle),
            signal,
            recoverAuth: true,
          }),
        ),
      );
    },

    async getActivity(
      handle: string,
      weeks = 12,
      signal?: AbortSignal,
    ): Promise<PeopleActivityResponse | "unavailable"> {
      try {
        return decodeProgressActivity(
          await client.request({
            path: peoplePath(handle, "/activity"),
            query: { weeks },
            signal,
            recoverAuth: true,
          }),
        );
      } catch (error) {
        if (isProfileNotFound(error)) return "unavailable";
        throw error;
      }
    },

    async getTopics(
      handle: string,
      signal?: AbortSignal,
    ): Promise<PeopleTopicsResponse | "unavailable"> {
      try {
        return decodePeopleTopics(
          await client.request({
            path: peoplePath(handle, "/topics"),
            signal,
            recoverAuth: true,
          }),
        );
      } catch (error) {
        if (isProfileNotFound(error)) return "unavailable";
        throw error;
      }
    },

    getPublicTopic(
      handle: string,
      topicId: string,
      signal?: AbortSignal,
    ): Promise<PeopleTopicHeaderResult> {
      return mapUnavailable(async () =>
        decodePublicTopicHeader(
          await client.request({
            path: peoplePath(handle, `/topics/${encodeURIComponent(topicId)}`),
            signal,
            recoverAuth: true,
          }),
        ),
      );
    },

    async listPublicProblems(
      handle: string,
      topicId: string,
      query: ListPublicProblemsQuery,
      signal?: AbortSignal,
    ): Promise<PublicProblemsListResponse | "unavailable"> {
      try {
        return decodePublicProblemsList(
          await client.request({
            path: peoplePath(
              handle,
              `/topics/${encodeURIComponent(topicId)}/problems`,
            ),
            query,
            signal,
            recoverAuth: true,
          }),
        );
      } catch (error) {
        if (isProfileNotFound(error)) return "unavailable";
        throw error;
      }
    },

    async getCompare(
      handle: string,
      weeks = 12,
      signal?: AbortSignal,
    ): Promise<CompareResponse | "unavailable"> {
      try {
        return (await client.request({
          path: peoplePath(handle, "/compare"),
          query: { weeks },
          signal,
          recoverAuth: true,
        })) as CompareResponse;
      } catch (error) {
        if (isProfileNotFound(error)) return "unavailable";
        throw error;
      }
    },

    async follow(handle: string, signal?: AbortSignal): Promise<void> {
      await client.request({
        path: peoplePath(handle, "/follow"),
        method: "PUT",
        response: "empty",
        signal,
        recoverAuth: true,
      });
    },

    async unfollow(handle: string, signal?: AbortSignal): Promise<void> {
      await client.request({
        path: peoplePath(handle, "/follow"),
        method: "DELETE",
        response: "empty",
        signal,
        recoverAuth: true,
      });
    },

    async block(handle: string, signal?: AbortSignal): Promise<void> {
      await client.request({
        path: peoplePath(handle, "/block"),
        method: "PUT",
        response: "empty",
        signal,
        recoverAuth: true,
      });
    },

    async unblock(handle: string, signal?: AbortSignal): Promise<void> {
      await client.request({
        path: peoplePath(handle, "/block"),
        method: "DELETE",
        response: "empty",
        signal,
        recoverAuth: true,
      });
    },

    async copyTopic(
      handle: string,
      topicId: string,
      signal?: AbortSignal,
    ): Promise<CopyTopicResponse | "unavailable"> {
      try {
        return (await client.request({
          path: peoplePath(
            handle,
            `/topics/${encodeURIComponent(topicId)}/copy`,
          ),
          method: "POST",
          signal,
          recoverAuth: true,
        })) as CopyTopicResponse;
      } catch (error) {
        if (isProfileNotFound(error)) return "unavailable";
        throw error;
      }
    },
  };
}