import { learningGuidePath, learningStudyPath } from "./paths";

export type GuideResumeLabel = "Continue" | "Open guide";

export function resumeHrefForGuide(
  guideId: string,
  resumeNodeId: string | null,
  firstNodeId?: string | null,
): { href: string; label: GuideResumeLabel } {
  if (resumeNodeId) {
    return { href: learningStudyPath(guideId, resumeNodeId), label: "Continue" };
  }
  if (firstNodeId) {
    return { href: learningStudyPath(guideId, firstNodeId), label: "Continue" };
  }
  return { href: learningGuidePath(guideId), label: "Open guide" };
}