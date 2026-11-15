import type { ListProblemsQuery } from "../api/modules/problems.api";
import { serializeBrowseSearch } from "./browse-query";

export function problemDetailPath(id: string): string {
  return `/problems/${id}`;
}

export function problemEditPath(id: string): string {
  return `/problems/${id}/edit`;
}

export function problemNewPath(topicId?: string): string {
  if (!topicId) return "/problems/new";
  return `/problems/new?${new URLSearchParams({ topicId }).toString()}`;
}

export function problemsBrowseHref(query: ListProblemsQuery): string {
  const qs = serializeBrowseSearch(query);
  return qs ? `/problems?${qs}` : "/problems";
}