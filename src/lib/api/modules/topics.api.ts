import type { ApiClient } from "../client";
import { ApiError } from "../errors";
import type { operations } from "../generated/backend";

type JsonInput<
  T extends { requestBody: { content: { "application/json": unknown } } },
> = T["requestBody"]["content"]["application/json"];

const TOPIC_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type CreateTopicInput = JsonInput<operations["TopicsController_create"]>;
export type PatchTopicInput = JsonInput<operations["TopicsController_patch"]>;
export type RenameTopicInput = Pick<PatchTopicInput, "name"> & { name: string };
export type ListTopicsQuery = NonNullable<
  operations["TopicsController_list"]["parameters"]["query"]
>;
export type TopicResponse =
  operations["TopicsController_create"]["responses"][201]["content"]["application/json"];
export type TopicListResponse =
  operations["TopicsController_list"]["responses"][200]["content"]["application/json"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function topicId(value: string): string {
  if (!TOPIC_ID.test(value))
    throw new ApiError("contract", "Invalid topic id.");
  return value;
}

function decodeTopic(value: unknown): TopicResponse {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    typeof value.isPublic !== "boolean" ||
    typeof value.description !== "string" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string"
  )
    throw new ApiError("contract", "Invalid topic response.");
  return {
    id: value.id,
    name: value.name,
    isPublic: value.isPublic,
    description: value.description,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

function decodeTopicList(value: unknown): TopicListResponse {
  if (!isRecord(value) || !Array.isArray(value.items) || !isRecord(value.meta))
    throw new ApiError("contract", "Invalid topic list response.");
  const { meta } = value;
  if (
    typeof meta.page !== "number" ||
    typeof meta.pageSize !== "number" ||
    typeof meta.total !== "number"
  )
    throw new ApiError("contract", "Invalid topic list response.");
  return {
    items: value.items.map(decodeTopic),
    meta: {
      page: meta.page,
      pageSize: meta.pageSize,
      total: meta.total,
    },
  };
}

export function createTopicsApi(client: ApiClient) {
  return {
    async list(
      query: ListTopicsQuery = {},
      signal?: AbortSignal,
    ): Promise<TopicListResponse> {
      return decodeTopicList(
        await client.request({
          path: "/topics",
          query,
          signal,
          recoverAuth: true,
        }),
      );
    },
    async create(
      input: CreateTopicInput,
      signal?: AbortSignal,
    ): Promise<TopicResponse> {
      return decodeTopic(
        await client.request({
          path: "/topics",
          method: "POST",
          body: input,
          signal,
          recoverAuth: true,
        }),
      );
    },
    async patch(
      topicIdValue: string,
      input: PatchTopicInput,
      signal?: AbortSignal,
    ): Promise<TopicResponse> {
      const id = topicId(topicIdValue);
      return decodeTopic(
        await client.request({
          path: `/topics/${id}`,
          method: "PATCH",
          body: input,
          signal,
          recoverAuth: true,
        }),
      );
    },
    async rename(
      topicIdValue: string,
      input: RenameTopicInput,
      signal?: AbortSignal,
    ): Promise<TopicResponse> {
      return this.patch(topicIdValue, { name: input.name }, signal);
    },
    async delete(topicIdValue: string, signal?: AbortSignal): Promise<void> {
      const id = topicId(topicIdValue);
      await client.request({
        path: `/topics/${id}`,
        method: "DELETE",
        response: "empty",
        signal,
        recoverAuth: true,
      });
    },
  };
}