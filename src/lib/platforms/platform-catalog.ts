/**
 * Canonical judges / practice sites for the browser bundle.
 * Keep slugs and urlHosts aligned with the API's platform reference data.
 */
export type PlatformCatalogEntry = {
  readonly slug: string;
  readonly name: string;
  readonly baseUrl: string;
  /** Hostnames (with or without www) used for URL→platform detection. */
  readonly urlHosts: readonly string[];
};

export const PLATFORM_CATALOG = [
  {
    slug: "codeforces",
    name: "Codeforces",
    baseUrl: "https://codeforces.com",
    urlHosts: ["codeforces.com"],
  },
  {
    slug: "leetcode",
    name: "LeetCode",
    baseUrl: "https://leetcode.com",
    urlHosts: ["leetcode.com"],
  },
  {
    slug: "codechef",
    name: "CodeChef",
    baseUrl: "https://www.codechef.com",
    urlHosts: ["codechef.com", "www.codechef.com"],
  },
  {
    slug: "atcoder",
    name: "AtCoder",
    baseUrl: "https://atcoder.jp",
    urlHosts: ["atcoder.jp"],
  },
  {
    slug: "hackerrank",
    name: "HackerRank",
    baseUrl: "https://www.hackerrank.com",
    urlHosts: ["hackerrank.com", "www.hackerrank.com"],
  },
  {
    slug: "geeksforgeeks",
    name: "GeeksforGeeks",
    baseUrl: "https://www.geeksforgeeks.org",
    urlHosts: ["geeksforgeeks.org", "www.geeksforgeeks.org"],
  },
  {
    slug: "kattis",
    name: "Kattis",
    baseUrl: "https://open.kattis.com",
    urlHosts: ["kattis.com", "open.kattis.com"],
  },
  {
    slug: "spoj",
    name: "SPOJ",
    baseUrl: "https://www.spoj.com",
    urlHosts: ["spoj.com", "www.spoj.com"],
  },
  {
    slug: "cses",
    name: "CSES",
    baseUrl: "https://cses.fi",
    urlHosts: ["cses.fi"],
  },
  {
    slug: "beecrowd",
    name: "beecrowd",
    baseUrl: "https://www.beecrowd.com.br",
    urlHosts: ["beecrowd.com.br", "www.beecrowd.com.br", "uri.onlinejudge.br"],
  },
  {
    slug: "codewars",
    name: "Codewars",
    baseUrl: "https://www.codewars.com",
    urlHosts: ["codewars.com", "www.codewars.com"],
  },
  {
    slug: "hackerearth",
    name: "HackerEarth",
    baseUrl: "https://www.hackerearth.com",
    urlHosts: ["hackerearth.com", "www.hackerearth.com"],
  },
  {
    slug: "topcoder",
    name: "Topcoder",
    baseUrl: "https://www.topcoder.com",
    urlHosts: ["topcoder.com", "www.topcoder.com"],
  },
  {
    slug: "projecteuler",
    name: "Project Euler",
    baseUrl: "https://projecteuler.net",
    urlHosts: ["projecteuler.net"],
  },
  {
    slug: "uva",
    name: "UVa Online Judge",
    baseUrl: "https://onlinejudge.org",
    urlHosts: ["onlinejudge.org", "uva.onlinejudge.org"],
  },
  {
    slug: "aizu",
    name: "Aizu Online Judge",
    baseUrl: "https://judge.u-aizu.ac.jp",
    urlHosts: ["judge.u-aizu.ac.jp", "u-aizu.ac.jp"],
  },
] as const satisfies readonly PlatformCatalogEntry[];

export type PlatformSlug = (typeof PLATFORM_CATALOG)[number]["slug"];

export const PLATFORM_SLUGS = PLATFORM_CATALOG.map(
  (entry) => entry.slug,
) as [PlatformSlug, ...PlatformSlug[]];

const SLUG_SET = new Set<string>(PLATFORM_SLUGS);

export function isPlatformSlug(value: string): value is PlatformSlug {
  return SLUG_SET.has(value);
}

export function normalizePlatformHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

export function platformEntryBySlug(
  slug: string,
): (typeof PLATFORM_CATALOG)[number] | undefined {
  return PLATFORM_CATALOG.find((entry) => entry.slug === slug);
}

export function platformLabelBySlug(slug: string): string {
  return platformEntryBySlug(slug)?.name ?? slug;
}

/** Label for API `platformSlug` (catalog or stored `other`). */
export function platformLabelForStoredSlug(slug: string): string {
  if (slug === "other") return "Other";
  if (isPlatformSlug(slug)) return platformLabelBySlug(slug);
  return slug;
}

export type PlatformPreviewFromUrl = {
  slug: PlatformSlug | "other";
  label: string;
};

/** Client-only preview for add/edit forms (server sets platformSlug on save). */
export function platformPreviewFromUrl(url: string): PlatformPreviewFromUrl {
  const trimmed = url.trim();
  if (!trimmed) {
    return { slug: "other", label: "Enter a URL to detect the judge." };
  }
  const slug = platformSlugFromUrl(trimmed) ?? "other";
  return { slug, label: platformLabelForStoredSlug(slug) };
}

/** Filter dropdown / chip options (slug + display name). */
export const PLATFORM_FILTER_OPTIONS = PLATFORM_CATALOG.map((entry) => ({
  slug: entry.slug,
  label: entry.name,
}));

export function platformSlugFromUrl(url: string): PlatformSlug | null {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
  const normalized = normalizePlatformHostname(host);
  for (const entry of PLATFORM_CATALOG) {
    for (const pattern of entry.urlHosts) {
      const patternNorm = normalizePlatformHostname(pattern);
      if (
        normalized === patternNorm ||
        host === pattern.toLowerCase() ||
        normalized.endsWith(`.${patternNorm}`)
      ) {
        return entry.slug;
      }
    }
  }
  return null;
}

export function platformLabelFromUrl(url: string): string {
  const slug = platformSlugFromUrl(url);
  if (slug) return platformLabelBySlug(slug);
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host || "Other";
  } catch {
    return "Other";
  }
}