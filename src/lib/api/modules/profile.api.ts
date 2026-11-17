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

export type ProfileResponse =
  operations["ProfileController_get"]["responses"][200]["content"]["application/json"];

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function entryId(value: string): string {
  if (!UUID.test(value)) throw new ApiError("contract", "Invalid entry id.");
  return value;
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

function decodeProfile(value: unknown): ProfileResponse {
  if (
    !isRecord(value) ||
    typeof value.name !== "string" ||
    typeof value.bio !== "string" ||
    !Array.isArray(value.work) ||
    !Array.isArray(value.education)
  ) {
    throw new ApiError("contract", "Invalid profile response.");
  }
  return {
    name: value.name,
    bio: value.bio,
    ...(typeof value.avatarUrl === "string" ? { avatarUrl: value.avatarUrl } : {}),
    work: value.work.map(decodeWorkEntry),
    education: value.education.map(decodeEducationEntry),
  };
}

export function createProfileApi(client: ApiClient) {
  return {
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
          path: `/users/me/work-entries/${entryId(id)}`,
          method: "PATCH",
          body: input,
          signal,
          recoverAuth: true,
        }),
      );
    },
    async deleteWork(id: string, signal?: AbortSignal): Promise<void> {
      await client.request({
        path: `/users/me/work-entries/${entryId(id)}`,
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
          path: `/users/me/education-entries/${entryId(id)}`,
          method: "PATCH",
          body: input,
          signal,
          recoverAuth: true,
        }),
      );
    },
    async deleteEducation(id: string, signal?: AbortSignal): Promise<void> {
      await client.request({
        path: `/users/me/education-entries/${entryId(id)}`,
        method: "DELETE",
        response: "empty",
        signal,
        recoverAuth: true,
      });
    },
  };
}