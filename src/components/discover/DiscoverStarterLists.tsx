import { For } from "solid-js";
import type { DiscoverForYouResponse } from "../../lib/api/modules/discover.api";
import { discoverCopy } from "../../lib/discover/copy";
import { peopleTopicPath } from "../../lib/people/paths";

export function DiscoverStarterLists(props: {
  items: DiscoverForYouResponse["starterLists"];
}) {
  return (
    <section aria-labelledby="starter-lists-heading">
      <h2 id="starter-lists-heading" class="mb-3 text-title text-ink">
        {discoverCopy("discover.starterSection")}
      </h2>
      <div class="flex flex-wrap gap-2">
        <For each={props.items}>
          {(item) => (
            <a
              href={peopleTopicPath(item.handle, item.topicId)}
              class="min-h-11 rounded-pill border border-line bg-surface px-3 py-2 text-label hover:bg-surface-muted"
            >
              {item.name} · {item.total}
            </a>
          )}
        </For>
      </div>
    </section>
  );
}