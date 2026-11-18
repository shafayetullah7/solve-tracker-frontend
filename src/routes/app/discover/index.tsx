import { createEffect, createSignal, For, Match, Show, Switch } from "solid-js";
import { DiscoverOnboardingSheet } from "../../../components/discover/DiscoverOnboardingSheet";
import { DiscoverRail } from "../../../components/discover/DiscoverRail";
import { DiscoverStarterLists } from "../../../components/discover/DiscoverStarterLists";
import { DiscoverTopicChip } from "../../../components/discover/DiscoverTopicChip";
import { DiscoverPatternCard } from "../../../components/discover/DiscoverPatternCard";
import { FormAlert } from "../../../components/ui/FormAlert";
import { LoadingPlaceholder } from "../../../components/ui/LoadingPlaceholder";
import { useAuth } from "../../../lib/auth/context";
import {
  createDiscoverApi,
  type DiscoverForYouResponse,
  type DiscoverRailKind,
} from "../../../lib/api/modules/discover.api";
import { discoverCopy } from "../../../lib/discover/copy";
import { buildForYouSections } from "../../../lib/discover/for-you-layout";
import { createProfileApi } from "../../../lib/api/modules/profile.api";

type Status = "idle" | "loading" | "ready" | "error";

export default function DiscoverForYouPage() {
  const auth = useAuth();
  const api = createDiscoverApi(auth.productClient);
  const profileApi = createProfileApi(auth.productClient);
  const [status, setStatus] = createSignal<Status>("idle");
  const [data, setData] = createSignal<DiscoverForYouResponse | undefined>();
  const [error, setError] = createSignal<string | undefined>();
  const [viewerGoal, setViewerGoal] = createSignal(false);
  const [reloadSeed, setReloadSeed] = createSignal(0);

  createEffect(
    () => [auth.status(), reloadSeed()] as const,
    () => {
      if (auth.status() !== "authenticated") return;
      setStatus("loading");
      void Promise.all([api.forYou(), profileApi.getProfile()])
        .then(([res, profile]) => {
          setData(res);
          setViewerGoal(Boolean(profile.practiceGoal));
          setStatus("ready");
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : "Could not load Discover.");
          setStatus("error");
        });
    },
  );

  const sections = () => {
    const payload = data();
    if (!payload) return [];
    return buildForYouSections({
      rails: payload.rails.map((r) => ({ kind: r.kind, peopleCount: r.people.length })),
      viewerHasGoal: viewerGoal(),
      goalPatternItems: payload.goalPattern?.items.length ?? 0,
      yourTopicsCount: payload.yourTopics.length,
      starterListsCount: payload.starterLists.length,
    });
  };

  const railMap = () => {
    const map = new Map<DiscoverRailKind, DiscoverForYouResponse["rails"][number]>();
    for (const rail of data()?.rails ?? []) map.set(rail.kind, rail);
    return map;
  };

  return (
    <div class="flex flex-col gap-8">
      <DiscoverOnboardingSheet onDismiss={() => setReloadSeed((n) => n + 1)} />
      <Switch>
        <Match when={status() === "loading" || status() === "idle"}>
          <LoadingPlaceholder lines={6} />
        </Match>
        <Match when={status() === "error"}>
          <FormAlert variant="error">{error()}</FormAlert>
        </Match>
        <Match when={status() === "ready"}>
          <For each={sections()}>
            {(section) => (
              <Switch>
                <Match when={section.type === "rail"}>
                  {() => {
                    const kind = (section as { type: "rail"; kind: DiscoverRailKind }).kind;
                    const rail = railMap().get(kind);
                    return rail ? <DiscoverRail rail={rail} /> : null;
                  }}
                </Match>
                <Match when={section.type === "goalPattern"}>
                  <Show when={data()?.goalPattern}>
                    {(pattern) => (
                      <DiscoverPatternCard
                        title={`Others practicing for ${pattern().goal}`}
                        items={pattern().items}
                      />
                    )}
                  </Show>
                </Match>
                <Match when={section.type === "yourTopics"}>
                  <section aria-labelledby="your-topics">
                    <h2 id="your-topics" class="mb-3 text-title text-ink">
                      {discoverCopy("discover.exploreTopics")}
                    </h2>
                    <div class="flex flex-wrap gap-2">
                      <For each={data()?.yourTopics ?? []}>
                        {(topic) => (
                          <DiscoverTopicChip
                            name={topic.name}
                            normalizedName={topic.normalizedName}
                            listCount={topic.listCount}
                          />
                        )}
                      </For>
                    </div>
                  </section>
                </Match>
                <Match when={section.type === "starterLists"}>
                  <DiscoverStarterLists items={data()?.starterLists ?? []} />
                </Match>
              </Switch>
            )}
          </For>
        </Match>
      </Switch>
    </div>
  );
}