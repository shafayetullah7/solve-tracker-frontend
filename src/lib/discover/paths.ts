const DISCOVER_ROOT = "/app/discover";

export function discoverRootPath(): string {
  return DISCOVER_ROOT;
}

export function discoverForYouPath(): string {
  return DISCOVER_ROOT;
}

export function discoverPeoplePath(query?: string): string {
  if (!query?.trim()) return `${DISCOVER_ROOT}/people`;
  const params = query.startsWith("?") ? query.slice(1) : query;
  return `${DISCOVER_ROOT}/people?${params}`;
}

export function discoverTopicsPath(): string {
  return `${DISCOVER_ROOT}/topics`;
}