import { Title } from "@solidjs/meta";
import { createMemo, createSignal, Match, onCleanup, onSettled, Switch } from "solid-js";
import { DashboardActivitySection } from "../../components/dashboard/DashboardActivitySection";
import { DashboardPageHeader } from "../../components/dashboard/DashboardPageHeader";
import { DashboardPlatformGrid } from "../../components/dashboard/DashboardPlatformGrid";
import { DashboardQueueGrid } from "../../components/dashboard/DashboardQueueGrid";
import { DashboardStatsStrip } from "../../components/dashboard/DashboardStatsStrip";
import { DashboardToolbar } from "../../components/dashboard/DashboardToolbar";
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

function latestWeekCounts(data: ProgressActivityResponse | undefined) {
  const week = data?.weeks.at(-1);
  return { added: week?.added ?? 0, solved: week?.solved ?? 0 };
}

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

  const isRefreshing = createMemo(
    () =>
      loadStatus() === "loading" ||
      previewsStatus() === "loading" ||
      activityStatus() === "loading",
  );

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
          {(counts) => {
            const week = () => latestWeekCounts(activity());
            return (
              <div class="space-y-6">
                <DashboardPageHeader platforms={platforms()} />
                <DashboardToolbar
                  total={counts().total}
                  unsolvedCount={counts().unsolved}
                  untaggedCount={
                    previewsStatus() === "ready" ? previews()?.untaggedTotal : undefined
                  }
                  onRefresh={() => void loadProgress()}
                  refreshing={isRefreshing()}
                />
                <DashboardStatsStrip
                  counts={counts()}
                  platformCount={platforms().length}
                  weekSolved={activityStatus() === "ready" ? week().solved : undefined}
                  weekAdded={activityStatus() === "ready" ? week().added : undefined}
                />
                <DashboardQueueGrid
                  status={previewsStatus()}
                  focus={previews()?.focus ?? []}
                  recentAdded={previews()?.recentAdded ?? []}
                  recentSolved={previews()?.recentSolved ?? []}
                  errorMessage={previewsError()}
                  onRetry={() => void loadPreviews()}
                />
                <div class="grid gap-6 lg:grid-cols-2 lg:items-start">
                  <div class="space-y-6">
                    <DashboardTopicProgressList topics={topics()} />
                    <DashboardPlatformGrid platforms={platforms()} />
                  </div>
                  <DashboardActivitySection
                    status={activityStatus()}
                    data={activity()}
                    errorMessage={activityError()}
                    onRetry={() => void loadActivity()}
                  />
                </div>
              </div>
            );
          }}
        </Match>
      </Switch>
    </div>
  );
}