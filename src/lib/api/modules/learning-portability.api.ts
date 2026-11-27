import type { ApiClient } from "../client";
import { ApiError } from "../errors";
import type { MutationReceipt } from "./learning-guides.api";

export type ImportPreviewInput = {
  format: "markdown" | "json";
  content: string;
};
export type ImportPreviewResponse = {
  importId: string;
  guidePreview: {
    title: string;
    nodeCount: number;
    nodes: { localKey: string; parentLocalKey: string | null; title: string }[];
  };
  warnings: string[];
  expiresAt: string;
};
export type ImportCommitInput = { operationId: string };
export type GuideCopyInput = { operationId: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

export function createLearningPortabilityApi(client: ApiClient) {
  return {
    async preview(input: ImportPreviewInput, signal?: AbortSignal): Promise<ImportPreviewResponse> {
      const value = await client.request({
        path: "/learning/imports/preview",
        method: "POST",
        body: input,
        signal,
        recoverAuth: true,
      });
      if (!isRecord(value) || typeof value.importId !== "string")
        throw new ApiError("contract", "Invalid import preview.");
      return value as ImportPreviewResponse;
    },
    async commit(importId: string, input: ImportCommitInput, signal?: AbortSignal): Promise<MutationReceipt> {
      return decodeReceipt(
        await client.request({
          path: `/learning/imports/${importId}/commit`,
          method: "POST",
          body: input,
          signal,
          recoverAuth: true,
        }),
      );
    },
    async exportGuide(
      guideId: string,
      format: "json" | "markdown",
      signal?: AbortSignal,
    ): Promise<unknown | string> {
      return client.request({
        path: `/learning/guides/${guideId}/export`,
        query: { format },
        response: format === "markdown" ? "text" : "json",
        signal,
        recoverAuth: true,
      });
    },
    async copyGuide(guideId: string, input: GuideCopyInput, signal?: AbortSignal): Promise<MutationReceipt> {
      return decodeReceipt(
        await client.request({
          path: `/learning/guides/${guideId}/copies`,
          method: "POST",
          body: input,
          signal,
          recoverAuth: true,
        }),
      );
    },
  };
}