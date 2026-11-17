import { describe, expect, test, vi } from "vitest";
import { createProblemsApi } from "./problems.api";
import { ApiError } from "../errors";

const problemId = "11111111-1111-4111-8111-111111111111";
const topicId = "22222222-2222-4222-8222-222222222222";

const problem = {
  id: problemId,
  title: "Two Sum",
  url: "https://leetcode.com/problems/two-sum/",
  platformSlug: "leetcode",
  platformProblemId: null,
  difficulty: null,
  rating: null,
  notes: null,
  status: "unsolved" as const,
  solvedAt: null,
  topics: [{ id: topicId, name: "Arrays" }],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("typed problems API", () => {
  test("lists problems with pagination and topicId filter", async () => {
    const request = vi.fn().mockResolvedValue({
      items: [problem],
      meta: { page: 2, pageSize: 10, total: 1 },
    });
    const result = await createProblemsApi({ request }).list({
      page: 2,
      pageSize: 10,
      topicId,
    });
    expect(result).toEqual({
      items: [problem],
      meta: { page: 2, pageSize: 10, total: 1 },
    });
    expect(request).toHaveBeenCalledWith({
      path: "/problems",
      query: { page: 2, pageSize: 10, topicId },
      signal: undefined,
      recoverAuth: true,
    });
  });

  test("decodes empty list", async () => {
    const request = vi.fn().mockResolvedValue({
      items: [],
      meta: { page: 1, pageSize: 25, total: 0 },
    });
    await expect(createProblemsApi({ request }).list()).resolves.toEqual({
      items: [],
      meta: { page: 1, pageSize: 25, total: 0 },
    });
  });

  test("creates and decodes without extra fields", async () => {
    const request = vi.fn().mockResolvedValue({
      ...problem,
      normalizedUrl: "hidden",
    });
    expect(
      await createProblemsApi({ request }).create({
        title: "Two Sum",
        url: problem.url,
        topicIds: [],
        status: "unsolved",
      }),
    ).toEqual(problem);
    expect(request.mock.calls[0][0]).toMatchObject({
      path: "/problems",
      method: "POST",
      recoverAuth: true,
    });
  });

  test("list encodes search and filter query params", async () => {
    const request = vi.fn().mockResolvedValue({
      items: [],
      meta: { page: 1, pageSize: 25, total: 0 },
    });
    const api = createProblemsApi({ request });
    await api.list({
      page: 1,
      pageSize: 25,
      q: "two",
      status: "unsolved",
      platform: "leetcode",
      topicIds: [topicId],
      untagged: "true",
      sort: "createdAt",
      order: "desc",
    });
    expect(request).toHaveBeenCalledWith({
      path: "/problems",
      query: {
        page: 1,
        pageSize: 25,
        q: "two",
        status: "unsolved",
        platform: "leetcode",
        topicIds: [topicId],
        untagged: "true",
        sort: "createdAt",
        order: "desc",
      },
      signal: undefined,
      recoverAuth: true,
    });
  });

  test("rejects invalid list payloads", async () => {
    await expect(
      createProblemsApi({
        request: vi.fn().mockResolvedValue({ items: [], meta: { page: 1 } }),
      }).list(),
    ).rejects.toMatchObject({ kind: "contract" });
  });

  test("decodes platformSlug other", async () => {
    const request = vi.fn().mockResolvedValue({
      ...problem,
      platformSlug: "other",
      url: "https://example.com/p",
    });
    const result = await createProblemsApi({ request }).getOne(problemId);
    expect(result.platformSlug).toBe("other");
  });

  test("rejects invalid problem bodies", async () => {
    await expect(
      createProblemsApi({
        request: vi.fn().mockResolvedValue({ ...problem, topics: undefined }),
      }).getOne(problemId),
    ).rejects.toMatchObject({ kind: "contract" });
    await expect(
      createProblemsApi({
        request: vi.fn().mockResolvedValue({ ...problem, status: "maybe" }),
      }).getOne(problemId),
    ).rejects.toMatchObject({ kind: "contract" });
  });

  test("rejects invalid problem ids before calling transport", async () => {
    const request = vi.fn();
    const api = createProblemsApi({ request });
    await expect(api.getOne("not-a-uuid")).rejects.toThrow(ApiError);
    await expect(api.update("not-a-uuid", { title: "X" })).rejects.toThrow(
      ApiError,
    );
    await expect(api.delete("not-a-uuid")).rejects.toThrow(ApiError);
    expect(request).not.toHaveBeenCalled();
  });

  test("setStatus patches completion only", async () => {
    const request = vi.fn().mockResolvedValue({
      ...problem,
      status: "solved" as const,
      solvedAt: "2026-01-02T00:00:00.000Z",
    });
    const api = createProblemsApi({ request });
    const result = await api.setStatus(problemId, "solved");
    expect(result.status).toBe("solved");
    expect(request).toHaveBeenCalledWith({
      path: `/problems/${problemId}`,
      method: "PATCH",
      body: { status: "solved" },
      signal: undefined,
      recoverAuth: true,
    });
  });

  test("get, update, and delete enable auth recovery", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(problem)
      .mockResolvedValueOnce(problem)
      .mockResolvedValueOnce(undefined);
    const api = createProblemsApi({ request });
    await api.getOne(problemId);
    await api.update(problemId, { title: "Edited" });
    await api.delete(problemId);
    expect(request.mock.calls[0][0]).toMatchObject({
      path: `/problems/${problemId}`,
      recoverAuth: true,
    });
    expect(request.mock.calls[1][0]).toMatchObject({
      path: `/problems/${problemId}`,
      method: "PATCH",
      recoverAuth: true,
    });
    expect(request.mock.calls[2][0]).toMatchObject({
      path: `/problems/${problemId}`,
      method: "DELETE",
      recoverAuth: true,
    });
  });
});