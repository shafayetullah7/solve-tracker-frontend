import { describe, expect, test } from "vitest";
import { ancestors, studyNeighbors } from "./tree-nav";

const tree = [
  { id: "a", parentId: null, title: "Root A" },
  { id: "b", parentId: "a", title: "Child B" },
  { id: "c", parentId: "a", title: "Child C" },
  { id: "d", parentId: null, title: "Root D" },
];

describe("studyNeighbors", () => {
  test("returns previous and next in preorder", () => {
    expect(studyNeighbors(tree, "b")).toEqual({
      previous: tree[0],
      next: tree[2],
    });
    expect(studyNeighbors(tree, "a").next?.id).toBe("b");
    expect(studyNeighbors(tree, "d").previous?.id).toBe("c");
  });
});

describe("ancestors", () => {
  test("walks parent chain", () => {
    expect(ancestors(tree, "b").map((n) => n.id)).toEqual(["a"]);
    expect(ancestors(tree, "a")).toEqual([]);
  });
});