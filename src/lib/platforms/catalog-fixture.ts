import type { CatalogEntry } from "./catalog-runtime";

/** Shared catalog rows for unit tests (subset of production judges). */
export const mockPlatformEntries: CatalogEntry[] = [
  {
    slug: "leetcode",
    name: "LeetCode",
    baseUrl: "https://leetcode.com",
    urlHosts: ["leetcode.com"],
  },
  {
    slug: "codeforces",
    name: "Codeforces",
    baseUrl: "https://codeforces.com",
    urlHosts: ["codeforces.com"],
  },
  {
    slug: "codechef",
    name: "CodeChef",
    baseUrl: "https://www.codechef.com",
    urlHosts: ["codechef.com", "www.codechef.com"],
  },
  {
    slug: "hackerrank",
    name: "HackerRank",
    baseUrl: "https://www.hackerrank.com",
    urlHosts: ["hackerrank.com", "www.hackerrank.com"],
  },
];

export const mockPlatformFilterOptions = [
  ...mockPlatformEntries.map((entry) => ({
    slug: entry.slug,
    label: entry.name,
  })),
  { slug: "other" as const, label: "Other" },
];