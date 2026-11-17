/** Shared shape for drift checks between frontend and backend platform catalogs. */
export type CatalogComparableEntry = {
  readonly slug: string;
  readonly name: string;
  readonly baseUrl: string;
  readonly urlHosts: readonly string[];
};

export type CanonicalCatalogEntry = {
  slug: string;
  name: string;
  baseUrl: string;
  urlHosts: string[];
};

function normalizeHosts(hosts: readonly string[]): string[] {
  return [...hosts]
    .map((h) => h.toLowerCase())
    .sort((a, b) => a.localeCompare(b));
}

export function canonicalizePlatformCatalog(
  entries: readonly CatalogComparableEntry[],
): CanonicalCatalogEntry[] {
  return entries.map((entry) => ({
    slug: entry.slug,
    name: entry.name,
    baseUrl: entry.baseUrl,
    urlHosts: normalizeHosts(entry.urlHosts),
  }));
}

export type CatalogMismatch =
  | { kind: "length"; left: number; right: number }
  | { kind: "slug"; index: number; left?: string; right?: string }
  | { kind: "field"; slug: string; field: keyof CanonicalCatalogEntry; left: unknown; right: unknown };

function entriesEqual(
  a: CanonicalCatalogEntry,
  b: CanonicalCatalogEntry,
): CatalogMismatch | undefined {
  if (a.slug !== b.slug) {
    return { kind: "field", slug: a.slug, field: "slug", left: a.slug, right: b.slug };
  }
  if (a.name !== b.name) {
    return { kind: "field", slug: a.slug, field: "name", left: a.name, right: b.name };
  }
  if (a.baseUrl !== b.baseUrl) {
    return {
      kind: "field",
      slug: a.slug,
      field: "baseUrl",
      left: a.baseUrl,
      right: b.baseUrl,
    };
  }
  const hostsA = a.urlHosts.join("\0");
  const hostsB = b.urlHosts.join("\0");
  if (hostsA !== hostsB) {
    return {
      kind: "field",
      slug: a.slug,
      field: "urlHosts",
      left: a.urlHosts,
      right: b.urlHosts,
    };
  }
  return undefined;
}

/** Returns first mismatch, or undefined when catalogs match (order-sensitive). */
export function findCatalogMismatch(
  left: readonly CatalogComparableEntry[],
  right: readonly CatalogComparableEntry[],
): CatalogMismatch | undefined {
  const cLeft = canonicalizePlatformCatalog(left);
  const cRight = canonicalizePlatformCatalog(right);
  if (cLeft.length !== cRight.length) {
    return { kind: "length", left: cLeft.length, right: cRight.length };
  }
  for (let i = 0; i < cLeft.length; i++) {
    const leftEntry = cLeft[i]!;
    const rightEntry = cRight[i];
    if (!rightEntry) {
      return { kind: "slug", index: i, left: leftEntry.slug, right: undefined };
    }
    const fieldMismatch = entriesEqual(leftEntry, rightEntry);
    if (fieldMismatch) return fieldMismatch;
  }
  return undefined;
}

export function formatCatalogMismatch(
  mismatch: CatalogMismatch,
  labels: { left: string; right: string },
): string {
  switch (mismatch.kind) {
    case "length":
      return `${labels.left} has ${mismatch.left} entries, ${labels.right} has ${mismatch.right}`;
    case "slug":
      return `entry ${mismatch.index}: ${labels.left} slug=${mismatch.left ?? "(missing)"}, ${labels.right} slug=${mismatch.right ?? "(missing)"}`;
    case "field":
      return `slug "${mismatch.slug}": ${mismatch.field} differs — ${labels.left}=${JSON.stringify(mismatch.left)} ${labels.right}=${JSON.stringify(mismatch.right)}`;
  }
}

export function assertCatalogsMatch(
  left: readonly CatalogComparableEntry[],
  right: readonly CatalogComparableEntry[],
  labels: { left: string; right: string },
): void {
  const mismatch = findCatalogMismatch(left, right);
  if (mismatch) {
    throw new Error(formatCatalogMismatch(mismatch, labels));
  }
}