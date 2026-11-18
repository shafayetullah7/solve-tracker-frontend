import type { DiscoverPersonCard as Card } from "../../lib/api/modules/discover.api";
import { discoverCopy } from "../../lib/discover/copy";
import { peopleComparePath, peopleProfilePath } from "../../lib/people/paths";
import { Button } from "../ui/Button";
import { DiscoverReasonLine } from "./DiscoverReasonLine";

export type DiscoverPersonCardProps = {
  person: Card;
  compareFocus?: "cadence" | "topics";
};

export function DiscoverPersonCard(props: DiscoverPersonCardProps) {
  const p = () => props.person;
  return (
    <article class="flex min-w-[240px] snap-start flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-sm">
      <div class="flex items-center gap-3">
        {p().avatarUrl ? (
          <img src={p().avatarUrl} alt="" class="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-label font-medium">
            {p().name.slice(0, 1)}
          </div>
        )}
        <div class="min-w-0">
          <p class="truncate text-label font-medium text-ink">{p().name}</p>
          <p class="text-caption text-muted">@{p().handle}</p>
        </div>
      </div>
      <p class="text-caption text-muted">
        {p().solved} solved · 🔥{p().streakDays}
        {p().practiceGoal ? ` · ${p().practiceGoal}` : ""}
      </p>
      <DiscoverReasonLine text={p().reason.text} />
      <div class="mt-auto flex gap-2">
        <a href={peopleProfilePath(p().handle)} class="flex-1">
          <Button type="button" variant="secondary" class="w-full">
            {discoverCopy("card.view")}
          </Button>
        </a>
        <a
          href={peopleComparePath(p().handle, { focus: props.compareFocus })}
          class="flex-1"
        >
          <Button type="button" variant="secondary" class="w-full">
            {discoverCopy("card.compare")}
          </Button>
        </a>
      </div>
    </article>
  );
}