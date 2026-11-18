import type { ApiClient } from "../api/client";

const MAX_BATCH = 20;
const FLUSH_MS = 2_000;

type PendingEvent = { event: string; surface: string };

let queue: PendingEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | undefined;
let client: ApiClient | undefined;

export function initDiscoverTrack(apiClient: ApiClient) {
  client = apiClient;
}

export function trackDiscoverEvent(event: string, surface: string) {
  queue.push({ event, surface });
  if (queue.length >= MAX_BATCH) {
    void flushDiscoverEvents();
    return;
  }
  if (!flushTimer) {
    flushTimer = setTimeout(() => {
      void flushDiscoverEvents();
    }, FLUSH_MS);
  }
}

export async function flushDiscoverEvents() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = undefined;
  }
  if (!client || queue.length === 0) return;
  const batch = queue.slice(0, MAX_BATCH);
  queue = queue.slice(batch.length);
  try {
    await client.request({
      path: "/discover/events",
      method: "POST",
      body: { events: batch },
    });
  } catch {
    queue = [...batch, ...queue].slice(0, MAX_BATCH * 2);
  }
}

export function bindDiscoverTrackFlush() {
  if (typeof document === "undefined") return () => {};
  const onHidden = () => {
    if (document.visibilityState === "hidden") void flushDiscoverEvents();
  };
  document.addEventListener("visibilitychange", onHidden);
  return () => document.removeEventListener("visibilitychange", onHidden);
}