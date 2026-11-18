import { Show } from "solid-js";
import { discoverCopy } from "../../lib/discover/copy";
import { discoverTopicHubPath } from "../../lib/discover/topic-key";

export function TopicCommunityHint(props: {
  topicName: string;
  topicKey: string;
  practicerCount: number;
  publicListCount: number;
}) {
  const visible =
    props.practicerCount >= 3 || props.publicListCount >= 3;
  return (
    <Show when={visible}>
      <p class="text-caption text-muted">
        {discoverCopy("topics.communityHint", {
          topicName: props.topicName,
          practicers: props.practicerCount,
          listCount: props.publicListCount,
        })}{" "}
        <a class="text-brand underline" href={discoverTopicHubPath(props.topicKey)}>
          {discoverCopy("topics.communityHintExplore")}
        </a>
      </p>
    </Show>
  );
}