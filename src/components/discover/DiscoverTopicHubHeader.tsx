import { Show } from "solid-js";
import type { DiscoverTopicHubResponse } from "../../lib/api/modules/discover.api";
import { problemsBrowseHref } from "../../lib/problems/paths";
import { appTopics } from "../../lib/app/product-routes";
import { Button } from "../ui/Button";

export function DiscoverTopicHubHeader(props: { hub: DiscoverTopicHubResponse }) {
  const hub = () => props.hub;
  const viewer = () => hub().viewerTopic;
  return (
    <header class="flex flex-col gap-3">
      <h1 class="text-display text-ink">{hub().name}</h1>
      <p class="text-body text-muted">
        {hub().header.practicerCount} practicers · {hub().header.publicListCount} public lists
      </p>
      <Show
        when={
          viewer().hasTopic
            ? (viewer() as DiscoverTopicHubResponse["viewerTopic"] & { hasTopic: true })
            : undefined
        }
        fallback={
          <a href={appTopics()}>
            <Button type="button" variant="secondary">
              Create this topic
            </Button>
          </a>
        }
      >
        {(v) => (
          <a
            href={problemsBrowseHref({
              page: 1,
              pageSize: 25,
              sort: "createdAt",
              order: "desc",
              topicId: v().topicId,
            })}
          >
            <Button type="button" variant="secondary">
              Open in library
            </Button>
          </a>
        )}
      </Show>
    </header>
  );
}