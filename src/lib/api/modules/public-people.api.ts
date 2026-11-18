import { ApiError } from "../errors";
import {
  decodePersonHeader,
  decodePeopleTopics,
  decodePublicProblemsList,
  decodePublicTopicHeader,
  type ListPublicProblemsQuery,
  type PeopleActivityResponse,
  type PeopleTopicBoardRow,
  type PersonHeader,
  type PublicProblemsListResponse,
  type PublicTopicHeader,
} from "./people.api";
import { decodeProgressActivity } from "./progress.api";

async function publicFetch<T>(
  path: string,
  decode: (value: unknown) => T,
  signal?: AbortSignal,
): Promise<T | "unavailable"> {
  const url = `/api${path}`;
  try {
    const res = await fetch(url, { signal, credentials: "omit" });
    if (res.status === 404) return "unavailable";
    if (!res.ok) throw new ApiError("http", `Public request failed (${res.status}).`, res.status);
    return decode(await res.json());
  } catch (error) {
    throw error;
  }
}

export function createPublicPeopleApi() {
  return {
    async getProfile(handle: string, signal?: AbortSignal) {
      return publicFetch(
        `/public/people/${encodeURIComponent(handle.trim())}`,
        decodePersonHeader,
        signal,
      ) as Promise<PersonHeader | "unavailable">;
    },
    async getActivity(handle: string, weeks = 12, signal?: AbortSignal) {
      return publicFetch(
        `/public/people/${encodeURIComponent(handle.trim())}/activity?weeks=${weeks}`,
        decodeProgressActivity,
        signal,
      ) as Promise<PeopleActivityResponse | "unavailable">;
    },
    async getTopics(handle: string, signal?: AbortSignal) {
      const result = await publicFetch(
        `/public/people/${encodeURIComponent(handle.trim())}/topics`,
        decodePeopleTopics,
        signal,
      );
      if (result === "unavailable") return "unavailable";
      return result.items;
    },
    async getTopicHeader(
      handle: string,
      topicId: string,
      signal?: AbortSignal,
    ): Promise<PublicTopicHeader | "unavailable"> {
      return publicFetch(
        `/public/people/${encodeURIComponent(handle.trim())}/topics/${encodeURIComponent(topicId)}`,
        decodePublicTopicHeader,
        signal,
      );
    },
    async listTopicProblems(
      handle: string,
      topicId: string,
      query: ListPublicProblemsQuery = { page: 1, pageSize: 50 },
      signal?: AbortSignal,
    ): Promise<PublicProblemsListResponse | "unavailable"> {
      const params = new URLSearchParams();
      if (query.page) params.set("page", String(query.page));
      if (query.pageSize) params.set("pageSize", String(query.pageSize));
      if (query.status) params.set("status", query.status);
      if (query.platform) params.set("platform", query.platform);
      const qs = params.toString();
      return publicFetch(
        `/public/people/${encodeURIComponent(handle.trim())}/topics/${encodeURIComponent(topicId)}/problems${qs ? `?${qs}` : ""}`,
        decodePublicProblemsList,
        signal,
      );
    },
  };
}

export type PublicPeopleApi = ReturnType<typeof createPublicPeopleApi>;