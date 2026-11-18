import type { SimpleIcon } from "simple-icons";
import {
  siCodechef,
  siCodeforces,
  siCodewars,
  siGeeksforgeeks,
  siHackerearth,
  siHackerrank,
  siLeetcode,
  siSpoj,
  siTopcoder,
} from "simple-icons";
import type { CatalogSlug } from "./catalog-runtime";

/** simple-icons entries keyed by our platform slug (when available). */
export const PLATFORM_SIMPLE_ICONS: Partial<
  Record<CatalogSlug, SimpleIcon>
> = {
  codeforces: siCodeforces,
  leetcode: siLeetcode,
  codechef: siCodechef,
  hackerrank: siHackerrank,
  geeksforgeeks: siGeeksforgeeks,
  spoj: siSpoj,
  codewars: siCodewars,
  hackerearth: siHackerearth,
  topcoder: siTopcoder,
};

export function platformIconPath(slug: CatalogSlug): string | undefined {
  return PLATFORM_SIMPLE_ICONS[slug]?.path;
}

export function platformIconHex(slug: CatalogSlug): string | undefined {
  return PLATFORM_SIMPLE_ICONS[slug]?.hex;
}