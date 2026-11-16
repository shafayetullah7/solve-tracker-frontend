import { For, Show } from "solid-js";
import type { TopicResponse } from "../../lib/api/modules/topics.api";
import { hasActiveBrowseFilters } from "../../lib/problems/browse-query";
import { buildBrowseActiveChips } from "../../lib/problems/browse-active-filters";
import { IconClose } from "../../icons";

type BrowseActiveFiltersProps = {
  searchKey: string;
  topics: () => TopicResponse[];
  clearHref: string;
};

export function BrowseActiveFilters(props: BrowseActiveFiltersProps) {
  const chips = () => {
    const nameById = new Map(props.topics().map((t) => [t.id, t.name]));
    return buildBrowseActiveChips(props.searchKey, nameById);
  };

  return (
    <Show when={hasActiveBrowseFilters(props.searchKey)}>
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <span class="text-sm font-medium text-muted">Active filters</span>
        <For each={chips()}>
          {(chip) => (
            <span class="ui-badge inline-flex items-center gap-1" data-tone="brand">
              <span>{chip.label}</span>
              <a
                class="flex min-h-6 min-w-6 items-center justify-center rounded-full hover:bg-surface-muted"
                href={chip.href}
                aria-label={chip.removeAriaLabel}
              >
                <IconClose class="h-3.5 w-3.5" />
              </a>
            </span>
          )}
        </For>
        <a
          class="text-sm text-brand underline-offset-4 hover:underline"
          href={props.clearHref}
        >
          Clear all
        </a>
      </div>
    </Show>
  );
}