import { describe, expect, test, vi } from "vitest";
import {
  CONTINUE_LEARNING_LIMIT,
  loadDashboardContinueLearning,
} from "./load-dashboard-continue-learning";

const guideId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const nodeId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

const guide = {
  id: guideId,
  title: "DSA path",
  description: null,
  status: "active" as const,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
  metadataRevision: "1",
};

const tree = {
  structureRevision: "1",
  nodes: [
    {
      id: nodeId,
      parentId: null,
      title: "Step 1",
      position: 1,
      required: true,
      completionMode: "structural",
      contentRevision: "1",
      requirementRevision: "1",
      completed: false,
    },
  ],
  progress: { completedRequired: 0, totalRequired: 1, percent: 0 },
};

describe("loadDashboardContinueLearning", () => {
  test("lists recent guides and fans out enrollment and tree", async () => {
    const list = vi.fn().mockResolvedValue({
      items: [guide],
      meta: { page: 1, pageSize: CONTINUE_LEARNING_LIMIT, total: 1 },
    });
    const enrollment = vi.fn().mockResolvedValue({
      id: "enroll-1",
      guideId,
      resumeNodeId: nodeId,
      lastActivityAt: "2026-01-02T00:00:00.000Z",
    });
    const treeFn = vi.fn().mockResolvedValue(tree);

    const result = await loadDashboardContinueLearning({
      list,
      enrollment,
      tree: treeFn,
    } as unknown as Parameters<typeof loadDashboardContinueLearning>[0]);

    expect(list).toHaveBeenCalledWith(
      { page: 1, pageSize: CONTINUE_LEARNING_LIMIT, status: "active" },
      undefined,
    );
    expect(enrollment).toHaveBeenCalledWith(guideId, undefined);
    expect(treeFn).toHaveBeenCalledWith(guideId, undefined);
    expect(result).toHaveLength(1);
    expect(result[0].guide).toEqual(guide);
    expect(result[0].resumeNodeId).toBe(nodeId);
    expect(result[0].progress).toEqual(tree.progress);
    expect(result[0].resumeHref).toBe(`/app/learning/${guideId}/study/${nodeId}`);
    expect(result[0].resumeLabel).toBe("Continue");
  });

  test("returns empty array when list has no items", async () => {
    const list = vi.fn().mockResolvedValue({
      items: [],
      meta: { page: 1, pageSize: CONTINUE_LEARNING_LIMIT, total: 0 },
    });

    const result = await loadDashboardContinueLearning({
      list,
    } as unknown as Parameters<typeof loadDashboardContinueLearning>[0]);

    expect(result).toEqual([]);
  });

  test("propagates list failure", async () => {
    const list = vi.fn().mockRejectedValue(new Error("list down"));

    await expect(
      loadDashboardContinueLearning({
        list,
      } as unknown as Parameters<typeof loadDashboardContinueLearning>[0]),
    ).rejects.toThrow("list down");
  });

  test("keeps guide row when enrollment or tree fails", async () => {
    const list = vi.fn().mockResolvedValue({
      items: [guide],
      meta: { page: 1, pageSize: 5, total: 1 },
    });
    const enrollment = vi.fn().mockRejectedValue(new Error("enroll fail"));
    const treeFn = vi.fn().mockResolvedValue(tree);

    const result = await loadDashboardContinueLearning({
      list,
      enrollment,
      tree: treeFn,
    } as unknown as Parameters<typeof loadDashboardContinueLearning>[0]);

    expect(result[0].resumeNodeId).toBeNull();
    expect(result[0].progress).toEqual(tree.progress);
    expect(result[0].resumeHref).toBe(`/app/learning/${guideId}/study/${nodeId}`);
    expect(result[0].resumeLabel).toBe("Continue");
  });

  test("falls back to guide overview when no resume and empty tree", async () => {
    const list = vi.fn().mockResolvedValue({
      items: [guide],
      meta: { page: 1, pageSize: 5, total: 1 },
    });
    const enrollment = vi.fn().mockResolvedValue({
      id: "enroll-1",
      guideId,
      resumeNodeId: null,
      lastActivityAt: null,
    });
    const treeFn = vi.fn().mockResolvedValue({
      ...tree,
      nodes: [],
      progress: { completedRequired: 0, totalRequired: 0, percent: null },
    });

    const result = await loadDashboardContinueLearning({
      list,
      enrollment,
      tree: treeFn,
    } as unknown as Parameters<typeof loadDashboardContinueLearning>[0]);

    expect(result[0].resumeHref).toBe(`/app/learning/${guideId}`);
    expect(result[0].resumeLabel).toBe("Open guide");
  });
});