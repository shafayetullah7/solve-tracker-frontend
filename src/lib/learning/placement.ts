export const MAX_NODES = 2000;
export const MAX_DEPTH = 32;
export const MAX_SIBLINGS = 500;

export type PlacementNode = {
  id: string;
  parentId: string | null;
  position: number;
};

export class PlacementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlacementError";
  }
}

export function buildHierarchy<T extends PlacementNode>(nodes: readonly T[]) {
  if (nodes.length > MAX_NODES) throw new PlacementError("Node limit exceeded.");
  const byId = new Map(nodes.map((node) => [node.id, node]));
  if (byId.size !== nodes.length) throw new PlacementError("Duplicate node.");
  const children = new Map<string | null, T[]>();
  for (const node of nodes) {
    if (node.parentId !== null && !byId.has(node.parentId))
      throw new PlacementError("Missing parent.");
    const siblings = children.get(node.parentId) ?? [];
    siblings.push(node);
    children.set(node.parentId, siblings);
  }
  for (const siblings of children.values()) {
    siblings.sort((a, b) => a.position - b.position);
    if (siblings.length > MAX_SIBLINGS || siblings.some((node, index) => node.position !== index))
      throw new PlacementError("Invalid sibling ordering.");
  }
  const preorder: T[] = [];
  const depths = new Map<string, number>();
  const heights = new Map<string, number>();
  function visit(node: T, depth: number): number {
    if (depth > MAX_DEPTH || depths.has(node.id)) throw new PlacementError("Invalid hierarchy.");
    depths.set(node.id, depth);
    preorder.push(node);
    let height = 1;
    for (const child of children.get(node.id) ?? [])
      height = Math.max(height, 1 + visit(child, depth + 1));
    heights.set(node.id, height);
    return height;
  }
  for (const root of children.get(null) ?? []) visit(root, 1);
  if (preorder.length !== nodes.length) throw new PlacementError("Unreachable nodes or cycle.");
  return { byId, children, preorder, depths, heights };
}

export function planPlacement<T extends PlacementNode>(
  nodes: readonly T[],
  movingId: string | null,
  parentId: string | null,
  beforeNodeId: string | null,
) {
  const tree = buildHierarchy(nodes);
  const moving = movingId === null ? undefined : tree.byId.get(movingId);
  if (movingId !== null && !moving) throw new PlacementError("Missing moving node.");
  if (!moving && nodes.length >= MAX_NODES) throw new PlacementError("Node limit exceeded.");
  if (parentId !== null && !tree.byId.has(parentId)) throw new PlacementError("Missing destination parent.");
  let ancestor = parentId;
  while (ancestor !== null) {
    if (ancestor === movingId) throw new PlacementError("Placement would create a cycle.");
    ancestor = tree.byId.get(ancestor)?.parentId ?? null;
  }
  const depth = parentId === null ? 0 : tree.depths.get(parentId)!;
  const height = moving ? tree.heights.get(moving.id)! : 1;
  if (depth + height > MAX_DEPTH) throw new PlacementError("Depth limit exceeded.");
  const destination = (tree.children.get(parentId) ?? []).filter((node) => node.id !== movingId);
  if (destination.length >= MAX_SIBLINGS) throw new PlacementError("Sibling limit exceeded.");
  const index =
    beforeNodeId === null
      ? destination.length
      : destination.findIndex((node) => node.id === beforeNodeId);
  if (index < 0) throw new PlacementError("Invalid destination anchor.");
  return {
    destination,
    index,
    unchanged:
      moving !== undefined &&
      moving.parentId === parentId &&
      moving.position === index,
  };
}

export function siblings<T extends PlacementNode>(
  nodes: readonly T[],
  parentId: string | null,
): T[] {
  return nodes
    .filter((node) => node.parentId === parentId)
    .slice()
    .sort((a, b) => a.position - b.position);
}

export type MovePlacement = {
  parentId: string | null;
  beforeNodeId: string | null;
};

export function moveSibling(
  nodes: readonly PlacementNode[],
  nodeId: string,
  direction: "up" | "down",
): MovePlacement | null {
  const tree = buildHierarchy(nodes);
  const node = tree.byId.get(nodeId);
  if (!node) return null;
  const ordered = tree.children.get(node.parentId) ?? [];
  const pos = ordered.findIndex((n) => n.id === nodeId);
  if (pos < 0) return null;
  if (direction === "up") {
    if (pos === 0) return null;
    const before = ordered[pos - 1];
    if (!before) return null;
    return { parentId: node.parentId, beforeNodeId: before.id };
  }
  if (pos >= ordered.length - 1) return null;
  const anchor = ordered[pos + 2];
  return { parentId: node.parentId, beforeNodeId: anchor?.id ?? null };
}

export function indentNode(
  nodes: readonly PlacementNode[],
  nodeId: string,
): MovePlacement | null {
  const tree = buildHierarchy(nodes);
  const node = tree.byId.get(nodeId);
  if (!node) return null;
  const list = tree.children.get(node.parentId) ?? [];
  const idx = list.findIndex((n) => n.id === nodeId);
  if (idx <= 0) return null;
  const newParent = list[idx - 1];
  if (!newParent) return null;
  try {
    planPlacement(nodes, nodeId, newParent.id, null);
  } catch {
    return null;
  }
  return { parentId: newParent.id, beforeNodeId: null };
}

export function outdentNode(
  nodes: readonly PlacementNode[],
  nodeId: string,
): MovePlacement | null {
  const tree = buildHierarchy(nodes);
  const node = tree.byId.get(nodeId);
  if (!node || node.parentId === null) return null;
  const parent = tree.byId.get(node.parentId);
  if (!parent) return null;
  const grandParent = parent.parentId;
  const uncleList = tree.children.get(grandParent) ?? [];
  const parentIdx = uncleList.findIndex((n) => n.id === parent.id);
  const before = uncleList[parentIdx + 1]?.id ?? null;
  try {
    planPlacement(nodes, nodeId, grandParent, before);
  } catch {
    return null;
  }
  return { parentId: grandParent, beforeNodeId: before };
}

export function tryPlanPlacement(
  nodes: readonly PlacementNode[],
  nodeId: string,
  parentId: string | null,
  beforeNodeId: string | null,
): { ok: true; placement: MovePlacement } | { ok: false; reason: string } {
  try {
    const result = planPlacement(nodes, nodeId, parentId, beforeNodeId);
    if (result.unchanged) return { ok: false, reason: "Already in this position." };
    return { ok: true, placement: { parentId, beforeNodeId } };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof PlacementError ? error.message : "Invalid placement.",
    };
  }
}