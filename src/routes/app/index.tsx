import { Title } from "@solidjs/meta";
import {
  createSignal,
  For,
  Match,
  onSettled,
  Show,
  Switch,
} from "solid-js";
import { Button } from "../../components/ui/Button";
import { LoadingPlaceholder } from "../../components/ui/LoadingPlaceholder";
import { Panel } from "../../components/ui/Panel";
import { useAuth } from "../../lib/auth/context";
import {
  createProgressApi,
  type ProgressCounts,
  type TopicProgress,
} from "../../lib/api/modules/progress.api";
import { progressMessage } from "../../lib/problems/messages";
import {
  formatTopicProgress,
  overallPercentComplete,
} from "../../lib/problems/progress-display";
import { problemNewPath } from "../../lib/problems/paths";
import { paths } from "../../router";

type LoadStatus = "idle" | "loading" | "ready" | "error";

export default function DashboardPage() {
  const auth = useAuth();
  const progressApi = createProgressApi(auth.productClient);

  const [loadStatus, setLoadStatus] = createSignal<LoadStatus>("idle");
  const [overall, setOverall] = createSignal<ProgressCounts | undefined>();
  const [topics, setTopics] = createSignal<TopicProgress[]>([]);
  const [errorMessage, setErrorMessage] = createSignal<string | undefined>();

  async function loadProgress() {
    setLoadStatus("loading");
    setErrorMessage(undefined);
    try {
      const data = await progressApi.getSummaries();
      setOverall(data.overall);
      setTopics(data.topics);
      setLoadStatus("ready");
    } catch (error) {
      setOverall(undefined);
      setTopics([]);
      setLoadStatus("error");
      setErrorMessage(progressMessage(error));
    }
  }

  onSettled(() => {
    if (auth.status() === "authenticated") void loadProgress();
  });

  return (
    <div class="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <Title>Dashboard — Practice</Title>
      <h1 class="text-page font-semibold tracking-tight">Your practice</h1>

      <div class="mt-8 space-y-8">
        <Switch>
          <Match when={loadStatus() === "idle" || loadStatus() === "loading"}>
            <LoadingPlaceholder variant="block" />
          </Match>
          <Match when={loadStatus() === "error"}>
            <div class="space-y-4">
              <p class="text-muted" role="status">
                {errorMessage()}
              </p>
              <Button variant="secondary" onClick={() => void loadProgress()}>
                Try again
              </Button>
            </div>
          </Match>
          <Match when={loadStatus() === "ready" && overall()}>
            {(counts) => (
              <>
                <Panel title="Overall" description="Counts across your full library.">
                  <p class="text-body tabular-nums">
                    <span class="font-medium">{counts().total}</span> total ·{" "}
                    <span class="font-medium">{counts().solved}</span> solved ·{" "}
                    <span class="font-medium">{counts().unsolved}</span> unsolved ·{" "}
                    <span class="font-medium">{overallPercentComplete(counts())}%</span>{" "}
                    complete
                  </p>
                  <Show when={counts().total === 0}>
                    <p class="mt-4 text-muted">
                      You have not saved any problems yet.{" "}
                      <a
                        class="text-brand underline-offset-4 hover:underline"
                        href={problemNewPath()}
                      >
                        Add a problem
                      </a>{" "}
                      or{" "}
                      <a
                        class="text-brand underline-offset-4 hover:underline"
                        href={paths.app.topics()}
                      >
                        manage topics
                      </a>{" "}
                      to get started.
                    </p>
                  </Show>
                </Panel>

                <section aria-labelledby="dashboard-by-topic">
                  <h2 id="dashboard-by-topic" class="text-section font-semibold">
                    By topic
                  </h2>
                  <Show
                    when={topics().length > 0}
                    fallback={
                      <p class="mt-4 text-muted">
                        No topics yet.{" "}
                        <a
                          class="text-brand underline-offset-4 hover:underline"
                          href={paths.app.topics()}
                        >
                          Create topics
                        </a>{" "}
                        to organize your library.
                      </p>
                    }
                  >
                    <ul class="mt-4 divide-y divide-line border border-line rounded-panel bg-surface">
                      <For each={topics()}>
                        {(row) => (
                          <li class="flex flex-wrap items-baseline justify-between gap-2 px-5 py-4">
                            <a
                              class="text-body font-medium text-brand underline-offset-4 hover:underline"
                              href={`${paths.app.problems()}?topicId=${row.id}`}
                            >
                              {row.name}
                            </a>
                            <span class="text-sm text-muted tabular-nums">
                              {formatTopicProgress(row)}
                            </span>
                          </li>
                        )}
                      </For>
                    </ul>
                  </Show>
                </section>
              </>
            )}
          </Match>
        </Switch>
      </div>
    </div>
  );
}