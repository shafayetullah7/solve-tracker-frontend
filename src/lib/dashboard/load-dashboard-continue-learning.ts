import type {
  createLearningGuidesApi,
  EnrollmentResponse,
  GuideResponse,
  TreeResponse,
} from "../api/modules/learning-guides.api";
import { resumeHrefForGuide } from "../learning/resume-guide";

export const CONTINUE_LEARNING_LIMIT = 5;

export type DashboardContinueGuide = {
  guide: GuideResponse;
  resumeNodeId: string | null;
  progress?: TreeResponse["progress"];
  resumeHref: string;
  resumeLabel: "Continue" | "Open guide";
};

type LearningGuidesApi = ReturnType<typeof createLearningGuidesApi>;

function rowFromGuide(
  guide: GuideResponse,
  enrollment: EnrollmentResponse | undefined,
  tree: TreeResponse | undefined,
): DashboardContinueGuide {
  const resumeNodeId = enrollment?.resumeNodeId ?? null;
  const firstNodeId = tree?.nodes[0]?.id ?? null;
  const { href, label } = resumeHrefForGuide(guide.id, resumeNodeId, firstNodeId);
  return {
    guide,
    resumeNodeId,
    progress: tree?.progress,
    resumeHref: href,
    resumeLabel: label,
  };
}

export async function loadDashboardContinueLearning(
  api: LearningGuidesApi,
  signal?: AbortSignal,
): Promise<DashboardContinueGuide[]> {
  const list = await api.list(
    { page: 1, pageSize: CONTINUE_LEARNING_LIMIT, status: "active" },
    signal,
  );

  const rows = await Promise.all(
    list.items.map(async (guide) => {
      const [enrollmentResult, treeResult] = await Promise.allSettled([
        api.enrollment(guide.id, signal),
        api.tree(guide.id, signal),
      ]);
      const enrollment =
        enrollmentResult.status === "fulfilled" ? enrollmentResult.value : undefined;
      const tree = treeResult.status === "fulfilled" ? treeResult.value : undefined;
      return rowFromGuide(guide, enrollment, tree);
    }),
  );

  return rows;
}