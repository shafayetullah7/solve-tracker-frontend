import { For, Show } from "solid-js";
import type { DiscoverRail as Rail } from "../../lib/api/modules/discover.api";
import { discoverCopy, type DiscoverCopyKey } from "../../lib/discover/copy";
import { discoverPeoplePath } from "../../lib/discover/paths";
import { DiscoverPersonCard } from "./DiscoverPersonCard";

const RAIL_LABELS: Record<Rail["kind"], DiscoverCopyKey> = {
  peers: "rail.peers",
  ahead: "rail.ahead",
  same_goal: "rail.sameGoal",
  consistent: "rail.consistent",
  active_week: "rail.activeWeek",
};

export function DiscoverRail(props: { rail: Rail }) {
  return (
    <section class="flex flex-col gap-3" aria-labelledby={`rail-${props.rail.kind}`}>
      <div class="flex items-center justify-between gap-2">
        <h2 id={`rail-${props.rail.kind}`} class="text-title text-ink">
          {discoverCopy(RAIL_LABELS[props.rail.kind])}
        </h2>
        <Show when={props.rail.people.length >= 3}>
          <a
            class="text-label text-brand hover:underline"
            href={discoverPeoplePath(`rail=${props.rail.kind}`)}
          >
            {discoverCopy("discover.seeAll")}
          </a>
        </Show>
      </div>
      <div class="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <For each={props.rail.people}>
          {(person) => (
            <DiscoverPersonCard
              person={person}
              compareFocus={props.rail.kind === "consistent" ? "cadence" : undefined}
            />
          )}
        </For>
      </div>
    </section>
  );
}