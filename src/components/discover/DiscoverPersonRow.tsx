import type { DiscoverPersonCard as Card } from "../../lib/api/modules/discover.api";
import { discoverCopy } from "../../lib/discover/copy";
import { peopleProfilePath } from "../../lib/people/paths";
import { Button } from "../ui/Button";
import { DiscoverReasonLine } from "./DiscoverReasonLine";

export function DiscoverPersonRow(props: { person: Card }) {
  const p = () => props.person;
  return (
    <div class="flex flex-col gap-2 border-b border-line py-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <p class="text-label font-medium text-ink">{p().name}</p>
        <p class="text-caption text-muted">@{p().handle}</p>
        <DiscoverReasonLine text={p().reason.text} />
      </div>
      <a href={peopleProfilePath(p().handle)}>
        <Button type="button" variant="secondary">
          {discoverCopy("card.view")}
        </Button>
      </a>
    </div>
  );
}