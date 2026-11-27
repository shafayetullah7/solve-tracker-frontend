import type { ApiClient } from "../client";
import { ApiError } from "../errors";
import type { operations } from "../generated/backend";
import type { EducationEntry, WorkEntry } from "../../profile/profile-view.types";

type JsonInput<
  T extends { requestBody: { content: { "application/json": unknown } } },
> = T["requestBody"]["content"]["application/json"];

export type PatchProfileInput = JsonInput<operations["ProfileController_patch"]>;
export type CreateWorkInput = JsonInput<operations["ProfileController_createWork"]>;
export type UpdateWorkInput = JsonInput<operations["ProfileController_updateWork"]>;
export type CreateEducationInput =
  JsonInput<operations["ProfileController_createEducation"]>;
export type UpdateEducationInput =
  JsonInput<operations["ProfileController_updateEducation"]>;

export type DeleteAccountInput = JsonInput<operations["ProfileController_eraseAccount"]>;

export type ProfileResponse =
  operations["ProfileController_get"]["responses"][200]["content"]["application/json"];

export type ShareStatsResponse =
  operations["ProfileController_shareStats"]["responses"][200]["content"]["application/json"];

export type FollowersCountResponse =
  operations["ProfileController_followersCount"]["responses"][200]["content"]["application/json"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function entryPathId(value: string): string {
  const id = value.trim();
  if (!id) throw new ApiError("contract", "This entry is missing an id.");
  return encodeURIComponent(id);
}

function decodeWorkEntry(value: unknown): WorkEntry {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.organization !== "string" ||
    typeof value.role !== "string"
  ) {
    throw new ApiError("contract", "Invalid work entry response.");
  }
  return {
    id: value.id,
    organization: value.organization,
    role: value.role,
    ...(typeof value.period === "string" ? { period: value.period } : {}),
  };
}

function decodeEducationEntry(value: unknown): EducationEntry {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.institution !== "string" ||
    typeof value.program !== "string"
  ) {
    throw new ApiError("contract", "Invalid education entry response.");
  }
  return {
    id: value.id,
    institution: value.institution,
    program: value.program,
    ...(typeof value.endYear === "string" ? { endYear: value.endYear } : {}),
  };
}

const PRACTICE_VISIBILITY = new Set(["private", "summary", "topics"]);
const PRACTICE_GOALS = new Set([
  "interview",
  "contests",
  "fundamentals",
  "coaching",
]);

function decodeProfile(value: unknown): ProfileResponse {
  if (
    !isRecord(value) ||
    typeof value.name !== "string" ||
    typeof value.bio !== "string" ||
    typeof value.handle !== "string" ||
    value.handle.length === 0 ||
    typeof value.practiceVisibility !== "string" ||
    !PRACTICE_VISIBILITY.has(value.practiceVisibility) ||
    !("practiceGoal" in value) ||
    (value.practiceGoal !== null &&
      (typeof value.practiceGoal !== "string" ||
        !PRACTICE_GOALS.has(value.practiceGoal))) ||
    !Array.isArray(value.work) ||
    !Array.isArray(value.education) ||
    typeof value.publicWeb !== "boolean"
  ) {
    const hint =
      isRecord(value) &&
      !("practiceVisibility" in value) &&
      !("publicWeb" in value)
        ? " Restart or rebuild the API backend (e.g. docker compose build backend)."
        : "";
    throw new ApiError("contract", `Invalid profile response.${hint}`);
  }
  return {
    name: value.name,
    bio: value.bio,
    handle: value.handle,
    practiceVisibility: value.practiceVisibility as ProfileResponse["practiceVisibility"],
    practiceGoal: value.practiceGoal as ProfileResponse["practiceGoal"],
    publicWeb: value.publicWeb,
    ...(typeof value.avatarUrl === "string" ? { avatarUrl: value.avatarUrl } : {}),
    work: value.work.map(decodeWorkEntry),
    education: value.education.map(decodeEducationEntry),
  };
}

export function createProfileApi(client: ApiClient) {
  return {
    async getShareStats(days = 30, signal?: AbortSignal): Promise<ShareStatsResponse> {
      return (await client.request({
        path: "/users/me/share-stats",
        query: { days },
        signal,
        recoverAuth: true,
      })) as ShareStatsResponse;
    },
    async getFollowersCount(signal?: AbortSignal): Promise<FollowersCountResponse> {
      return (await client.request({
        path: "/users/me/followers/count",
        signal,
        recoverAuth: true,
      })) as FollowersCountResponse;
    },
    async getProfile(signal?: AbortSignal): Promise<ProfileResponse> {
      return decodeProfile(
        await client.request({
          path: "/users/me/profile",
          signal,
          recoverAuth: true,
        }),
      );
    },
    async patchProfile(
      input: PatchProfileInput,
      signal?: AbortSignal,
    ): Promise<ProfileResponse> {
      return decodeProfile(
        await client.request({
          path: "/users/me/profile",
          method: "PATCH",
          body: input,
          signal,
          recoverAuth: true,
        }),
      );
    },
    async createWork(input: CreateWorkInput, signal?: AbortSignal): Promise<WorkEntry> {
      return decodeWorkEntry(
        await client.request({
          path: "/users/me/work-entries",
          method: "POST",
          body: input,
          signal,
          recoverAuth: true,
        }),
      );
    },
    async updateWork(
      id: string,
      input: UpdateWorkInput,
      signal?: AbortSignal,
    ): Promise<WorkEntry> {
      return decodeWorkEntry(
        await client.request({
          path: `/users/me/work-entries/${entryPathId(id)}`,
          method: "PATCH",
          body: input,
          signal,
          recoverAuth: true,
        }),
      );
    },
    async deleteWork(id: string, signal?: AbortSignal): Promise<void> {
      await client.request({
        path: `/users/me/work-entries/${entryPathId(id)}`,
        method: "DELETE",
        response: "empty",
        signal,
        recoverAuth: true,
      });
    },
    async createEducation(
      input: CreateEducationInput,
      signal?: AbortSignal,
    ): Promise<EducationEntry> {
      return decodeEducationEntry(
        await client.request({
          path: "/users/me/education-entries",
          method: "POST",
          body: input,
          signal,
          recoverAuth: true,
        }),
      );
    },
    async updateEducation(
      id: string,
      input: UpdateEducationInput,
      signal?: AbortSignal,
    ): Promise<EducationEntry> {
      return decodeEducationEntry(
        await client.request({
          path: `/users/me/education-entries/${entryPathId(id)}`,
          method: "PATCH",
          body: input,
          signal,
          recoverAuth: true,
        }),
      );
    },
    async deleteEducation(id: string, signal?: AbortSignal): Promise<void> {
      await client.request({
        path: `/users/me/education-entries/${entryPathId(id)}`,
        method: "DELETE",
        response: "empty",
        signal,
        recoverAuth: true,
      });
    },
    async deleteAccount(
      input: DeleteAccountInput,
      signal?: AbortSignal,
    ): Promise<void> {
      await client.request({
        path: "/users/me",
        method: "DELETE",
        body: input,
        response: "empty",
        signal,
        recoverAuth: false,
      });
    },
  };
}