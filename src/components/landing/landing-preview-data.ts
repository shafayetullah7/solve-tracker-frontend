import type { CatalogSlug } from "../../lib/platforms/catalog-runtime";

export type LandingPreviewProblem = {
  title: string;
  slug: CatalogSlug;
  topics: string[];
  status: "solved" | "unsolved";
};

export const LANDING_PREVIEW_PROBLEM: LandingPreviewProblem = {
  title: "Next Greater Element II",
  slug: "leetcode",
  topics: ["Monotonic Stack", "Arrays"],
  status: "unsolved",
};

export const LANDING_PREVIEW_PROBLEM_SECOND: LandingPreviewProblem = {
  title: "Cool Trick",
  slug: "codeforces",
  topics: ["Greedy"],
  status: "solved",
};