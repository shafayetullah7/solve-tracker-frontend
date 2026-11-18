import { useParams } from "@solidjs/router";
import { createEffect, createSignal, For, Match, Show, Switch } from "solid-js";
import { DiscoverListCard } from "../../../../components/discover/DiscoverListCard";
import { DiscoverPatternCard } from "../../../../components/discover/DiscoverPatternCard";
import { DiscoverPersonCard } from "../../../../components/discover/DiscoverPersonCard";
import { DiscoverTopicHubHeader } from "../../../../components/discover/DiscoverTopicHubHeader";
import { DiscoverCommonProblemRow } from "../../../../components/discover/DiscoverCommonProblemRow";
import { FormAlert } from "../../../../components/ui/FormAlert";
import { LoadingPlaceholder } from "../../../../components/ui/LoadingPlaceholder";
import { useAuth } from "../../../../lib/auth/context";
import {
  createDiscoverApi,
  type DiscoverHubProblemsResponse,
  type DiscoverTopicHubResponse,
} from "../../../../lib/api/modules/discover.api";
import { trackDiscoverEvent } from "../../../../lib/discover/track";

export default function DiscoverTopicHubPage() {
  const params = useParams();
  const auth = useAuth();
  const api = createDiscoverApi(auth.productClient);
  const [hubStatus, setHubStatus] = createSignal<"idle" | "loading" | "ready" | "error">("idle");
  const [hub, setHub] = createSignal<DiscoverTopicHubResponse | undefined>();
  const [problems, setProblems] = createSignal<DiscoverHubProblemsResponse["items"]>([]);
  const [error, setError] = createSignal<string | undefined>();

  createEffect(
    () => [auth.status(), params.topicKey] as const,
    ([status, topicKey]) => {
      if (status !== "authenticated" || !topicKey) return;
      setHubStatus("loading");
      void Promise.all([api.topicHub(topicKey), api.topicProblems(topicKey, true)])
        .then(([hubRes, problemsRes]) => {
          setHub(hubRes);
          setProblems(problemsRes.items.slice(0, 10));
          setHubStatus("ready");
          trackDiscoverEvent("discover_topic_hub_open", "topic-hub");
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : "Topic not found.");
          setHubStatus("error");
        });
    },
  );

  return (
    <Switch>
      <Match when={hubStatus() === "loading" || hubStatus() === "idle"}>
        <LoadingPlaceholder lines={10} />
      </Match>
      <Match when={hubStatus() === "error"}>
        <FormAlert variant="error">{error()}</FormAlert>
      </Match>
      <Match when={hubStatus() === "ready" && hub()}>
        {(payload) => (
          <div class="flex flex-col gap-8">
            <DiscoverTopicHubHeader hub={payload()} />
            <Show when={payload().lists.length > 0}>
              <section aria-labelledby="hub-lists">
                <h2 id="hub-lists" class="mb-3 text-title text-ink">
                  Public lists
                </h2>
                <div class="grid gap-4 sm:grid-cols-2">
                  <For each={payload().lists}>
                    {(list) => <DiscoverListCard list={list} />}
                  </For>
                </div>
              </section>
            </Show>
            <Show when={problems().length > 0}>
              <section aria-labelledby="hub-problems">
                <h2 id="hub-problems" class="mb-3 text-title text-ink">
                  Commonly tracked
                </h2>
                <ul>
                  <For each={problems()}>
                    {(row) => (
                      <DiscoverCommonProblemRow
                        row={row}
                        topicId={
                          payload().viewerTopic.hasTopic
                            ? (payload().viewerTopic as { hasTopic: true; topicId: string }).topicId
                            : undefined
                        }
                      />
                    )}
                  </For>
                </ul>
              </section>
            </Show>
            <Show when={payload().pattern}>
              {(pattern) => (
                <DiscoverPatternCard title="Often studied together" items={pattern().items} />
              )}
            </Show>
            <Show when={payload().specialists}>
              {(rail) => (
                <section aria-labelledby="hub-specialists">
                  <h2 id="hub-specialists" class="mb-3 text-title text-ink">
                    Topic specialists
                  </h2>
                  <div class="flex gap-3 overflow-x-auto pb-2">
                    <For each={rail().people}>
                      {(person) => <DiscoverPersonCard person={person} />}
                    </For>
                  </div>
                </section>
              )}
            </Show>
          </div>
        )}
      </Match>
    </Switch>
  );
}