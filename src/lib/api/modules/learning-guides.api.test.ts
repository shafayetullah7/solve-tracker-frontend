import { describe, expect, test, vi } from "vitest";
import { completionMode } from "../../learning/completion-modes";
import { createLearningGuidesApi } from "./learning-guides.api";
import { ApiError } from "../errors";

const guide = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "Algorithms",
  description: "",
  structureRevision: "1",
  metadataRevision: "1",
  archivedAt: null,
  deletedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("typed learning guides API", () => {
  test("lists guides with pagination", async () => {
    const request = vi.fn().mockResolvedValue({
      items: [guide],
      meta: { page: 1, pageSize: 25, total: 1 },
    });
    const result = await createLearningGuidesApi({ request }).list();
    expect(result.items[0]?.title).toBe("Algorithms");
    expect(request).toHaveBeenCalledWith({
      path: "/learning/guides",
      query: {},
      signal: undefined,
      recoverAuth: true,
    });
  });

  test("list forwards search and status query", async () => {
    const request = vi.fn().mockResolvedValue({
      items: [],
      meta: { page: 1, pageSize: 25, total: 0 },
    });
    await createLearningGuidesApi({ request }).list({
      page: 1,
      pageSize: 25,
      status: "archived",
      search: "algo",
    });
    expect(request).toHaveBeenCalledWith({
      path: "/learning/guides",
      query: {
        page: 1,
        pageSize: 25,
        status: "archived",
        search: "algo",
      },
      signal: undefined,
      recoverAuth: true,
    });
  });

  test("lifecycle patches guide", async () => {
    const request = vi.fn().mockResolvedValue({ resourceId: guide.id, replayed: false });
    await createLearningGuidesApi({ request }).lifecycle(guide.id, {
      action: "archive",
      expectedMetadataRevision: "1",
      operationId: "33333333-3333-4333-8333-333333333333",
    });
    expect(request).toHaveBeenCalledWith({
      path: `/learning/guides/${guide.id}/lifecycle`,
      method: "PATCH",
      body: {
        action: "archive",
        expectedMetadataRevision: "1",
        operationId: "33333333-3333-4333-8333-333333333333",
      },
      signal: undefined,
      recoverAuth: true,
    });
  });

  test("decodes tree response", async () => {
    const request = vi.fn().mockResolvedValue({
      structureRevision: "2",
      nodes: [
        {
          id: "22222222-2222-4222-8222-222222222222",
          parentId: null,
          title: "Intro",
          position: 0,
          required: true,
          completionMode: completionMode.Structural,
          contentRevision: "1",
          requirementRevision: "1",
          completed: false,
        },
      ],
      progress: {
        completedRequired: 0,
        totalRequired: 1,
        percent: 0,
      },
    });
    const tree = await createLearningGuidesApi({ request }).tree(guide.id);
    expect(tree.nodes).toHaveLength(1);
    expect(tree.structureRevision).toBe("2");
    expect(tree.progress.totalRequired).toBe(1);
    expect(tree.nodes[0]?.completed).toBe(false);
  });

  test("loads node content", async () => {
    const request = vi.fn().mockResolvedValue({
      contentRevision: "3",
      blocks: [
        {
          id: "33333333-3333-4333-8333-333333333333",
          position: 0,
          type: "text",
          payload: { body: "Hello" },
          schemaVersion: 1,
        },
      ],
    });
    const content = await createLearningGuidesApi({ request }).nodeContent(
      guide.id,
      "22222222-2222-4222-8222-222222222222",
    );
    expect(content.blocks[0]?.payload).toEqual({ body: "Hello" });
    expect(request).toHaveBeenCalledWith({
      path: "/learning/guides/11111111-1111-4111-8111-111111111111/nodes/22222222-2222-4222-8222-222222222222/content",
      signal: undefined,
      recoverAuth: true,
    });
  });

  test("moveNode calls placement endpoint", async () => {
    const request = vi.fn().mockResolvedValue({ resourceId: guide.id, replayed: false });
    await createLearningGuidesApi({ request }).moveNode(guide.id, "22222222-2222-4222-8222-222222222222", {
      parentId: null,
      beforeNodeId: null,
      expectedStructureRevision: "1",
      operationId: "33333333-3333-4333-8333-333333333333",
    });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/learning/guides/11111111-1111-4111-8111-111111111111/nodes/22222222-2222-4222-8222-222222222222/placement",
        method: "PATCH",
      }),
    );
  });

  test("deleteNode sends revision headers", async () => {
    const request = vi.fn().mockResolvedValue(undefined);
    await createLearningGuidesApi({ request }).deleteNode(
      guide.id,
      "22222222-2222-4222-8222-222222222222",
      {
        expectedStructureRevision: "4",
        operationId: "33333333-3333-4333-8333-333333333333",
      },
    );
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "DELETE",
        headers: {
          "X-Expected-Revision": "4",
          "X-Operation-Id": "33333333-3333-4333-8333-333333333333",
        },
        response: "empty",
      }),
    );
  });

  test("rejects invalid guide ids", async () => {
    const request = vi.fn();
    await expect(
      createLearningGuidesApi({ request }).get("bad-id"),
    ).rejects.toThrow(ApiError);
    expect(request).not.toHaveBeenCalled();
  });
});