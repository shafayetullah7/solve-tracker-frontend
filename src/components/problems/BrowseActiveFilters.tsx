import { For, Show } from "solid-js";
import type { TopicResponse } from "../../lib/api/modules/topics.api";
import { hasActiveBrowseFilters } from "../../lib/problems/browse-query";
import { buildBrowseActiveChipGroups } from "../../lib/problems/browse-active-filters";
import { IconClose } from "../../icons";

type BrowseActiveFiltersProps = {
  searchKey: string;
  topics: () => TopicResponse[];
  clearHref: string;
};

function ChipRow(props: {
  chips: ReturnType<typeof buildBrowseActiveChipGroups>["filters"];
}) {
  return (
    <For each={props.chips}>
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
  );
}

export function BrowseActiveFilters(props: BrowseActiveFiltersProps) {
  const groups = () => {
    const nameById = new Map(props.topics().map((t) => [t.id, t.name]));
    return buildBrowseActiveChipGroups(props.searchKey, nameById);
  };

  return (
    <Show when={hasActiveBrowseFilters(props.searchKey)}>
      <div class="flex flex-col gap-2 border-t border-line pt-2">
        <Show when={groups().filters.length > 0}>
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="sr-only">Active filters</span>
            <ChipRow chips={groups().filters} />
          </div>
        </Show>

        <Show when={groups().view.length > 0}>
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="text-caption font-medium text-muted">View:</span>
            <For each={groups().view}>
              {(chip) => (
                <span
                  class="ui-badge inline-flex items-center gap-1"
                  data-tone="neutral"
                >
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
          </div>
        </Show>

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