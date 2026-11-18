import type { DiscoverTopicHubResponse } from "../../lib/api/modules/discover.api";
import { discoverCopy } from "../../lib/discover/copy";
import { peopleTopicPath } from "../../lib/people/paths";
import { trackDiscoverEvent } from "../../lib/discover/track";
import { Button } from "../ui/Button";
import { DiscoverReasonLine } from "./DiscoverReasonLine";

type ListCard = DiscoverTopicHubResponse["lists"][number];

export function DiscoverListCard(props: { list: ListCard }) {
  const list = () => props.list;
  return (
    <article class="flex flex-col gap-3 rounded-card border border-line bg-surface p-4">
      <div>
        <p class="text-label font-medium text-ink">{list().name}</p>
        <p class="text-caption text-muted">@{list().handle}</p>
      </div>
      <DiscoverReasonLine text={list().reason.text} />
      <a
        href={peopleTopicPath(list().handle, list().topicId)}
        class="mt-auto"
        onClick={() => trackDiscoverEvent("discover_list_open", "topic-hub")}
      >
        <Button type="button" variant="secondary" class="w-full">
          {discoverCopy("row.open")}
        </Button>
      </a>
    </article>
  );
}