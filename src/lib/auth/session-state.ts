import { ApiError } from "../api/errors";
import type { AccountFlags, SessionResponse } from "../api/modules/auth.api";
import type { AuthCoordinator } from "./coordinator";

export type AuthUser = SessionResponse["user"];

export type BootstrapResult =
  | { kind: "authenticated"; user: AuthUser; account?: AccountFlags }
  | { kind: "anonymous" }
  | { kind: "unavailable" }
  | { kind: "cancelled" };

export type SessionProbe = {
  getSession(): Promise<SessionResponse>;
};

function isRefreshRequired(error: ApiError): boolean {
  return (
    error.kind === "http" &&
    error.status === 401 &&
    error.code === "AUTH_REFRESH_REQUIRED"
  );
}

export async function resolveBootstrapSession(
  authApi: SessionProbe,
  coordinator: AuthCoordinator,
  options?: { isAborted?: () => boolean },
): Promise<BootstrapResult> {
  const startEpoch = coordinator.getEpoch();
  if (options?.isAborted?.()) return { kind: "cancelled" };

  async function probe(): Promise<BootstrapResult> {
    const session = await authApi.getSession();
    if (options?.isAborted?.()) return { kind: "cancelled" };
    if (coordinator.getEpoch() !== startEpoch) return { kind: "cancelled" };
    return {
      kind: "authenticated",
      user: session.user,
      account: session.account,
    };
  }

  try {
    return await probe();
  } catch (error) {
    if (options?.isAborted?.()) return { kind: "cancelled" };
    if (!(error instanceof ApiError)) return { kind: "unavailable" };
    if (error.kind === "cancelled") return { kind: "cancelled" };
    if (error.kind === "network" || error.kind === "timeout")
      return { kind: "unavailable" };
    if (isRefreshRequired(error)) {
      const recovered = await coordinator.recoverSession();
      if (options?.isAborted?.()) return { kind: "cancelled" };
      if (!recovered) return { kind: "anonymous" };
      try {
        return await probe();
      } catch (inner) {
        if (options?.isAborted?.()) return { kind: "cancelled" };
        if (inner instanceof ApiError) {
          if (inner.kind === "network" || inner.kind === "timeout")
            return { kind: "unavailable" };
          if (inner.kind === "http" && inner.status === 401)
            return { kind: "anonymous" };
        }
        return { kind: "anonymous" };
      }
    }
    if (error.kind === "http" && error.status === 401) return { kind: "anonymous" };
    return { kind: "unavailable" };
  }
}