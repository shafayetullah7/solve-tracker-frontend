import { describe, expect, test, vi } from "vitest";
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
          completionMode: "structural",
          contentRevision: "1",
          requirementRevision: "1",
        },
      ],
    });
    const tree = await createLearningGuidesApi({ request }).tree(guide.id);
    expect(tree.nodes).toHaveLength(1);
    expect(tree.structureRevision).toBe("2");
  });

  test("rejects invalid guide ids", async () => {
    const request = vi.fn();
    await expect(
      createLearningGuidesApi({ request }).get("bad-id"),
    ).rejects.toThrow(ApiError);
    expect(request).not.toHaveBeenCalled();
  });
});