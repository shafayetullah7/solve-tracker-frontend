import type { ApiClient } from "../client";
import type { operations } from "../generated/backend";

export type DiscoverPersonCard =
  operations["DiscoverController_forYou"]["responses"][200]["content"]["application/json"]["rails"][number]["people"][number];

export type DiscoverRail =
  operations["DiscoverController_forYou"]["responses"][200]["content"]["application/json"]["rails"][number];

export type DiscoverRailKind = DiscoverRail["kind"];

export type DiscoverForYouResponse =
  operations["DiscoverController_forYou"]["responses"][200]["content"]["application/json"];

export type DiscoverPeopleListResponse =
  operations["DiscoverController_people"]["responses"][200]["content"]["application/json"];

export type DiscoverSearchResponse =
  operations["DiscoverController_search"]["responses"][200]["content"]["application/json"];

export type DiscoverSimilarResponse =
  operations["PeopleController_similar"]["responses"][200]["content"]["application/json"];

export type DiscoverTopicsDirectoryResponse =
  operations["DiscoverController_topicsDirectory"]["responses"][200]["content"]["application/json"];

export type DiscoverTopicHubResponse =
  operations["DiscoverController_topicHub"]["responses"][200]["content"]["application/json"];

export type DiscoverTopicHintsResponse =
  operations["DiscoverController_topicHints"]["responses"][200]["content"]["application/json"];

export type DiscoverHubProblemsResponse =
  operations["DiscoverController_topicProblems"]["responses"][200]["content"]["application/json"];

export type DiscoverProblemCommunityResponse =
  operations["DiscoverController_problemCommunity"]["responses"][200]["content"]["application/json"];

export type CompareResponse =
  operations["DiscoverController_comparePeers"]["responses"][200]["content"]["application/json"];

export type BenchmarkResponse =
  operations["DiscoverController_benchmark"]["responses"][200]["content"]["application/json"];

export type DiscoverPeopleQuery = NonNullable<
  operations["DiscoverController_people"]["parameters"]["query"]
>;

export function createDiscoverApi(client: ApiClient) {
  return {
    async search(q: string, limit = 10): Promise<DiscoverSearchResponse> {
      return client.request({
        path: "/discover/search",
        method: "GET",
        query: { q, limit },
      }) as Promise<DiscoverSearchResponse>;
    },
    async forYou(): Promise<DiscoverForYouResponse> {
      return client.request({
        path: "/discover/for-you",
        method: "GET",
      }) as Promise<DiscoverForYouResponse>;
    },
    async listPeople(
      query: DiscoverPeopleQuery = {},
    ): Promise<DiscoverPeopleListResponse> {
      return client.request({
        path: "/discover/people",
        method: "GET",
        query,
      }) as Promise<DiscoverPeopleListResponse>;
    },
    async similar(handle: string, limit = 8): Promise<DiscoverSimilarResponse> {
      return client.request({
        path: `/people/${encodeURIComponent(handle)}/similar`,
        method: "GET",
        query: { limit },
      }) as Promise<DiscoverSimilarResponse>;
    },
    async postEvents(events: { event: string; surface: string }[]) {
      return client.request({
        path: "/discover/events",
        method: "POST",
        body: { events },
      });
    },
    async reportPractice(handle: string, reason: string) {
      await client.request({
        path: "/discover/reports",
        method: "POST",
        body: { handle, reason },
        response: "empty",
        recoverAuth: true,
      });
    },
    async topicsDirectory(): Promise<DiscoverTopicsDirectoryResponse> {
      return client.request({
        path: "/discover/topics",
        method: "GET",
      }) as Promise<DiscoverTopicsDirectoryResponse>;
    },
    async topicHub(topicKey: string): Promise<DiscoverTopicHubResponse> {
      return client.request({
        path: `/discover/topics/${encodeURIComponent(topicKey)}`,
        method: "GET",
      }) as Promise<DiscoverTopicHubResponse>;
    },
    async topicProblems(topicKey: string, excludeMine = false) {
      return client.request({
        path: `/discover/topics/${encodeURIComponent(topicKey)}/problems`,
        method: "GET",
        query: { excludeMine: excludeMine ? "true" : undefined },
      }) as Promise<DiscoverHubProblemsResponse>;
    },
    async topicHints(): Promise<DiscoverTopicHintsResponse> {
      return client.request({
        path: "/discover/topic-hints",
        method: "GET",
      }) as Promise<DiscoverTopicHintsResponse>;
    },
    async problemCommunity(problemId: string) {
      return client.request({
        path: `/discover/problems/${encodeURIComponent(problemId)}/community`,
        method: "GET",
      }) as Promise<DiscoverProblemCommunityResponse>;
    },
    async comparePeers(weeks = 12): Promise<CompareResponse> {
      return client.request({
        path: "/discover/compare-peers",
        method: "GET",
        query: { weeks },
      }) as Promise<CompareResponse>;
    },
    async benchmark(): Promise<BenchmarkResponse> {
      return client.request({
        path: "/discover/benchmark",
        method: "GET",
      }) as Promise<BenchmarkResponse>;
    },
  };
}