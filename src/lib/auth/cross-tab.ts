import type { AuthBroadcastMessage, BroadcastAdapter } from "./broadcast";
import type { AuthCoordinator } from "./coordinator";

export type AuthCrossTab = {
  tabId: string;
  publishSessionChanged(): void;
  publishLoggedOut(): void;
  handleMessage(message: AuthBroadcastMessage): void;
  close(): void;
};

export function createAuthCrossTab(deps: {
  tabId: string;
  broadcast: BroadcastAdapter;
  coordinator: AuthCoordinator;
  onInvalidate: () => void | Promise<void>;
}): AuthCrossTab {
  let suppressReleaseOnInvalidate = false;

  function publishSessionChanged() {
    if (!deps.broadcast.isSupported()) return;
    deps.broadcast.publish({ type: "session-changed", tabId: deps.tabId });
  }

  function publishLoggedOut() {
    if (!deps.broadcast.isSupported()) return;
    deps.broadcast.publish({ type: "logged-out", tabId: deps.tabId });
  }

  function handleMessage(message: AuthBroadcastMessage) {
    if (message.tabId === deps.tabId) return;
    if (message.type === "session-changed") {
      deps.coordinator.bumpEpoch();
      suppressReleaseOnInvalidate = false;
      void deps.onInvalidate();
      return;
    }
    deps.coordinator.suppressRecovery();
    deps.coordinator.bumpEpoch();
    suppressReleaseOnInvalidate = true;
    void Promise.resolve(deps.onInvalidate()).finally(() => {
      if (suppressReleaseOnInvalidate) {
        deps.coordinator.releaseRecoverySuppression();
        suppressReleaseOnInvalidate = false;
      }
    });
  }

  return {
    tabId: deps.tabId,
    publishSessionChanged,
    publishLoggedOut,
    handleMessage,
    close() {
      suppressReleaseOnInvalidate = false;
    },
  };
}

export function createTabId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function")
    return crypto.randomUUID();
  return `tab-${Math.random().toString(36).slice(2)}`;
}