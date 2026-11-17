import { resolveApiProxyOrigin } from "../../../config/api-proxy-origin.ts";
import { apiProxyTargetForRuntime } from "../../../config/runtime-env.ts";
import type { ServerAuthBootstrap } from "./server-session";
import { parseSessionUser } from "./server-session";

export type ProbeServerAuthSessionOptions = {
  signal?: AbortSignal;
  fetch?: typeof fetch;
  apiOrigin?: string;
};

async function errorCode(response: Response): Promise<string | undefined> {
  try {
    const body: unknown = await response.json();
    if (typeof body === "object" && body !== null && "code" in body) {
      const code = (body as { code: unknown }).code;
      return typeof code === "string" ? code : undefined;
    }
  } catch {
    /* Non-JSON 401 body. */
  }
  return undefined;
}

/**
 * Read-only session probe for SSR (direct to Nest via API_PROXY_TARGET).
 * Server-only: imports Node runtime env. Do not import from client code.
 */
export async function probeServerAuthSession(
  cookie: string | null,
  options: ProbeServerAuthSessionOptions = {},
): Promise<ServerAuthBootstrap> {
  const fetchFn = options.fetch ?? globalThis.fetch;
  let origin: string;
  try {
    origin = options.apiOrigin
      ? resolveApiProxyOrigin(options.apiOrigin)
      : apiProxyTargetForRuntime();
  } catch {
    return { kind: "unavailable" };
  }

  const url = new URL("/auth/session", origin);
  const headers = new Headers();
  if (cookie) {
    headers.set("Cookie", cookie);
  }

  try {
    const response = await fetchFn(url, {
      method: "GET",
      headers,
      signal: options.signal,
    });

    if (response.status === 401) {
      // Nest also answers AUTH_REFRESH_REQUIRED when no cookies were sent at all.
      return cookie && (await errorCode(response)) === "AUTH_REFRESH_REQUIRED"
        ? { kind: "checking" }
        : { kind: "anonymous" };
    }
    if (!response.ok) {
      return { kind: "unavailable" };
    }

    const user = parseSessionUser(await response.json());
    return user ? { kind: "authenticated", user } : { kind: "unavailable" };
  } catch {
    return { kind: "unavailable" };
  }
}
