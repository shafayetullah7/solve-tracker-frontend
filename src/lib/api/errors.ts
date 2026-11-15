export type ApiErrorKind =
  "http" | "network" | "timeout" | "cancelled" | "contract" | "context-changed";
export class ApiError extends Error {
  constructor(
    public readonly kind: ApiErrorKind,
    message: string,
    public readonly status?: number,
    public readonly code?: string,
    public readonly details?: unknown,
    public readonly retryAfter?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
