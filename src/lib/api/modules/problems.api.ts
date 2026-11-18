import { STORED_PLATFORM_SLUGS } from "../../platforms/platform-slugs";
import type { ApiClient } from "../client";
import { ApiError } from "../errors";
import type { operations } from "../generated/backend";

type JsonInput<
  T extends { requestBody: { content: { "application/json": unknown } } },
> = T["requestBody"]["content"]["application/json"];

const PROBLEM_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type CreateProblemInput = JsonInput<operations["ProblemsController_create"]>;
export type UpdateProblemInput = JsonInput<operations["ProblemsController_update"]>;
export type ListProblemsQuery = NonNullable<
  operations["ProblemsController_list"]["parameters"]["query"]
>;
export type ProblemResponse =
  operations["ProblemsController_create"]["responses"][201]["content"]["application/json"];
export type ProblemListResponse =
  operations["ProblemsController_list"]["responses"][200]["content"]["application/json"];
export type ProblemTopicSummary = ProblemResponse["topics"][number];
export type ProblemStatus = ProblemResponse["status"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function problemId(value: string): string {
  if (!PROBLEM_ID.test(value))
    throw new ApiError("contract", "Invalid problem id.");
  return value;
}

function decodeNullableString(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== "string") throw new ApiError("contract", "Invalid problem response.");
  return value;
}

function decodePlatformSlug(value: unknown): ProblemResponse["platformSlug"] {
  if (typeof value !== "string" || !STORED_PLATFORM_SLUGS.has(value))
    throw new ApiError("contract", "Invalid problem response.");
  return value as ProblemResponse["platformSlug"];
}

function decodeNullableInt(value: unknown): number | null {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isInteger(value))
    throw new ApiError("contract", "Invalid problem response.");
  return value;
}

function decodeProblemTopicSummary(value: unknown): ProblemTopicSummary {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.name !== "string"
  )
    throw new ApiError("contract", "Invalid problem response.");
  return { id: value.id, name: value.name };
}

function decodeProblem(value: unknown): ProblemResponse {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.url !== "string" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string" ||
    !Array.isArray(value.topics)
  )
    throw new ApiError("contract", "Invalid problem response.");
  if (value.status !== "unsolved" && value.status !== "solved")
    throw new ApiError("contract", "Invalid problem response.");
  const solvedAt =
    value.solvedAt === null
      ? null
      : typeof value.solvedAt === "string"
        ? value.solvedAt
        : (() => {
            throw new ApiError("contract", "Invalid problem response.");
          })();
  return {
    id: value.id,
    title: value.title,
    url: value.url,
    platformSlug: decodePlatformSlug(value.platformSlug),
    platformProblemId: decodeNullableString(value.platformProblemId),
    difficulty: decodeNullableString(value.difficulty),
    rating: decodeNullableInt(value.rating),
    notes: decodeNullableString(value.notes),
    status: value.status,
    solvedAt,
    topics: value.topics.map(decodeProblemTopicSummary),
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

function decodeProblemList(value: unknown): ProblemListResponse {
  if (!isRecord(value) || !Array.isArray(value.items) || !isRecord(value.meta))
    throw new ApiError("contract", "Invalid problem list response.");
  const { meta } = value;
  if (
    typeof meta.page !== "number" ||
    typeof meta.pageSize !== "number" ||
    typeof meta.total !== "number"
  )
    throw new ApiError("contract", "Invalid problem list response.");
  return {
    items: value.items.map(decodeProblem),
    meta: {
      page: meta.page,
      pageSize: meta.pageSize,
      total: meta.total,
    },
  };
}

export function createProblemsApi(client: ApiClient) {
  return {
    async list(
      query: ListProblemsQuery = {},
      signal?: AbortSignal,
    ): Promise<ProblemListResponse> {
      return decodeProblemList(
        await client.request({
          path: "/problems",
          query,
          signal,
          recoverAuth: true,
        }),
      );
    },
    async create(
      input: CreateProblemInput,
      signal?: AbortSignal,
    ): Promise<ProblemResponse> {
      return decodeProblem(
        await client.request({
          path: "/problems",
          method: "POST",
          body: input,
          signal,
          recoverAuth: true,
        }),
      );
    },
    async getOne(
      problemIdValue: string,
      signal?: AbortSignal,
    ): Promise<ProblemResponse> {
      const id = problemId(problemIdValue);
      return decodeProblem(
        await client.request({
          path: `/problems/${id}`,
          signal,
          recoverAuth: true,
        }),
      );
    },
    async update(
      problemIdValue: string,
      input: UpdateProblemInput,
      signal?: AbortSignal,
    ): Promise<ProblemResponse> {
      const id = problemId(problemIdValue);
      return decodeProblem(
        await client.request({
          path: `/problems/${id}`,
          method: "PATCH",
          body: input,
          signal,
          recoverAuth: true,
        }),
      );
    },
    async setStatus(
      problemIdValue: string,
      status: ProblemStatus,
      signal?: AbortSignal,
    ): Promise<ProblemResponse> {
      const id = problemId(problemIdValue);
      return decodeProblem(
        await client.request({
          path: `/problems/${id}`,
          method: "PATCH",
          body: { status },
          signal,
          recoverAuth: true,
        }),
      );
    },
    async delete(problemIdValue: string, signal?: AbortSignal): Promise<void> {
      const id = problemId(problemIdValue);
      await client.request({
        path: `/problems/${id}`,
        method: "DELETE",
        response: "empty",
        signal,
        recoverAuth: true,
      });
    },
  };
}