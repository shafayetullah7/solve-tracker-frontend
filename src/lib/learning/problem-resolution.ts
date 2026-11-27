import type { NodeResponse } from "../api/modules/learning-guides.api";

export type ProblemResolution = "unresolved" | "linked_unsolved" | "solved";

export function problemResolutionBadgeText(resolution: ProblemResolution): string {
  if (resolution === "unresolved") return "Not in your library";
  if (resolution === "linked_unsolved") return "In library · not solved (manual)";
  return "Solved (manual)";
}

export function effectiveProblemResolution(
  resolution: ProblemResolution | undefined,
): ProblemResolution {
  return resolution ?? "unresolved";
}

export function hasOpenProblems(node: Pick<NodeResponse, "problemBlocks">): boolean {
  const blocks = node.problemBlocks;
  if (!blocks?.length) return false;
  return blocks.some((row) => row.problemResolution !== "solved");
}