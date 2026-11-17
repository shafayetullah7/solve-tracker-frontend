import { uploadMultipart } from "../multipart";
import { ApiError } from "../errors";
import type { operations } from "../generated/backend";

export type MediaUploadResponse =
  operations["MediaController_upload"]["responses"][201]["content"]["application/json"];

function decodeUpload(value: unknown): MediaUploadResponse {
  if (
    typeof value !== "object" ||
    value === null ||
    typeof (value as { id?: unknown }).id !== "string" ||
    typeof (value as { url?: unknown }).url !== "string"
  ) {
    throw new ApiError("contract", "Invalid media upload response.");
  }
  return { id: (value as { id: string }).id, url: (value as { url: string }).url };
}

export function createMediaApi(options?: { fetch?: typeof fetch; timeoutMs?: number }) {
  return {
    async uploadAvatar(file: File, signal?: AbortSignal): Promise<MediaUploadResponse> {
      return decodeUpload(
        await uploadMultipart({
          path: "/media",
          file,
          signal,
          fetch: options?.fetch,
          timeoutMs: options?.timeoutMs,
        }),
      );
    },
  };
}