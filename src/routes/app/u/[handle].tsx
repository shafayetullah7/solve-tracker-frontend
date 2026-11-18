import { Title, Meta } from "@solidjs/meta";
import { useParams } from "@solidjs/router";
import { createEffect, createSignal, Match, onCleanup, Show, Switch } from "solid-js";
import { AppPageContainer } from "../../../components/app/AppPageContainer";
import { DashboardActivitySection } from "../../../components/dashboard/DashboardActivitySection";
import { DashboardPlatformGrid } from "../../../components/dashboard/DashboardPlatformGrid";
import { DashboardStatsStrip } from "../../../components/dashboard/DashboardStatsStrip";
import { PeopleProfileHeader } from "../../../components/people/PeopleProfileHeader";
import { PeoplePublicListCards } from "../../../components/people/PeoplePublicListCards";
import { PeopleTopicBoard } from "../../../components/people/PeopleTopicBoard";
import { PeopleUnavailable } from "../../../components/people/PeopleUnavailable";
import { PeopleViewAsBanner } from "../../../components/people/PeopleViewAsBanner";
import { FormAlert } from "../../../components/ui/FormAlert";
import { LoadingPlaceholder } from "../../../components/ui/LoadingPlaceholder";
import { useAuth } from "../../../lib/auth/context";
import { formatHandleLabel } from "../../../lib/auth/user-handle";
import {
  createPeopleApi,
  type PeopleTopicBoardRow,
  type PersonHeader,
  type PeopleActivityResponse,
} from "../../../lib/api/modules/people.api";
import { DiscoverSimilarRail } from "../../../components/discover/DiscoverSimilarRail";
import { PeopleSafetyMenu } from "../../../components/people/PeopleSafetyMenu";
import { createDiscoverApi } from "../../../lib/api/modules/discover.api";
import { trackDiscoverEvent } from "../../../lib/discover/track";
import { isDiscoverOff } from "../../../lib/discover/flag";

const ACTIVITY_WEEKS = 12;

type SectionStatus = "idle" | "loading" | "ready" | "error";

export default function PeopleProfilePage() {
  const params = useParams();
  const handle = () => params.handle?.trim() ?? "";
  const auth = useAuth();
  const peopleApi = createPeopleApi(auth.productClient);
  const discoverApi = createDiscoverApi(auth.productClient);

  const [profile, setProfile] = createSignal<PersonHeader | undefined>();
  const [profileStatus, setProfileStatus] = createSignal<SectionStatus>("idle");
  const [unavailable, setUnavailable] = createSignal(false);

  const [activityStatus, setActivityStatus] = createSignal<SectionStatus>("idle");
  const [activity, setActivity] = createSignal<PeopleActivityResponse | undefined>();
  const [activityError, setActivityError] = createSignal<string | undefined>();

  const [topicsStatus, setTopicsStatus] = createSignal<SectionStatus>("idle");
  const [topics, setTopics] = createSignal<PeopleTopicBoardRow[]>([]);
  const [topicsError, setTopicsError] = createSignal<string | undefined>();
  const [topicsAllowed, setTopicsAllowed] = createSignal(false);

  let profileAbort: AbortController | undefined;
  let sectionAbort: AbortController | undefined;

  const viewerIsSubject = () =>
    auth.status() === "authenticated" &&
    auth.user()?.handle.toLowerCase() === handle().toLowerCase();

  async function loadProfile() {
    profileAbort?.abort();
    const controller = new AbortController();
    profileAbort = controller;
    setProfileStatus("loading");
    setUnavailable(false);
    setProfile(undefined);

    const result = await peopleApi.getProfile(handle(), controller.signal);
    if (controller.signal.aborted) return;
    if (!result.ok) {
      setUnavailable(true);
      setProfileStatus("ready");
      return;
    }
    setProfile(result.data);
    setProfileStatus("ready");
    trackDiscoverEvent("discover_profile_view", "people-profile");
    void loadSections(controller.signal);
  }

  async function loadSections(parentSignal?: AbortSignal) {
    sectionAbort?.abort();
    const controller = new AbortController();
    sectionAbort = controller;
    if (parentSignal) {
      parentSignal.addEventListener("abort", () => controller.abort(), { once: true });
    }

    setActivityStatus("loading");
    setTopicsStatus("loading");
    setActivityError(undefined);
    setTopicsError(undefined);

    const h = handle();
    const [activityResult, topicsResult] = await Promise.allSettled([
      peopleApi.getActivity(h, ACTIVITY_WEEKS, controller.signal),
      peopleApi.getTopics(h, controller.signal),
    ]);

    if (controller.signal.aborted) return;

    if (activityResult.status === "fulfilled") {
      if (activityResult.value === "unavailable") {
        setActivityStatus("error");
        setActivityError("This section is not available.");
      } else {
        setActivity(activityResult.value);
        setActivityStatus("ready");
      }
    } else {
      setActivityStatus("error");
      setActivityError("Could not load activity.");
    }

    if (topicsResult.status === "fulfilled") {
      if (topicsResult.value === "unavailable") {
        setTopicsAllowed(false);
        setTopics([]);
        setTopicsStatus("ready");
      } else {
        setTopicsAllowed(true);
        setTopics(topicsResult.value.items);
        setTopicsStatus("ready");
      }
    } else {
      setTopicsStatus("error");
      setTopicsError("Could not load topics.");
    }
  }

  createEffect(
    () => handle(),
    (h) => {
      if (!h) return;
      void loadProfile();
    },
  );

  onCleanup(() => {
    profileAbort?.abort();
    sectionAbort?.abort();
  });

  const weekCounts = () => {
    const week = activity()?.weeks.at(-1);
    return { added: week?.added ?? 0, solved: week?.solved ?? 0 };
  };

  return (
    <AppPageContainer>
      <Title>{formatHandleLabel(handle())} · Practice</Title>
      <Meta name="robots" content="noindex" />

      <Show when={profileStatus() === "loading" && !profile()}>
        <LoadingPlaceholder variant="block" />
      </Show>

      <Show when={unavailable()}>
        <PeopleUnavailable />
      </Show>

      <Show when={profile()}>
        {(p) => (
          <div class="space-y-8">
            <PeopleViewAsBanner show={viewerIsSubject()} />
            <PeopleProfileHeader
              profile={p()}
              showFollow={!viewerIsSubject() && !isDiscoverOff()}
              follow={() => peopleApi.follow(handle())}
              unfollow={() => peopleApi.unfollow(handle())}
            />
            <Show when={!viewerIsSubject() && !isDiscoverOff()}>
              <PeopleSafetyMenu
                onBlock={() => peopleApi.block(handle())}
                onReport={(reason) => discoverApi.reportPractice(handle(), reason)}
              />
            </Show>
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
              errorMessage={activityError()}
              onRetry={() => void loadSections()}
            />
            <div class="grid gap-8 lg:grid-cols-2">
              <DashboardPlatformGrid platforms={p().platforms} readOnly />
              <Show when={topicsAllowed()}>
                <Switch>
                  <Match when={topicsStatus() === "loading"}>
                    <LoadingPlaceholder variant="block" />
                  </Match>
                  <Match when={topicsStatus() === "error"}>
                    <FormAlert variant="error">
                      {topicsError()}
                      <button
                        type="button"
                        class="ml-2 font-medium underline"
                        onClick={() => void loadSections()}
                      >
                        Try again
                      </button>
                    </FormAlert>
                  </Match>
                  <Match when={topicsStatus() === "ready"}>
                    <PeopleTopicBoard handle={p().handle} rows={topics()} />
                  </Match>
                </Switch>
              </Show>
            </div>
            <Show when={topicsAllowed() && topicsStatus() === "ready"}>
              <PeoplePublicListCards handle={p().handle} rows={topics()} />
            </Show>
            <DiscoverSimilarRail handle={p().handle} />
          </div>
        )}
      </Show>
    </AppPageContainer>
  );
}