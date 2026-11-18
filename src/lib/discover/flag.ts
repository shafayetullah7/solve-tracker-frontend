export type DiscoverMode = "off" | "sharing" | "full";

function parseDiscoverMode(raw: unknown): DiscoverMode {
  if (raw === "sharing" || raw === "full") return raw;
  return "off";
}

export function getDiscoverMode(): DiscoverMode {
  return parseDiscoverMode(import.meta.env.VITE_DISCOVER_MODE);
}

export function isDiscoverOff(): boolean {
  return getDiscoverMode() === "off";
}

export function isDiscoverSharingEnabled(): boolean {
  const mode = getDiscoverMode();
  return mode === "sharing" || mode === "full";
}

export function isDiscoverFullEnabled(): boolean {
  return getDiscoverMode() === "full";
}