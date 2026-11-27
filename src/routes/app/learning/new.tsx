import { Meta, Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";
import { AppPageContainer } from "../../../components/app/AppPageContainer";
import { GuideCreateForm } from "../../../components/learning/guides/GuideCreateForm";
import { LearningFeatureGate } from "../../../components/learning/LearningFeatureGate";
import { useAuth } from "../../../lib/auth/context";
import { createLearningGuidesApi } from "../../../lib/api/modules/learning-guides.api";
import { learningGuidePath } from "../../../lib/learning/paths";

export default function LearningNewGuidePage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const api = createLearningGuidesApi(auth.productClient);
  const [pending, setPending] = createSignal(false);
  const [error, setError] = createSignal<string | undefined>();

  async function onSubmit(input: { title: string; description: string }) {
    if (pending()) return;
    setPending(true);
    setError(undefined);
    try {
      const receipt = await api.create({
        title: input.title,
        description: input.description,
        operationId: crypto.randomUUID(),
      });
      navigate(learningGuidePath(receipt.resourceId));
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Could not create guide.");
    } finally {
      setPending(false);
    }
  }

  return (
    <LearningFeatureGate>
      <Title>New guide</Title>
      <Meta name="robots" content="noindex" />
      <AppPageContainer>
        <div class="mx-auto max-w-lg rounded-panel border border-line bg-surface p-6">
          <h1 class="mb-4 text-section font-semibold tracking-tight text-ink">New guide</h1>
          <GuideCreateForm pending={pending()} error={error()} onSubmit={onSubmit} />
        </div>
      </AppPageContainer>
    </LearningFeatureGate>
  );
}