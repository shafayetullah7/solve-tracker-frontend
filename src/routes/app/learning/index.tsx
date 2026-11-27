import { Meta, Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { createEffect, createSignal, For, Match, onCleanup, Show, Switch } from "solid-js";
import { AppPageContainer } from "../../../components/app/AppPageContainer";
import { LearningFeatureGate } from "../../../components/learning/LearningFeatureGate";
import { Button } from "../../../components/ui/Button";
import { FormAlert } from "../../../components/ui/FormAlert";
import { LoadingPlaceholder } from "../../../components/ui/LoadingPlaceholder";
import { useAuth } from "../../../lib/auth/context";
import {
  createLearningGuidesApi,
  type GuideResponse,
} from "../../../lib/api/modules/learning-guides.api";
import { learningGuidePath, learningNewGuidePath } from "../../../lib/learning/paths";

type LoadStatus = "idle" | "loading" | "ready" | "error";

export default function LearningLibraryPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const api = createLearningGuidesApi(auth.productClient);

  const [status, setStatus] = createSignal<LoadStatus>("idle");
  const [guides, setGuides] = createSignal<GuideResponse[]>([]);
  const [error, setError] = createSignal<string | undefined>();

  createEffect(
    () => auth.status(),
    (status) => {
      if (status !== "authenticated") return;
      const controller = new AbortController();
      setStatus("loading");
      setError(undefined);
      void api
        .list({ page: 1, pageSize: 50, status: "active" }, controller.signal)
        .then((body) => {
          setGuides(body.items);
          setStatus("ready");
        })
        .catch((cause: unknown) => {
          if (controller.signal.aborted) return;
          setError(cause instanceof Error ? cause.message : "Could not load guides.");
          setStatus("error");
        });
      onCleanup(() => controller.abort());
    },
  );

  return (
    <LearningFeatureGate>
      <Title>My guides</Title>
      <Meta name="robots" content="noindex" />
      <AppPageContainer>
        <header class="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 class="text-page font-semibold tracking-tight text-ink">My guides</h1>
            <p class="mt-1 text-body text-muted">
              Private study paths. Build a tree, then open steps to study.
            </p>
          </div>
          <a class="ui-button inline-flex items-center" data-variant="primary" href={learningNewGuidePath()}>
            New guide
          </a>
        </header>
        <Switch>
          <Match when={status() === "loading" || status() === "idle"}>
            <LoadingPlaceholder variant="block" />
          </Match>
          <Match when={status() === "error"}>
            <FormAlert variant="error">{error()}</FormAlert>
          </Match>
          <Match when={status() === "ready"}>
            <Show
              when={guides().length > 0}
              fallback={
                <div class="rounded-panel border border-line bg-surface p-6">
                  <p class="text-body text-muted">You have no guides yet.</p>
                  <Button
                    type="button"
                    class="mt-4"
                    onClick={() => navigate(learningNewGuidePath())}
                  >
                    Create your first guide
                  </Button>
                </div>
              }
            >
              <ul class="divide-y divide-line rounded-panel border border-line bg-surface">
                <For each={guides()}>
                  {(guide) => (
                    <li>
                      <a
                        href={learningGuidePath(guide.id)}
                        class="flex min-h-11 flex-col gap-1 px-4 py-3 hover:bg-surface-muted"
                      >
                        <span class="text-label font-medium text-ink">{guide.title}</span>
                        <Show when={guide.description}>
                          <span class="text-sm text-muted">{guide.description}</span>
                        </Show>
                      </a>
                    </li>
                  )}
                </For>
              </ul>
            </Show>
          </Match>
        </Switch>
      </AppPageContainer>
    </LearningFeatureGate>
  );
}