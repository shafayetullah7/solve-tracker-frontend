import type { AuthUser } from "./session-state";

/**
 * Per-request auth snapshot from the SSR session probe.
 * `checking` means the access token expired but a refresh may still succeed —
 * the client coordinator resolves it after hydration.
 */
export type ServerAuthBootstrap =
  | { kind: "authenticated"; user: AuthUser }
  | { kind: "anonymous" }
  | { kind: "checking" }
  | { kind: "unavailable" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseSessionUser(body: unknown): AuthUser | undefined {
  if (
    !isRecord(body) ||
    !isRecord(body.user) ||
    typeof body.user.id !== "string" ||
    typeof body.user.name !== "string" ||
    typeof body.user.email !== "string" ||
    typeof body.user.handle !== "string" ||
    body.user.handle.length === 0
  ) {
    return undefined;
  }
  return {
    id: body.user.id,
    name: body.user.name,
    email: body.user.email,
    handle: body.user.handle,
  };
}

