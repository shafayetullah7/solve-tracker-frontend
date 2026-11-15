import type {
  createProblemsApi,
  ProblemResponse,
  ProblemStatus,
} from "../api/modules/problems.api";

type ProblemsApi = ReturnType<typeof createProblemsApi>;

export function nextCompletionStatus(current: ProblemStatus): ProblemStatus {
  return current === "solved" ? "unsolved" : "solved";
}

export function completionButtonVariant(
  status: ProblemStatus,
): "primary" | "secondary" {
  return status === "unsolved" ? "primary" : "secondary";
}

export function completionButtonLabel(
  status: ProblemStatus,
  pending: boolean,
): string {
  if (pending) return "Updating…";
  return status === "solved" ? "Revert to unsolved" : "Mark solved";
}

/** Server-authoritative completion toggle; no optimistic local status. */
export async function applyCompletionUpdate(
  api: ProblemsApi,
  problemId: string,
  nextStatus: ProblemStatus,
  signal?: AbortSignal,
): Promise<ProblemResponse> {
  return api.setStatus(problemId, nextStatus, signal);
}