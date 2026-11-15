/** Slugs aligned with backend seed and list filter enum. */
export const PLATFORM_FILTER_OPTIONS = [
  { slug: "codeforces" as const, label: "Codeforces" },
  { slug: "leetcode" as const, label: "LeetCode" },
  { slug: "codechef" as const, label: "CodeChef" },
];

const HOST_LABELS: { hosts: string[]; label: string }[] = [
  { hosts: ["codeforces.com"], label: "Codeforces" },
  { hosts: ["leetcode.com"], label: "LeetCode" },
  { hosts: ["www.codechef.com", "codechef.com"], label: "CodeChef" },
];

function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

export function platformLabelFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.toLowerCase();
    const normalized = normalizeHostname(host);
    for (const entry of HOST_LABELS) {
      if (
        entry.hosts.some(
          (h) => normalized === normalizeHostname(h) || host === h,
        )
      )
        return entry.label;
    }
    return host || "Other";
  } catch {
    return "Other";
  }
}