import { Meta, Title } from "@solidjs/meta";
import { AppPageContainer } from "../../../components/app/AppPageContainer";
import { GuideLibraryWorkspace } from "../../../components/learning/guides/GuideLibraryWorkspace";
import { LearningFeatureGate } from "../../../components/learning/LearningFeatureGate";
import { useAuth } from "../../../lib/auth/context";
import { createLearningGuidesApi } from "../../../lib/api/modules/learning-guides.api";
import { LIBRARY_PAGE_SUBTITLE } from "../../../lib/learning/learning-product-copy";
import { learningImportPath, learningNewGuidePath } from "../../../lib/learning/paths";

export default function LearningLibraryPage() {
  const auth = useAuth();
  const api = createLearningGuidesApi(auth.productClient);

  return (
    <LearningFeatureGate>
      <Title>My guides</Title>
      <Meta name="robots" content="noindex" />
      <AppPageContainer>
        <header class="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 class="text-page font-semibold tracking-tight text-ink">My guides</h1>
            <p class="mt-1 text-body text-muted">{LIBRARY_PAGE_SUBTITLE}</p>
          </div>
          <a
            class="ui-button inline-flex items-center min-h-11"
            data-variant="secondary"
            href={learningImportPath()}
          >
            Import guide
          </a>
          <a
            class="ui-button inline-flex items-center min-h-11"
            data-variant="primary"
            href={learningNewGuidePath()}
          >
            New guide
          </a>
        </header>
        <GuideLibraryWorkspace api={api} authStatus={() => auth.status()} />
      </AppPageContainer>
    </LearningFeatureGate>
  );
}