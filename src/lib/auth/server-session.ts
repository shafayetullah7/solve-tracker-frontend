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

export const AUTH_BOOTSTRAP_ELEMENT_ID = "practice-auth-bootstrap";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseSessionUser(body: unknown): AuthUser | undefined {
  if (
    !isRecord(body) ||
    !isRecord(body.user) ||
    typeof body.user.id !== "string" ||
    typeof body.user.name !== "string" ||
    typeof body.user.email !== "string"
  ) {
    return undefined;
  }
  return {
    id: body.user.id,
    name: body.user.name,
    email: body.user.email,
  };
}

export function parseBootstrap(value: unknown): ServerAuthBootstrap | undefined {
  if (!isRecord(value) || typeof value.kind !== "string") return undefined;
  if (value.kind === "authenticated") {
    const user = parseSessionUser({ user: value.user });
    return user ? { kind: "authenticated", user } : undefined;
  }
  if (
    value.kind === "anonymous" ||
    value.kind === "checking" ||
    value.kind === "unavailable"
  ) {
    return { kind: value.kind };
  }
  return undefined;
}

export function readClientBootstrapFromDom(): ServerAuthBootstrap | undefined {
  if (typeof document === "undefined") return undefined;
  const text = document
    .getElementById(AUTH_BOOTSTRAP_ELEMENT_ID)
    ?.textContent?.trim();
  if (!text) return undefined;
  try {
    return parseBootstrap(JSON.parse(text));
  } catch {
    return undefined;
  }
}

/** Safe subset for the hydration seed — no tokens. */
export function serializableBootstrap(
  bootstrap: ServerAuthBootstrap,
): ServerAuthBootstrap {
  if (bootstrap.kind === "authenticated") {
    return {
      kind: "authenticated",
      user: {
        id: bootstrap.user.id,
        name: bootstrap.user.name,
        email: bootstrap.user.email,
      },
    };
  }
  return { kind: bootstrap.kind };
}

/** `<script type="application/json">` markup, safe to splice into HTML. */
export function bootstrapScriptTag(bootstrap: ServerAuthBootstrap): string {
  const json = JSON.stringify(serializableBootstrap(bootstrap))
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  return `<script id="${AUTH_BOOTSTRAP_ELEMENT_ID}" type="application/json">${json}</script>`;
}
