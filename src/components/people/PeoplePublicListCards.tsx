import { For, Show } from "solid-js";
import type { PeopleTopicBoardRow } from "../../lib/api/modules/people.api";
import { discoverCopy } from "../../lib/discover/copy";
import { peopleTopicPath } from "../../lib/people/paths";

export type PeoplePublicListCardsProps = {
  handle: string;
  rows: PeopleTopicBoardRow[];
  topicHref?: (handle: string, topicId: string) => string;
};

export function PeoplePublicListCards(props: PeoplePublicListCardsProps) {
  const publicRows = () =>
    props.rows.filter((row) => row.isPublic && row.id);

  return (
    <section aria-labelledby="people-public-lists">
      <h2 id="people-public-lists" class="text-section font-semibold">
        {discoverCopy("profile.publicLists")}
      </h2>
      <Show
        when={publicRows().length > 0}
        fallback={<p class="mt-4 text-sm text-muted">No public lists yet.</p>}
      >
        <ul class="mt-4 grid gap-3 sm:grid-cols-2">
          <For each={publicRows()}>
            {(row) => (
              <li>
                <a
                  class="block rounded-panel border border-line bg-surface px-4 py-4 shadow-panel hover:bg-surface-muted"
                  href={(props.topicHref ?? peopleTopicPath)(props.handle, row.id!)}
                >
                  <span class="font-medium text-brand">{row.name}</span>
                  <p class="mt-1 text-sm text-muted tabular-nums">
                    {row.total} problems · {row.percentComplete}% complete
                  </p>
                </a>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </section>
  );
}