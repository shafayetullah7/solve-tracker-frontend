import { Title } from "@solidjs/meta";
import { createSignal, Match, onCleanup, onSettled, Switch } from "solid-js";
import { DashboardOverallPanel } from "../../components/dashboard/DashboardOverallPanel";
import { DashboardPageHeader } from "../../components/dashboard/DashboardPageHeader";
import { DashboardPreviewGrid } from "../../components/dashboard/DashboardPreviewGrid";
import { DashboardQuickLinks } from "../../components/dashboard/DashboardQuickLinks";
import { DashboardActivitySection } from "../../components/dashboard/DashboardActivitySection";
import { DashboardPlatformGrid } from "../../components/dashboard/DashboardPlatformGrid";
import { DashboardTopicProgressList } from "../../components/dashboard/DashboardTopicProgressList";
import { Button } from "../../components/ui/Button";
import { LoadingPlaceholder } from "../../components/ui/LoadingPlaceholder";
import { useAuth } from "../../lib/auth/context";
import {
  createProgressApi,
  type PlatformProgress,
  type ProgressActivityResponse,
  type ProgressCounts,
  type TopicProgress,
} from "../../lib/api/modules/progress.api";
import { createProblemsApi } from "../../lib/api/modules/problems.api";
import {
  loadDashboardPreviews,
  type DashboardPreviews,
} from "../../lib/dashboard/load-dashboard-previews";
import { problemListMessage, progressMessage } from "../../lib/problems/messages";

type LoadStatus = "idle" | "loading" | "ready" | "error";
type PreviewsStatus = "idle" | "loading" | "ready" | "error";
type ActivityStatus = "idle" | "loading" | "ready" | "error";

const ACTIVITY_WEEKS = 12;

export default function DashboardPage() {
  const auth = useAuth();
  const progressApi = createProgressApi(auth.productClient);
  const problemsApi = createProblemsApi(auth.productClient);

  const [loadStatus, setLoadStatus] = createSignal<LoadStatus>("idle");
  const [overall, setOverall] = createSignal<ProgressCounts | undefined>();
  const [topics, setTopics] = createSignal<TopicProgress[]>([]);
  const [platforms, setPlatforms] = createSignal<PlatformProgress[]>([]);
  const [errorMessage, setErrorMessage] = createSignal<string | undefined>();

  const [previewsStatus, setPreviewsStatus] = createSignal<PreviewsStatus>("idle");
  const [previews, setPreviews] = createSignal<DashboardPreviews | undefined>();
  const [previewsError, setPreviewsError] = createSignal<string | undefined>();

  const [activityStatus, setActivityStatus] = createSignal<ActivityStatus>("idle");
  const [activity, setActivity] = createSignal<ProgressActivityResponse | undefined>();
  const [activityError, setActivityError] = createSignal<string | undefined>();

  let previewsAbort: AbortController | undefined;
  let activityAbort: AbortController | undefined;

  async function loadPreviews() {
    previewsAbort?.abort();
    const controller = new AbortController();
    previewsAbort = controller;
    const { signal } = controller;

    setPreviewsStatus("loading");
    setPreviewsError(undefined);
    try {
      const data = await loadDashboardPreviews(problemsApi, signal);
      if (signal.aborted) return;
      setPreviews(data);
      setPreviewsStatus("ready");
    } catch (error) {
      if (signal.aborted) return;
      setPreviewsStatus("error");
      setPreviewsError(problemListMessage(error));
    }
  }

  async function loadActivity() {
    activityAbort?.abort();
    const controller = new AbortController();
    activityAbort = controller;
    const { signal } = controller;

    setActivityStatus("loading");
    setActivityError(undefined);
    try {
      const data = await progressApi.getActivity(ACTIVITY_WEEKS, signal);
      if (signal.aborted) return;
      setActivity(data);
      setActivityStatus("ready");
    } catch (error) {
      if (signal.aborted) return;
      setActivityStatus("error");
      setActivityError(problemListMessage(error));
    }
  }

  async function loadProgress() {
    setLoadStatus("loading");
    setErrorMessage(undefined);
    setPreviewsStatus("idle");
    setPreviews(undefined);
    setPreviewsError(undefined);
    setActivityStatus("idle");
    setActivity(undefined);
    setActivityError(undefined);
    try {
      const data = await progressApi.getSummaries();
      setOverall(data.overall);
      setTopics(data.topics);
      setPlatforms(data.platforms);
      setLoadStatus("ready");
      void loadPreviews();
      void loadActivity();
    } catch (error) {
      setOverall(undefined);
      setTopics([]);
      setPlatforms([]);
      setPreviewsStatus("idle");
      setPreviews(undefined);
      setActivityStatus("idle");
      setActivity(undefined);
      setLoadStatus("error");
      setErrorMessage(progressMessage(error));
    }
  }

  onSettled(() => {
    if (auth.status() === "authenticated") void loadProgress();
  });

  onCleanup(() => {
    previewsAbort?.abort();
    activityAbort?.abort();
  });

  return (
    <div class="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <Title>Dashboard — Practice</Title>

      <Switch>
        <Match when={loadStatus() === "idle" || loadStatus() === "loading"}>
          <DashboardPageHeader />
          <div class="mt-8">
            <LoadingPlaceholder variant="block" />
          </div>
        </Match>
        <Match when={loadStatus() === "error"}>
          <DashboardPageHeader />
          <div class="mt-8 space-y-4">
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
            <div class="space-y-8">
              <DashboardPageHeader />
              <div class="space-y-8">
                <DashboardQuickLinks
                  unsolvedCount={counts().unsolved}
                  untaggedCount={
                    previewsStatus() === "ready" ? previews()?.untaggedTotal : undefined
                  }
                />
                <DashboardOverallPanel counts={counts()} />
                <DashboardPreviewGrid
                  status={previewsStatus()}
                  focus={previews()?.focus ?? []}
                  recentAdded={previews()?.recentAdded ?? []}
                  recentSolved={previews()?.recentSolved ?? []}
                  errorMessage={previewsError()}
                  onRetry={() => void loadPreviews()}
                />
                <DashboardActivitySection
                  status={activityStatus()}
                  data={activity()}
                  errorMessage={activityError()}
                  onRetry={() => void loadActivity()}
                />
                <div
                  class="space-y-8 border-t border-line pt-8"
                  aria-label="Library breakdown"
                >
                  <DashboardTopicProgressList topics={topics()} />
                  <DashboardPlatformGrid platforms={platforms()} />
                </div>
              </div>
            </div>
          )}
        </Match>
      </Switch>
    </div>
  );
}