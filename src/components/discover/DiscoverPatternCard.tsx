import { For } from "solid-js";
import { discoverTopicHubPath, encodeTopicKey } from "../../lib/discover/topic-key";

export type PatternItem = {
  normalizedName: string;
  name: string;
  percent: number;
};

export function DiscoverPatternCard(props: {
  title: string;
  items: PatternItem[];
}) {
  return (
    <section class="rounded-card border border-line bg-surface p-4" aria-labelledby="pattern-card">
      <h2 id="pattern-card" class="mb-3 text-title text-ink">
        {props.title}
      </h2>
      <div class="flex flex-wrap gap-2">
        <For each={props.items}>
          {(item) => (
            <a
              href={discoverTopicHubPath(encodeTopicKey(item.normalizedName))}
              class="min-h-11 rounded-pill border border-line bg-surface-muted px-3 py-2 text-label text-ink hover:border-brand"
            >
              {item.name} · {item.percent}%
            </a>
          )}
        </For>
      </div>
    </section>
  );
}