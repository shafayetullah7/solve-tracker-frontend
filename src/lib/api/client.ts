import { ApiError } from "./errors";

type QueryValue = string | number | boolean | undefined;
export interface ApiRequest {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, QueryValue | readonly QueryValue[]>;
  body?: unknown;
  signal?: AbortSignal;
  response?: "json" | "text" | "empty";
  recoverAuth?: boolean;
}
export interface ApiClientOptions {
  fetch?: typeof fetch;
  timeoutMs?: number;
  recoverSession?: () => Promise<boolean>;
  // Changes only on logout/account change, not normal token rotation.
  getAuthEpoch?: () => number;
}

function apiUrl(path: string, query?: ApiRequest["query"]): string {
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
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    for (const entry of Array.isArray(value) ? value : [value]) {
      if (entry !== undefined) params.append(key, String(entry));
    }
  }
  const suffix = params.toString();
  return `/api${path}${suffix ? `?${suffix}` : ""}`;
}
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function createApiClient(options: ApiClientOptions = {}) {
  const timeoutMs = options.timeoutMs ?? 15_000;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0)
    throw new Error("timeoutMs must be positive.");
  const epoch = () => options.getAuthEpoch?.() ?? 0;
  function check(signal: AbortSignal | undefined, initialEpoch: number) {
    if (signal?.aborted) throw new ApiError("cancelled", "Request cancelled.");
    if (epoch() !== initialEpoch)
      throw new ApiError("context-changed", "Authentication context changed.");
  }
  async function attempt(
    input: ApiRequest,
    url: string,
    body: string | undefined,
  ): Promise<unknown> {
    const controller = new AbortController();
    let timedOut = false;
    const onAbort = () => controller.abort();
    if (input.signal?.aborted) onAbort();
    input.signal?.addEventListener("abort", onAbort, { once: true });
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
    try {
      const method = input.method ?? "GET";
      const headers: Record<string, string> = {};
      if (method !== "GET") headers["X-Requested-With"] = "practice";
      if (body !== undefined) headers["Content-Type"] = "application/json";
      const response = await (options.fetch ?? globalThis.fetch)(url, {
        method,
        headers,
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
          /* Never expose upstream HTML. */
        }
        const data = record(payload) ? payload : {};
        throw new ApiError(
          "http",
          typeof data.message === "string"
            ? data.message
            : "API request failed.",
          response.status,
          typeof data.code === "string" ? data.code : undefined,
          data.details,
          response.headers.get("Retry-After") ?? undefined,
        );
      }
      if (response.status === 204 || input.response === "empty")
        return undefined;
      if (input.response === "text") return await response.text();
      if (!response.headers.get("Content-Type")?.includes("application/json")) {
        throw new ApiError("contract", "Expected a JSON API response.");
      }
      try {
        return await response.json();
      } catch (error) {
        if (controller.signal.aborted) throw error;
        throw new ApiError("contract", "API returned malformed JSON.");
      }
    } catch (error) {
      if (input.signal?.aborted)
        throw new ApiError("cancelled", "Request cancelled.");
      if (timedOut) throw new ApiError("timeout", "API request timed out.");
      if (error instanceof ApiError) throw error;
      throw new ApiError("network", "API is unavailable.");
    } finally {
      clearTimeout(timer);
      input.signal?.removeEventListener("abort", onAbort);
    }
  }
  return {
    async request(input: ApiRequest): Promise<unknown> {
      const initialEpoch = epoch();
      check(input.signal, initialEpoch);
      const url = apiUrl(input.path, input.query);
      if ((input.method ?? "GET") === "GET" && input.body !== undefined)
        throw new ApiError("contract", "GET requests cannot have a body.");
      let body: string | undefined;
      try {
        body =
          input.body === undefined
            ? undefined
            : JSON.stringify(input.body, (_key, value: unknown) => {
                if (
                  typeof value === "function" ||
                  typeof value === "symbol" ||
                  typeof value === "bigint"
                )
                  throw new Error("Unsupported JSON value");
                if (
                  typeof value === "object" &&
                  value !== null &&
                  !Array.isArray(value) &&
                  ![Object.prototype, null].includes(
                    Object.getPrototypeOf(value),
                  )
                )
                  throw new Error("Unsupported JSON object");
                return value;
              });
      } catch {
        throw new ApiError("contract", "API body must be JSON serializable.");
      }
      try {
        const result = await attempt(input, url, body);
        check(input.signal, initialEpoch);
        return result;
      } catch (error) {
        check(input.signal, initialEpoch);
        if (
          !(error instanceof ApiError) ||
          error.status !== 401 ||
          error.code !== "AUTH_REFRESH_REQUIRED" ||
          !input.recoverAuth ||
          !options.recoverSession
        )
          throw error;
        // The coordinator owns single-flight/locks. Do not pass this caller's signal.
        const recovered = await options.recoverSession();
        check(input.signal, initialEpoch);
        if (!recovered) throw error;
        try {
          return await attempt(input, url, body);
        } finally {
          check(input.signal, initialEpoch);
        }
      }
    },
  };
}
export type ApiClient = ReturnType<typeof createApiClient>;
