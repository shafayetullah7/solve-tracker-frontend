import { ApiError } from "./errors";

function apiUrl(path: string): string {
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    /[\\?#%]/.test(path) ||
    path.split("/").some((p) => p === "." || p === "..")
  ) {
    throw new ApiError(
      "contract",
      "API paths must be absolute-path references without traversal, encoding, query, or fragment.",
    );
  }
  return `/api${path}`;
}

export type MultipartUploadOptions = {
  path: string;
  field?: string;
  file: File;
  signal?: AbortSignal;
  timeoutMs?: number;
  fetch?: typeof fetch;
};

export async function uploadMultipart(
  options: MultipartUploadOptions,
): Promise<unknown> {
  const field = options.field ?? "file";
  const controller = new AbortController();
  let timedOut = false;
  const onAbort = () => controller.abort();
  if (options.signal?.aborted) onAbort();
  options.signal?.addEventListener("abort", onAbort, { once: true });
  const timeoutMs = options.timeoutMs ?? 15_000;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  try {
    const body = new FormData();
    body.append(field, options.file);
    const response = await (options.fetch ?? globalThis.fetch)(apiUrl(options.path), {
      method: "POST",
      headers: { "X-Requested-With": "practice" },
      body,
      signal: controller.signal,
      credentials: "same-origin",
      redirect: "error",
    });
    if (!response.ok) {
      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        /* ignore */
      }
      const data =
        typeof payload === "object" && payload !== null && !Array.isArray(payload)
          ? (payload as Record<string, unknown>)
          : {};
      throw new ApiError(
        "http",
        typeof data.message === "string" ? data.message : "Upload failed.",
        response.status,
        typeof data.code === "string" ? data.code : undefined,
        data.details,
      );
    }
    if (!response.headers.get("Content-Type")?.includes("application/json")) {
      throw new ApiError("contract", "Expected a JSON upload response.");
    }
    return await response.json();
  } catch (error) {
    if (options.signal?.aborted) {
      throw new ApiError("cancelled", "Upload cancelled.");
    }
    if (timedOut) throw new ApiError("timeout", "Upload timed out.");
    if (error instanceof ApiError) throw error;
    throw new ApiError("network", "Upload is unavailable.");
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", onAbort);
  }
}