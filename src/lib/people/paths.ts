const APP_PEOPLE_ROOT = "/app/u";
const PUBLIC_PEOPLE_ROOT = "/u";

export function peopleProfilePath(handle: string): string {
  return `${APP_PEOPLE_ROOT}/${encodeURIComponent(handle.trim())}`;
}

export function publicPeopleProfilePath(handle: string): string {
  return `${PUBLIC_PEOPLE_ROOT}/${encodeURIComponent(handle.trim())}`;
}

export function publicPeopleTopicPath(handle: string, topicId: string): string {
  return `${publicPeopleProfilePath(handle)}/topics/${encodeURIComponent(topicId)}`;
}

export function peopleTopicPath(handle: string, topicId: string): string {
  return `${peopleProfilePath(handle)}/topics/${encodeURIComponent(topicId)}`;
}

export function peopleComparePath(
  handle: string,
  query?: { weeks?: number; focus?: "cadence" | "topics" },
): string {
  const params = new URLSearchParams();
  if (query?.weeks) params.set("weeks", String(query.weeks));
  if (query?.focus) params.set("focus", query.focus);
  const qs = params.toString();
  return `${peopleProfilePath(handle)}/compare${qs ? `?${qs}` : ""}`;
}

export function discoverPeersComparePath(query?: { weeks?: number; focus?: string }): string {
  const params = new URLSearchParams();
  if (query?.weeks) params.set("weeks", String(query.weeks));
  if (query?.focus) params.set("focus", query.focus);
  const qs = params.toString();
  return `/app/discover/compare${qs ? `?${qs}` : ""}`;
}

export function absolutePeopleProfileUrl(handle: string, origin?: string): string {
  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}${peopleProfilePath(handle)}`;
}

export function absolutePublicPeopleProfileUrl(
  handle: string,
  origin?: string,
): string {
  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}${publicPeopleProfilePath(handle)}`;
}

export function absolutePeopleTopicUrl(
  handle: string,
  topicId: string,
  origin?: string,
): string {
  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}${peopleTopicPath(handle, topicId)}`;
}