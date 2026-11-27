import type { ApiClient } from "../client";
import { ApiError } from "../errors";
import type { operations } from "../generated/backend";

type JsonInput<
  T extends { requestBody: { content: { "application/json": unknown } } },
> = T["requestBody"]["content"]["application/json"];

const GUIDE_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ListGuidesQuery = NonNullable<
  operations["LearningGuidesController_list"]["parameters"]["query"]
>;
export type CreateGuideInput =
  JsonInput<operations["LearningGuidesController_create"]>;
export type CreateNodeInput =
  JsonInput<operations["LearningGuidesController_createNode"]>;
export type PatchNodeInput =
  JsonInput<operations["LearningGuidesController_patchNode"]>;
export type MoveNodeInput =
  JsonInput<operations["LearningGuidesController_moveNode"]>;
export type ResumeInput = JsonInput<operations["LearningGuidesController_resume"]>;
export type RecoveryQuery = NonNullable<
  operations["LearningGuidesController_recoverable"]["parameters"]["query"]
>;
export type RecoveryResponse =
  operations["LearningGuidesController_recoverable"]["responses"][200]["content"]["application/json"];

export type GuideResponse =
  operations["LearningGuidesController_get"]["responses"][200]["content"]["application/json"];
export type GuideListResponse =
  operations["LearningGuidesController_list"]["responses"][200]["content"]["application/json"];
export type TreeResponse =
  operations["LearningGuidesController_tree"]["responses"][200]["content"]["application/json"];
export type NodeResponse = TreeResponse["nodes"][number];
export type EnrollmentResponse =
  operations["LearningGuidesController_enrollment"]["responses"][200]["content"]["application/json"];
export type MutationReceipt =
  operations["LearningGuidesController_create"]["responses"][201]["content"]["application/json"];
export type NodeContentResponse =
  operations["LearningGuidesController_nodeContent"]["responses"][200]["content"]["application/json"];
export type ReplaceNodeContentInput =
  JsonInput<operations["LearningGuidesController_replaceNodeContent"]>;
export type NodeCompletionInput =
  JsonInput<operations["LearningGuidesController_nodeCompletion"]>;
export type ContentBlock = NodeContentResponse["blocks"][number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function guideId(value: string): string {
  if (!GUIDE_ID.test(value))
    throw new ApiError("contract", "Invalid guide id.");
  return value;
}

function nodeId(value: string): string {
  if (!GUIDE_ID.test(value))
    throw new ApiError("contract", "Invalid node id.");
  return value;
}

function decodeGuide(value: unknown): GuideResponse {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.description !== "string" ||
    typeof value.structureRevision !== "string" ||
    typeof value.metadataRevision !== "string" ||
    (value.archivedAt !== null && typeof value.archivedAt !== "string") ||
    (value.deletedAt !== null && typeof value.deletedAt !== "string") ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string"
  )
    throw new ApiError("contract", "Invalid guide response.");
  return {
    id: value.id,
    title: value.title,
    description: value.description,
    structureRevision: value.structureRevision,
    metadataRevision: value.metadataRevision,
    archivedAt: value.archivedAt,
    deletedAt: value.deletedAt,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

function decodeNode(value: unknown): NodeResponse {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    (value.parentId !== null && typeof value.parentId !== "string") ||
    typeof value.title !== "string" ||
    typeof value.position !== "number" ||
    typeof value.required !== "boolean" ||
    typeof value.completionMode !== "string" ||
    typeof value.contentRevision !== "string" ||
    typeof value.requirementRevision !== "string" ||
    typeof value.completed !== "boolean"
  )
    throw new ApiError("contract", "Invalid node response.");
  return {
    id: value.id,
    parentId: value.parentId,
    title: value.title,
    position: value.position,
    required: value.required,
    completionMode: value.completionMode as NodeResponse["completionMode"],
    contentRevision: value.contentRevision,
    requirementRevision: value.requirementRevision,
    completed: value.completed,
  };
}

function decodeTree(value: unknown): TreeResponse {
  if (
    !isRecord(value) ||
    typeof value.structureRevision !== "string" ||
    !Array.isArray(value.nodes) ||
    !isRecord(value.progress) ||
    typeof value.progress.completedRequired !== "number" ||
    typeof value.progress.totalRequired !== "number" ||
    (value.progress.percent !== null && typeof value.progress.percent !== "number")
  )
    throw new ApiError("contract", "Invalid tree response.");
  return {
    structureRevision: value.structureRevision,
    nodes: value.nodes.map(decodeNode),
    progress: {
      completedRequired: value.progress.completedRequired,
      totalRequired: value.progress.totalRequired,
      percent: value.progress.percent,
    },
  };
}

function decodeGuideList(value: unknown): GuideListResponse {
  if (!isRecord(value) || !Array.isArray(value.items) || !isRecord(value.meta))
    throw new ApiError("contract", "Invalid guide list response.");
  const { meta } = value;
  if (
    typeof meta.page !== "number" ||
    typeof meta.pageSize !== "number" ||
    typeof meta.total !== "number"
  )
    throw new ApiError("contract", "Invalid guide list response.");
  return {
    items: value.items.map(decodeGuide),
    meta: { page: meta.page, pageSize: meta.pageSize, total: meta.total },
  };
}

function decodeEnrollment(value: unknown): EnrollmentResponse {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.guideId !== "string" ||
    (value.resumeNodeId !== null && typeof value.resumeNodeId !== "string") ||
    (value.lastActivityAt !== null && typeof value.lastActivityAt !== "string")
  )
    throw new ApiError("contract", "Invalid enrollment response.");
  return {
    id: value.id,
    guideId: value.guideId,
    resumeNodeId: value.resumeNodeId,
    lastActivityAt: value.lastActivityAt,
  };
}

function decodeRecovery(value: unknown): RecoveryResponse {
  if (
    !isRecord(value) ||
    !Array.isArray(value.items) ||
    typeof value.page !== "number" ||
    typeof value.pageSize !== "number" ||
    typeof value.hasMore !== "boolean"
  )
    throw new ApiError("contract", "Invalid recovery response.");
  return value as RecoveryResponse;
}

function decodeReceipt(value: unknown): MutationReceipt {
  if (
    !isRecord(value) ||
    typeof value.resourceId !== "string" ||
    typeof value.replayed !== "boolean"
  )
    throw new ApiError("contract", "Invalid mutation receipt.");
  return { resourceId: value.resourceId, replayed: value.replayed };
}

export function createLearningGuidesApi(client: ApiClient) {
  return {
    async list(
      query: ListGuidesQuery = {},
      signal?: AbortSignal,
    ): Promise<GuideListResponse> {
      return decodeGuideList(
        await client.request({
          path: "/learning/guides",
          query,
          signal,
          recoverAuth: true,
        }),
      );
    },
    async get(guideIdValue: string, signal?: AbortSignal): Promise<GuideResponse> {
      const id = guideId(guideIdValue);
      return decodeGuide(
        await client.request({
          path: `/learning/guides/${id}`,
          signal,
          recoverAuth: true,
        }),
      );
    },
    async create(
      input: CreateGuideInput,
      signal?: AbortSignal,
    ): Promise<MutationReceipt> {
      return decodeReceipt(
        await client.request({
          path: "/learning/guides",
          method: "POST",
          body: input,
          signal,
          recoverAuth: true,
        }),
      );
    },
    async tree(guideIdValue: string, signal?: AbortSignal): Promise<TreeResponse> {
      const id = guideId(guideIdValue);
      return decodeTree(
        await client.request({
          path: `/learning/guides/${id}/tree`,
          signal,
          recoverAuth: true,
        }),
      );
    },
    async createNode(
      guideIdValue: string,
      input: CreateNodeInput,
      signal?: AbortSignal,
    ): Promise<MutationReceipt> {
      const id = guideId(guideIdValue);
      return decodeReceipt(
        await client.request({
          path: `/learning/guides/${id}/nodes`,
          method: "POST",
          body: input,
          signal,
          recoverAuth: true,
        }),
      );
    },
    async patchNode(
      guideIdValue: string,
      nodeIdValue: string,
      input: PatchNodeInput,
      signal?: AbortSignal,
    ): Promise<MutationReceipt> {
      const g = guideId(guideIdValue);
      const n = nodeId(nodeIdValue);
      return decodeReceipt(
        await client.request({
          path: `/learning/guides/${g}/nodes/${n}`,
          method: "PATCH",
          body: input,
          signal,
          recoverAuth: true,
        }),
      );
    },
    async moveNode(
      guideIdValue: string,
      nodeIdValue: string,
      input: MoveNodeInput,
      signal?: AbortSignal,
    ): Promise<MutationReceipt> {
      const g = guideId(guideIdValue);
      const n = nodeId(nodeIdValue);
      return decodeReceipt(
        await client.request({
          path: `/learning/guides/${g}/nodes/${n}/placement`,
          method: "PATCH",
          body: input,
          signal,
          recoverAuth: true,
        }),
      );
    },
    async deleteNode(
      guideIdValue: string,
      nodeIdValue: string,
      input: { expectedStructureRevision: string; operationId: string },
      signal?: AbortSignal,
    ): Promise<void> {
      const g = guideId(guideIdValue);
      const n = nodeId(nodeIdValue);
      await client.request({
        path: `/learning/guides/${g}/nodes/${n}`,
        method: "DELETE",
        response: "empty",
        headers: {
          "X-Expected-Revision": input.expectedStructureRevision,
          "X-Operation-Id": input.operationId,
        },
        signal,
        recoverAuth: true,
      });
    },
    async copyNode(
      guideIdValue: string,
      nodeIdValue: string,
      input: MoveNodeInput,
      signal?: AbortSignal,
    ): Promise<MutationReceipt> {
      const g = guideId(guideIdValue);
      const n = nodeId(nodeIdValue);
      return decodeReceipt(
        await client.request({
          path: `/learning/guides/${g}/nodes/${n}/copy`,
          method: "POST",
          body: input,
          signal,
          recoverAuth: true,
        }),
      );
    },
    async restoreNode(
      guideIdValue: string,
      nodeIdValue: string,
      input: MoveNodeInput,
      signal?: AbortSignal,
    ): Promise<MutationReceipt> {
      const g = guideId(guideIdValue);
      const n = nodeId(nodeIdValue);
      return decodeReceipt(
        await client.request({
          path: `/learning/guides/${g}/nodes/${n}/restore`,
          method: "POST",
          body: input,
          signal,
          recoverAuth: true,
        }),
      );
    },
    async recoverable(
      guideIdValue: string,
      query: RecoveryQuery = {},
      signal?: AbortSignal,
    ): Promise<RecoveryResponse> {
      const g = guideId(guideIdValue);
      return decodeRecovery(
        await client.request({
          path: `/learning/guides/${g}/recovery`,
          query,
          signal,
          recoverAuth: true,
        }),
      );
    },
    async enrollment(
      guideIdValue: string,
      signal?: AbortSignal,
    ): Promise<EnrollmentResponse> {
      const id = guideId(guideIdValue);
      return decodeEnrollment(
        await client.request({
          path: `/learning/guides/${id}/enrollment`,
          signal,
          recoverAuth: true,
        }),
      );
    },
    async resume(
      guideIdValue: string,
      input: ResumeInput,
      signal?: AbortSignal,
    ): Promise<MutationReceipt> {
      const id = guideId(guideIdValue);
      return decodeReceipt(
        await client.request({
          path: `/learning/guides/${id}/enrollment/resume`,
          method: "PATCH",
          body: input,
          signal,
          recoverAuth: true,
        }),
      );
    },
    async nodeContent(
      guideIdValue: string,
      nodeIdValue: string,
      signal?: AbortSignal,
    ): Promise<NodeContentResponse> {
      const g = guideId(guideIdValue);
      const n = nodeId(nodeIdValue);
      const value = await client.request({
        path: `/learning/guides/${g}/nodes/${n}/content`,
        signal,
        recoverAuth: true,
      });
      if (
        !isRecord(value) ||
        typeof value.contentRevision !== "string" ||
        !Array.isArray(value.blocks)
      )
        throw new ApiError("contract", "Invalid node content response.");
      return value as NodeContentResponse;
    },
    async replaceNodeContent(
      guideIdValue: string,
      nodeIdValue: string,
      input: ReplaceNodeContentInput,
      signal?: AbortSignal,
    ): Promise<MutationReceipt> {
      const g = guideId(guideIdValue);
      const n = nodeId(nodeIdValue);
      return decodeReceipt(
        await client.request({
          path: `/learning/guides/${g}/nodes/${n}/content`,
          method: "PUT",
          body: input,
          signal,
          recoverAuth: true,
        }),
      );
    },
    async setNodeCompletion(
      guideIdValue: string,
      nodeIdValue: string,
      input: NodeCompletionInput,
      signal?: AbortSignal,
    ): Promise<MutationReceipt> {
      const g = guideId(guideIdValue);
      const n = nodeId(nodeIdValue);
      return decodeReceipt(
        await client.request({
          path: `/learning/guides/${g}/nodes/${n}/completion`,
          method: "PATCH",
          body: input,
          signal,
          recoverAuth: true,
        }),
      );
    },
  };
}