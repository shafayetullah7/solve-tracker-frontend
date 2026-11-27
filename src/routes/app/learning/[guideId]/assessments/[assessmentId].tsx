import { Meta, Title } from "@solidjs/meta";
import { useParams, useSearchParams } from "@solidjs/router";
import { Show } from "solid-js";
import { AppPageContainer } from "../../../../../components/app/AppPageContainer";
import { AssessmentWorkspace } from "../../../../../components/learning/assessment/AssessmentWorkspace";
import { LearningFeatureGate } from "../../../../../components/learning/LearningFeatureGate";
import { useAuth } from "../../../../../lib/auth/context";

export default function LearningAssessmentPage() {
  const params = useParams<{ guideId: string; assessmentId: string }>();
  const [search] = useSearchParams<{ step?: string }>();
  const auth = useAuth();

  return (
    <LearningFeatureGate>
      <Title>Assessment</Title>
      <Meta name="robots" content="noindex" />
      <AppPageContainer>
        <Show when={auth.status() === "authenticated"}>
          <AssessmentWorkspace
            guideId={params.guideId}
            assessmentId={params.assessmentId}
            returnNodeId={typeof search.step === "string" ? search.step : undefined}
            client={auth.productClient}
          />
        </Show>
      </AppPageContainer>
    </LearningFeatureGate>
  );
}