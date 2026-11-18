import { createApiClient } from "../api/client";
import { createAuthApi } from "../api/modules/auth.api";
import {
  createBrowserBroadcastAdapter,
  createNoopBroadcastAdapter,
  type BroadcastAdapter,
} from "./broadcast";
import { createAuthCoordinator } from "./coordinator";
import { createBrowserLockAdapter, type LockAdapter } from "./locks";

export function createAuthClients(options?: {
  fetch?: typeof fetch;
  locks?: LockAdapter;
  broadcast?: BroadcastAdapter;
  timeoutMs?: number;
  onSessionInvalidated?: () => void;
}) {
  const rawClient = createApiClient({
    fetch: options?.fetch,
    timeoutMs: options?.timeoutMs,
  });
  const authApi = createAuthApi(rawClient);
  const locks = options?.locks ?? createBrowserLockAdapter();
  const broadcast =
    options?.broadcast ??
    (typeof document !== "undefined"
      ? createBrowserBroadcastAdapter()
      : createNoopBroadcastAdapter());
  const coordinator = createAuthCoordinator({ authApi, locks });
  const productClient = createApiClient({
    fetch: options?.fetch,
    timeoutMs: options?.timeoutMs,
    recoverSession: () => coordinator.recoverSession(),
    getAuthEpoch: () => coordinator.getEpoch(),
    onSessionInvalidated: options?.onSessionInvalidated,
  });
  return { authApi, productClient, coordinator, rawClient, broadcast };
}