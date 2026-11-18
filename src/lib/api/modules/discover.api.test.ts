import { describe, expect, test, vi } from "vitest";
import { createDiscoverApi } from "./discover.api";

describe("discover.api", () => {
  test("forYou calls GET /discover/for-you", async () => {
    const request = vi.fn().mockResolvedValue({ rails: [], goalPattern: null, yourTopics: [], starterLists: [] });
    await createDiscoverApi({ request }).forYou();
    expect(request).toHaveBeenCalledWith({
      path: "/discover/for-you",
      method: "GET",
    });
  });

  test("search passes query", async () => {
    const request = vi.fn().mockResolvedValue({ items: [] });
    await createDiscoverApi({ request }).search("demo", 5);
    expect(request).toHaveBeenCalledWith({
      path: "/discover/search",
      method: "GET",
      query: { q: "demo", limit: 5 },
    });
  });
});