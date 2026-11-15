export const AUTH_BROADCAST_CHANNEL = "practice:auth-events";

export type AuthBroadcastMessage =
  | { type: "session-changed"; tabId: string }
  | { type: "logged-out"; tabId: string };

export type AuthBroadcastHandler = (message: AuthBroadcastMessage) => void;

export interface BroadcastAdapter {
  isSupported(): boolean;
  subscribe(handler: AuthBroadcastHandler): () => void;
  publish(message: AuthBroadcastMessage): void;
  close(): void;
}

export function parseAuthBroadcastMessage(
  data: unknown,
): AuthBroadcastMessage | undefined {
  if (typeof data !== "object" || data === null) return undefined;
  const record = data as Record<string, unknown>;
  const type = record.type;
  const tabId = record.tabId;
  if (type !== "session-changed" && type !== "logged-out") return undefined;
  if (typeof tabId !== "string" || tabId.length === 0) return undefined;
  return { type, tabId };
}

export function createNoopBroadcastAdapter(): BroadcastAdapter {
  return {
    isSupported: () => false,
    subscribe: () => () => {},
    publish: () => {},
    close: () => {},
  };
}

export function createMemoryBroadcastHub(): BroadcastAdapter & {
  /** Deliver a raw payload as if from the channel (for tests). */
  deliver(data: unknown): void;
} {
  const subscribers = new Set<AuthBroadcastHandler>();
  return {
    isSupported: () => true,
    subscribe(handler) {
      subscribers.add(handler);
      return () => {
        subscribers.delete(handler);
      };
    },
    publish(message) {
      for (const handler of subscribers) {
        handler(message);
      }
    },
    close() {
      subscribers.clear();
    },
    deliver(data) {
      const message = parseAuthBroadcastMessage(data);
      if (!message) return;
      for (const handler of subscribers) {
        handler(message);
      }
    },
  };
}

export function createBrowserBroadcastAdapter(): BroadcastAdapter {
  if (typeof BroadcastChannel !== "function") {
    return createNoopBroadcastAdapter();
  }
  let channel: BroadcastChannel | undefined;
  try {
    channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL);
  } catch {
    return createNoopBroadcastAdapter();
  }
  return {
    isSupported: () => true,
    subscribe(handler) {
      const onMessage = (event: MessageEvent) => {
        const message = parseAuthBroadcastMessage(event.data);
        if (message) handler(message);
      };
      channel!.addEventListener("message", onMessage);
      return () => channel!.removeEventListener("message", onMessage);
    },
    publish(message) {
      channel!.postMessage(message);
    },
    close() {
      channel!.close();
    },
  };
}