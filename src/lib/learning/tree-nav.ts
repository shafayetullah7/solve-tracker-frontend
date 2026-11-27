export type StudyNode = {
  id: string;
  parentId: string | null;
  title: string;
};

export function studyNeighbors(
  nodes: readonly StudyNode[],
  currentId: string,
): { previous: StudyNode | null; next: StudyNode | null } {
  const idx = nodes.findIndex((node) => node.id === currentId);
  if (idx < 0) return { previous: null, next: null };
  return {
    previous: idx > 0 ? (nodes[idx - 1] ?? null) : null,
    next: idx < nodes.length - 1 ? (nodes[idx + 1] ?? null) : null,
  };
}

export function ancestors(
  nodes: readonly StudyNode[],
  nodeId: string,
): StudyNode[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const trail: StudyNode[] = [];
  let current = byId.get(nodeId);
  while (current?.parentId) {
    const parent = byId.get(current.parentId);
    if (!parent) break;
    trail.unshift(parent);
    current = parent;
  }
  return trail;
}