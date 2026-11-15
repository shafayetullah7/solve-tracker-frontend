import { ApiError } from "../api/errors";
import type { createAuthApi } from "../api/modules/auth.api";
import { AUTH_SESSION_LOCK, type LockAdapter } from "./locks";

export type AuthApi = Pick<
  ReturnType<typeof createAuthApi>,
  "getSession" | "refresh"
>;

export type AuthCoordinator = {
  recoverSession(): Promise<boolean>;
  getEpoch(): number;
  bumpEpoch(): void;
  suppressRecovery(): void;
  releaseRecoverySuppression(): void;
  isRecoverySuppressed(): boolean;
  readonly supportsAutoRecovery: boolean;
  runWithSessionLock<T>(fn: () => Promise<T>): Promise<T>;
};

function isRefreshRequired(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.kind === "http" &&
    error.status === 401 &&
    error.code === "AUTH_REFRESH_REQUIRED"
  );
}

export function createAuthCoordinator(deps: {
  authApi: AuthApi;
  locks: LockAdapter;
}): AuthCoordinator {
  let epoch = 0;
  let inFlight: Promise<boolean> | null = null;
  let recoverySuppressed = false;

  const supportsAutoRecovery = deps.locks.isSupported();

  async function probeSessionValid(startEpoch: number): Promise<boolean> {
    if (epoch !== startEpoch) return false;
    await deps.authApi.getSession();
    return epoch === startEpoch;
  }

  async function attemptRecovery(startEpoch: number): Promise<boolean> {
    if (epoch !== startEpoch) return false;
    try {
      return await probeSessionValid(startEpoch);
    } catch (error) {
      if (!isRefreshRequired(error)) return false;
    }
    try {
      await deps.authApi.refresh();
      return epoch === startEpoch;
    } catch {
      try {
        return await probeSessionValid(startEpoch);
      } catch {
        return false;
      }
    }
  }

  async function runWithSessionLock<T>(fn: () => Promise<T>): Promise<T> {
    if (!deps.locks.isSupported()) return fn();
    return deps.locks.request(AUTH_SESSION_LOCK, fn);
  }

  return {
    supportsAutoRecovery,

    getEpoch() {
      return epoch;
    },

    bumpEpoch() {
      epoch += 1;
    },

    suppressRecovery() {
      recoverySuppressed = true;
    },

    releaseRecoverySuppression() {
      recoverySuppressed = false;
    },

    isRecoverySuppressed() {
      return recoverySuppressed;
    },

    runWithSessionLock,

    recoverSession() {
      if (recoverySuppressed) return Promise.resolve(false);
      if (!supportsAutoRecovery) return Promise.resolve(false);
      const startEpoch = epoch;
      if (inFlight) return inFlight;
      let job!: Promise<boolean>;
      job = runWithSessionLock(() => attemptRecovery(startEpoch)).finally(() => {
        if (inFlight === job) inFlight = null;
      });
      inFlight = job;
      return job;
    },
  };
}