import { Title } from "@solidjs/meta";
import { createEffect, createMemo, createSignal, Match, onCleanup, Show, Switch } from "solid-js";
import { DashboardActivitySection } from "../../components/dashboard/DashboardActivitySection";
import { DashboardContinueLearningSection } from "../../components/dashboard/DashboardContinueLearningSection";
import { LearningWelcomeBanner } from "../../components/dashboard/LearningWelcomeBanner";
import { DashboardPageHeader } from "../../components/dashboard/DashboardPageHeader";
import { DashboardPlatformGrid } from "../../components/dashboard/DashboardPlatformGrid";
import { DashboardQueueGrid } from "../../components/dashboard/DashboardQueueGrid";
import { DashboardStatsStrip } from "../../components/dashboard/DashboardStatsStrip";
import { AppPageContainer } from "../../components/app/AppPageContainer";
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
import { createLearningGuidesApi } from "../../lib/api/modules/learning-guides.api";
import {
  loadDashboardContinueLearning,
  type DashboardContinueGuide,
} from "../../lib/dashboard/load-dashboard-continue-learning";
import {
  loadDashboardPreviews,
  type DashboardPreviews,
} from "../../lib/dashboard/load-dashboard-previews";
import { isLearningGuidesEnabled } from "../../lib/learning/flag";
import { problemListMessage, progressMessage } from "../../lib/problems/messages";
import { DiscoverPeopleLikeYouCard } from "../../components/dashboard/DiscoverPeopleLikeYouCard";
import { DiscoverBenchmarkCard } from "../../components/dashboard/DiscoverBenchmarkCard";
import { DiscoverLaunchBanner } from "../../components/dashboard/DiscoverLaunchBanner";
import { isDiscoverFullEnabled } from "../../lib/discover/flag";

type DomainStatus = "idle" | "loading" | "ready" | "error";

const ACTIVITY_WEEKS = 12;

function latestWeekCounts(data: ProgressActivityResponse | undefined) {
  const week = data?.weeks.at(-1);
  return { added: week?.added ?? 0, solved: week?.solved ?? 0 };
}

export default function DashboardPage() {
  const auth = useAuth();
  const progressApi = createProgressApi(auth.productClient);
  const problemsApi = createProblemsApi(auth.productClient);
  const learningGuidesApi = createLearningGuidesApi(auth.productClient);

  const [summaryStatus, setSummaryStatus] = createSignal<DomainStatus>("idle");
  const [overall, setOverall] = createSignal<ProgressCounts | undefined>();
  const [topics, setTopics] = createSignal<TopicProgress[]>([]);
  const [platforms, setPlatforms] = createSignal<PlatformProgress[]>([]);
  const [summaryError, setSummaryError] = createSignal<string | undefined>();

  const [previewsStatus, setPreviewsStatus] = createSignal<DomainStatus>("idle");
  const [previews, setPreviews] = createSignal<DashboardPreviews | undefined>();
  const [previewsError, setPreviewsError] = createSignal<string | undefined>();

  const [activityStatus, setActivityStatus] = createSignal<DomainStatus>("idle");
  const [activity, setActivity] = createSignal<ProgressActivityResponse | undefined>();
  const [activityError, setActivityError] = createSignal<string | undefined>();

  const [learningStatus, setLearningStatus] = createSignal<DomainStatus>("idle");
  const [learningItems, setLearningItems] = createSignal<DashboardContinueGuide[]>([]);
  const [learningError, setLearningError] = createSignal<string | undefined>();

  let previewsAbort: AbortController | undefined;
  let activityAbort: AbortController | undefined;
  let learningAbort: AbortController | undefined;

  const isRefreshing = createMemo(
    () =>
      summaryStatus() === "loading" ||
      previewsStatus() === "loading" ||
      activityStatus() === "loading" ||
      learningStatus() === "loading",
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

  async function loadContinueLearning() {
    if (!isLearningGuidesEnabled()) return;

    learningAbort?.abort();
    const controller = new AbortController();
    learningAbort = controller;
    const { signal } = controller;

    setLearningStatus("loading");
    setLearningError(undefined);
    try {
      const data = await loadDashboardContinueLearning(learningGuidesApi, signal);
      if (signal.aborted) return;
      setLearningItems(data);
      setLearningStatus("ready");
    } catch (error) {
      if (signal.aborted) return;
      setLearningStatus("error");
      setLearningError(problemListMessage(error));
    }
  }

  async function loadSummaries() {
    setSummaryStatus("loading");
    setSummaryError(undefined);
    try {
      const data = await progressApi.getSummaries();
      setOverall(data.overall);
      setTopics(data.topics);
      setPlatforms(data.platforms);
      setSummaryStatus("ready");
    } catch (error) {
      setOverall(undefined);
      setTopics([]);
      setPlatforms([]);
      setSummaryStatus("error");
      setSummaryError(progressMessage(error));
    }
  }

  function refreshDashboard() {
    void loadSummaries();
    void loadPreviews();
    void loadActivity();
    void loadContinueLearning();
  }

  createEffect(
    () => auth.status(),
    (status) => {
      if (status !== "authenticated") return;
      refreshDashboard();
    },
  );

  onCleanup(() => {
    previewsAbort?.abort();
    activityAbort?.abort();
    learningAbort?.abort();
  });

  const week = () => latestWeekCounts(activity());

  return (
    <AppPageContainer>
      <Title>Dashboard — Practice</Title>

      <Show
        when={auth.status() === "authenticated"}
        fallback={
          <div class="mt-8">
            <LoadingPlaceholder variant="block" />
          </div>
        }
      >
        <div class="space-y-6">
          <DashboardPageHeader
            platforms={summaryStatus() === "ready" ? platforms() : undefined}
          />

          <LearningWelcomeBanner authStatus={() => auth.status()} />

          <Show when={isLearningGuidesEnabled()}>
            <DashboardContinueLearningSection
              status={learningStatus()}
              items={learningItems()}
              errorMessage={learningError()}
              onRetry={() => void loadContinueLearning()}
            />
          </Show>

          <Switch>
            <Match when={summaryStatus() === "ready" && overall()}>
              {(counts) => (
                <>
                  <DashboardToolbar
                    total={counts().total}
                    unsolvedCount={counts().unsolved}
                    untaggedCount={
                      previewsStatus() === "ready" ? previews()?.untaggedTotal : undefined
                    }
                    onRefresh={refreshDashboard}
                    refreshing={isRefreshing()}
                  />
                  <DashboardStatsStrip
                    counts={counts()}
                    platformCount={platforms().length}
                    weekSolved={activityStatus() === "ready" ? week().solved : undefined}
                    weekAdded={activityStatus() === "ready" ? week().added : undefined}
                  />
                </>
              )}
            </Match>
            <Match when={summaryStatus() === "loading" || summaryStatus() === "idle"}>
              <LoadingPlaceholder variant="block" />
            </Match>
            <Match when={summaryStatus() === "error"}>
              <div class="space-y-4" role="status">
                <p class="text-muted">{summaryError()}</p>
                <Button variant="secondary" onClick={() => void loadSummaries()}>
                  Try again
                </Button>
              </div>
            </Match>
          </Switch>

          <Show when={isDiscoverFullEnabled()}>
            <DiscoverLaunchBanner />
            <DiscoverBenchmarkCard />
          </Show>

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
              <Show when={isDiscoverFullEnabled()}>
                <DiscoverPeopleLikeYouCard />
              </Show>
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
      </Show>
    </AppPageContainer>
  );
}