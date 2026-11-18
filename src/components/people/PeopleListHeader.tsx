import { For, Show } from "solid-js";
import type { PublicTopicHeader } from "../../lib/api/modules/people.api";
import { discoverCopy } from "../../lib/discover/copy";
import { peopleProfilePath } from "../../lib/people/paths";

const BUCKET_LABELS = [
  "Easiest",
  "Easy",
  "Medium-low",
  "Medium-high",
  "Hard",
  "Hardest",
] as const;

export type PeopleListHeaderProps = {
  handle: string;
  header: PublicTopicHeader;
  profilePath?: (handle: string) => string;
};

export function PeopleListHeader(props: PeopleListHeaderProps) {
  const histogramSummary = () =>
    props.header.difficultyHistogram
      .map((count, index) => `${BUCKET_LABELS[index]}: ${count}`)
      .join("; ");

  return (
    <header class="space-y-4">
      <p class="text-muted">
        <a
          class="text-brand underline-offset-4 hover:underline"
          href={(props.profilePath ?? peopleProfilePath)(props.handle)}
        >
          @{props.handle}
        </a>{" "}
        · {props.header.name}
      </p>
      <Show when={props.header.description}>
        <p class="max-w-prose text-body">{props.header.description}</p>
      </Show>
      <dl class="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt class="text-muted">Owner completion</dt>
          <dd class="font-medium tabular-nums">
            {discoverCopy("list.ownerCompletion", {
              solved: props.header.ownerCompletion.solved,
              total: props.header.ownerCompletion.total,
            })}
          </dd>
        </div>
        <div>
          <dt class="text-muted">Copies</dt>
          <dd class="font-medium tabular-nums">
            {discoverCopy("list.copiedCount", { copies: props.header.copies30d })}
          </dd>
        </div>
      </dl>
      <div>
        <p class="text-sm font-medium">Difficulty</p>
        <ul class="mt-2 flex items-end gap-1" aria-hidden="true">
          <For each={props.header.difficultyHistogram}>
            {(count, index) => {
              const max = Math.max(1, ...props.header.difficultyHistogram);
              const height = count === 0 ? 4 : Math.max(8, Math.round((count / max) * 48));
              return (
                <li
                  class="flex min-w-[1.5rem] flex-1 flex-col items-center gap-1"
                  title={`${BUCKET_LABELS[index()]}: ${count}`}
                >
                  <div
                    class="w-full rounded-t-sm bg-brand"
                    style={{ height: `${height}px` }}
                  />
                </li>
              );
            }}
          </For>
        </ul>
        <p class="sr-only">{histogramSummary()}</p>
      </div>
    </header>
  );
}