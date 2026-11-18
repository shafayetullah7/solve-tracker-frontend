import { createEffect, createSignal, For, Show } from "solid-js";
import { useAuth } from "../../lib/auth/context";
import { createDiscoverApi, type DiscoverPersonCard } from "../../lib/api/modules/discover.api";
import { discoverCopy } from "../../lib/discover/copy";
import { discoverForYouPath } from "../../lib/discover/paths";
import { peopleProfilePath } from "../../lib/people/paths";
import { DiscoverReasonLine } from "../discover/DiscoverReasonLine";

export function DiscoverPeopleLikeYouCard() {
  const auth = useAuth();
  const api = createDiscoverApi(auth.productClient);
  const [peers, setPeers] = createSignal<DiscoverPersonCard[]>([]);
  const [starterCount, setStarterCount] = createSignal(0);

  createEffect(
    () => auth.status(),
    (status) => {
      if (status !== "authenticated") return;
      void api.forYou().then((res) => {
        const rail = res.rails.find((r) => r.kind === "peers");
        setPeers((rail?.people ?? []).slice(0, 3));
        setStarterCount(res.starterLists.length);
      });
    },
  );

  return (
    <Show when={peers().length > 0} fallback={
      <Show when={starterCount() > 0}>
        <div class="rounded-card border border-line bg-surface p-4">
          <p class="text-body text-ink">{discoverCopy("discover.exploreTopics")}</p>
          <a href={discoverForYouPath()} class="mt-2 inline-block text-brand hover:underline">
            {discoverCopy("discover.seeAll")}
          </a>
        </div>
      </Show>
    }>
      <section class="rounded-card border border-line bg-surface p-4" aria-labelledby="dash-peers">
        <div class="mb-3 flex items-center justify-between">
          <h2 id="dash-peers" class="text-title text-ink">
            {discoverCopy("rail.peers")}
          </h2>
          <a href={discoverForYouPath()} class="text-label text-brand hover:underline">
            {discoverCopy("discover.seeAll")}
          </a>
        </div>
        <ul class="flex flex-col gap-3">
          <For each={peers()}>
            {(person) => (
              <li>
                <a href={peopleProfilePath(person.handle)} class="block">
                  <p class="text-label font-medium text-ink">{person.name}</p>
                  <DiscoverReasonLine text={person.reason.text} />
                </a>
              </li>
            )}
          </For>
        </ul>
      </section>
    </Show>
  );
}