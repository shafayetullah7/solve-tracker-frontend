import { describe, expect, test } from "vitest";
import { indentNode, moveSibling, outdentNode, planPlacement } from "./placement";

const nodes = [
  { id: "a", parentId: null, position: 0 },
  { id: "b", parentId: "a", position: 0 },
  { id: "c", parentId: "a", position: 1 },
] as const;

describe("placement helpers", () => {
  test("moveSibling down moves b after c", () => {
    expect(moveSibling(nodes, "b", "down")).toEqual({
      parentId: "a",
      beforeNodeId: null,
    });
  });

  test("indent b under a as first child when valid", () => {
    expect(indentNode(nodes, "c")).toEqual({ parentId: "b", beforeNodeId: null });
  });

  test("outdent b to root level", () => {
    const nested = [
      { id: "a", parentId: null, position: 0 },
      { id: "b", parentId: "a", position: 0 },
    ];
    expect(outdentNode(nested, "b")).toEqual({ parentId: null, beforeNodeId: null });
  });

  test("planPlacement rejects cycles", () => {
    expect(() => planPlacement(nodes, "a", "b", null)).toThrow(/cycle/i);
  });
});