import { useParams } from "@solidjs/router";
import { createEffect, createSignal, Match, Show, Switch } from "solid-js";
import { AppPageContainer } from "../../components/app/AppPageContainer";
import { DashboardActivitySection } from "../../components/dashboard/DashboardActivitySection";
import { DashboardPlatformGrid } from "../../components/dashboard/DashboardPlatformGrid";
import { DashboardStatsStrip } from "../../components/dashboard/DashboardStatsStrip";
import { PeopleProfileHeader } from "../../components/people/PeopleProfileHeader";
import { PeoplePublicListCards } from "../../components/people/PeoplePublicListCards";
import { PeoplePublicSeo } from "../../components/people/PeoplePublicSeo";
import { PeopleTopicBoard } from "../../components/people/PeopleTopicBoard";
import { PeopleUnavailable } from "../../components/people/PeopleUnavailable";
import { Button } from "../../components/ui/Button";
import { LoadingPlaceholder } from "../../components/ui/LoadingPlaceholder";
import { createPublicPeopleApi } from "../../lib/api/modules/public-people.api";
import type { PeopleActivityResponse, PeopleTopicBoardRow, PersonHeader } from "../../lib/api/modules/people.api";
import { discoverCopy } from "../../lib/discover/copy";
import { publicPeopleTopicPath } from "../../lib/people/paths";
import { paths } from "../../router";

const ACTIVITY_WEEKS = 12;
const publicApi = createPublicPeopleApi();

type SectionStatus = "idle" | "loading" | "ready" | "error";

export default function PublicPeopleProfilePage() {
  const params = useParams();
  const handle = () => params.handle?.trim() ?? "";

  const [profile, setProfile] = createSignal<PersonHeader | undefined>();
  const [profileStatus, setProfileStatus] = createSignal<SectionStatus>("idle");
  const [unavailable, setUnavailable] = createSignal(false);

  const [activityStatus, setActivityStatus] = createSignal<SectionStatus>("idle");
  const [activity, setActivity] = createSignal<PeopleActivityResponse | undefined>();

  const [topics, setTopics] = createSignal<PeopleTopicBoardRow[]>([]);
  const [topicsStatus, setTopicsStatus] = createSignal<SectionStatus>("idle");

  let profileAbort: AbortController | undefined;

  async function loadPublicProfile(h: string) {
    profileAbort?.abort();
    const controller = new AbortController();
    profileAbort = controller;
    setProfileStatus("loading");
    setUnavailable(false);
    setProfile(undefined);
    setActivityStatus("idle");
    setTopicsStatus("idle");

    const result = await publicApi.getProfile(h, controller.signal);
    if (controller.signal.aborted) return;
    if (result === "unavailable") {
      setUnavailable(true);
      setProfileStatus("ready");
      return;
    }
    setProfile(result);
    setProfileStatus("ready");
    setActivityStatus("loading");
    const act = await publicApi.getActivity(h, ACTIVITY_WEEKS, controller.signal);
    if (controller.signal.aborted) return;
    if (act !== "unavailable") {
      setActivity(act);
      setActivityStatus("ready");
    } else {
      setActivityStatus("error");
    }
    setTopicsStatus("loading");
    const topicsResult = await publicApi.getTopics(h, controller.signal);
    if (controller.signal.aborted) return;
    if (topicsResult !== "unavailable") {
      setTopics(topicsResult);
    } else {
      setTopics([]);
    }
    setTopicsStatus("ready");
  }

  createEffect(
    () => handle(),
    (h) => {
      if (!h) return;
      void loadPublicProfile(h);
    },
  );

  const weekCounts = () => {
    const weeks = activity()?.weeks ?? [];
    const last = weeks[weeks.length - 1];
    return { solved: last?.solved ?? 0, added: last?.added ?? 0 };
  };

  const registerNext = () =>
    `/register?next=${encodeURIComponent(`/app/u/${encodeURIComponent(handle())}`)}`;

  return (
    <main id="main-content" class="flex min-h-0 flex-1 flex-col bg-canvas">
      <PeoplePublicSeo profile={profile()} />
      <AppPageContainer>
        <Show when={profileStatus() === "loading" && !profile()}>
          <LoadingPlaceholder variant="block" />
        </Show>
        <Show when={unavailable()}>
          <PeopleUnavailable />
        </Show>
        <Show when={profile()}>
          {(p) => (
            <div class="space-y-8">
              <PeopleProfileHeader profile={p()} />
              <div class="flex flex-wrap gap-2">
                <a href={registerNext()}>
                  <Button type="button">{discoverCopy("public.signUpToCompare")}</Button>
                </a>
                <a href={paths.login()}>
                  <Button type="button" variant="secondary">
                    Sign in
                  </Button>
                </a>
              </div>
              <DashboardStatsStrip
                readOnly
                counts={p().overall}
                platformCount={p().platforms.length}
                weekSolved={weekCounts().solved}
                weekAdded={weekCounts().added}
              />
              <DashboardActivitySection
                readOnly
                status={activityStatus()}
                data={activity()}
              />
              <div class="grid gap-8 lg:grid-cols-2">
                <DashboardPlatformGrid platforms={p().platforms} readOnly />
                <Switch>
                  <Match when={topicsStatus() === "loading"}>
                    <LoadingPlaceholder variant="block" />
                  </Match>
                  <Match when={topics().length > 0}>
                    <PeopleTopicBoard
                      handle={p().handle}
                      rows={topics()}
                      topicHref={publicPeopleTopicPath}
                    />
                  </Match>
                </Switch>
              </div>
              <PeoplePublicListCards
                handle={p().handle}
                rows={topics()}
                topicHref={(h, id) => publicPeopleTopicPath(h, id)}
              />
            </div>
          )}
        </Show>
      </AppPageContainer>
    </main>
  );
}