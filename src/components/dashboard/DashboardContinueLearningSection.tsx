import { For, Match, Show, Switch } from "solid-js";
import { DASHBOARD_CONTINUE_LEARNING_HINT } from "../../lib/dashboard/activity-contract-copy";
import type { DashboardContinueGuide } from "../../lib/dashboard/load-dashboard-continue-learning";
import {
  learningGuidePath,
  learningImportPath,
  learningLibraryPath,
  learningNewGuidePath,
} from "../../lib/learning/paths";
import { Button } from "../ui/Button";
import { LoadingPlaceholder } from "../ui/LoadingPlaceholder";

type DashboardContinueLearningSectionProps = {
  status: "idle" | "loading" | "ready" | "error";
  items: DashboardContinueGuide[];
  errorMessage?: string;
  onRetry?: () => void;
};

function ContinueLearningHeader() {
  return (
    <>
      <h2 id="dashboard-continue-learning" class="text-section font-semibold">
        Continue learning
      </h2>
      <p class="mt-1 text-sm text-muted">{DASHBOARD_CONTINUE_LEARNING_HINT}</p>
    </>
  );
}

export function DashboardContinueLearningSection(
  props: DashboardContinueLearningSectionProps,
) {
  return (
    <Switch>
      <Match when={props.status === "idle" || props.status === "loading"}>
        <section aria-labelledby="dashboard-continue-learning">
          <ContinueLearningHeader />
          <div class="mt-4">
            <LoadingPlaceholder variant="block" />
          </div>
        </section>
      </Match>
      <Match when={props.status === "error"}>
        <section aria-labelledby="dashboard-continue-learning">
          <ContinueLearningHeader />
          <div class="mt-4 space-y-4" role="alert">
            <p class="text-muted">
              {props.errorMessage ?? "Could not load your guides."}
            </p>
            {props.onRetry ? (
              <Button variant="secondary" onClick={() => props.onRetry!()}>
                Try again
              </Button>
            ) : null}
          </div>
        </section>
      </Match>
      <Match when={props.status === "ready"}>
        <section aria-labelledby="dashboard-continue-learning">
          <ContinueLearningHeader />
          <Show
            when={props.items.length > 0}
            fallback={
              <p class="mt-4 text-muted">
                No guides yet.{" "}
                <a
                  class="text-brand underline-offset-4 hover:underline"
                  href={learningNewGuidePath()}
                >
                  New guide
                </a>
                ,{" "}
                <a
                  class="text-brand underline-offset-4 hover:underline"
                  href={learningImportPath()}
                >
                  import
                </a>
                , or browse{" "}
                <a
                  class="text-brand underline-offset-4 hover:underline"
                  href={learningLibraryPath()}
                >
                  all guides
                </a>
                .
              </p>
            }
          >
            <ul class="mt-4 divide-y divide-line rounded-panel border border-line bg-surface shadow-panel">
              <For each={props.items}>
                {(row) => (
                  <li class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div class="min-w-0 space-y-1">
                      <a
                        class="font-medium text-ink underline-offset-4 hover:text-brand hover:underline"
                        href={learningGuidePath(row.guide.id)}
                      >
                        {row.guide.title}
                      </a>
                      <Show
                        when={
                          row.progress && row.progress.totalRequired > 0
                            ? row.progress
                            : undefined
                        }
                      >
                        {(progress) => (
                          <p class="text-sm text-muted">
                            Progress: {progress().completedRequired} /{" "}
                            {progress().totalRequired} required steps
                            <Show when={progress().percent !== null}>
                              {" "}
                              ({progress().percent}%)
                            </Show>
                          </p>
                        )}
                      </Show>
                    </div>
                    <a
                      class="ui-button inline-flex shrink-0"
                      data-variant="primary"
                      href={row.resumeHref}
                    >
                      {row.resumeLabel}
                    </a>
                  </li>
                )}
              </For>
            </ul>
          </Show>
        </section>
      </Match>
    </Switch>
  );
}