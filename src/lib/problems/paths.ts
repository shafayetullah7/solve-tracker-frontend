import { appProblems } from "../app/product-routes";
import type { ListProblemsQuery } from "../api/modules/problems.api";
import { serializeBrowseSearch } from "./browse-query";

const PROBLEMS_ROOT = appProblems();

export function problemDetailPath(id: string): string {
  return `${PROBLEMS_ROOT}/${id}`;
}

export function problemEditPath(id: string): string {
  return `${PROBLEMS_ROOT}/${id}/edit`;
}

export function problemNewPath(topicId?: string): string {
  if (!topicId) return `${PROBLEMS_ROOT}/new`;
  return `${PROBLEMS_ROOT}/new?${new URLSearchParams({ topicId }).toString()}`;
}

export function problemsBrowseHref(query: ListProblemsQuery): string {
  const qs = serializeBrowseSearch(query);
  return qs ? `${PROBLEMS_ROOT}?${qs}` : PROBLEMS_ROOT;
}