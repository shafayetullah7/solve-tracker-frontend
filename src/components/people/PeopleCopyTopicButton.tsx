import { createSignal, Show } from "solid-js";
import type { ApiClient } from "../../lib/api/client";
import { createPeopleApi } from "../../lib/api/modules/people.api";
import { discoverCopy } from "../../lib/discover/copy";
import { problemsBrowseHref } from "../../lib/problems/paths";
import { trackDiscoverEvent } from "../../lib/discover/track";
import { Button } from "../ui/Button";
import { FormAlert } from "../ui/FormAlert";

export type PeopleCopyTopicButtonProps = {
  client: ApiClient;
  handle: string;
  topicId: string;
  onCopied?: (viewerTopicId: string) => void;
};

export function PeopleCopyTopicButton(props: PeopleCopyTopicButtonProps) {
  const [pending, setPending] = createSignal(false);
  const [message, setMessage] = createSignal<string | undefined>();
  const [viewerTopicId, setViewerTopicId] = createSignal<string | undefined>();

  async function copy() {
    setPending(true);
    setMessage(undefined);
    try {
      const api = createPeopleApi(props.client);
      const result = await api.copyTopic(props.handle, props.topicId);
      if (result === "unavailable") {
        setMessage("This topic is not available.");
        return;
      }
      setViewerTopicId(result.topicId);
      trackDiscoverEvent("discover_topic_copy", "public-topic");
      props.onCopied?.(result.topicId);
      setMessage(
        discoverCopy("toast.copyTopicSuccess", {
          added: result.added,
          linked: result.linked,
          topicName: result.topicName,
        }),
      );
    } catch {
      setMessage("Could not copy this topic.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div class="flex flex-wrap items-center gap-2">
      <Button type="button" variant="secondary" disabled={pending()} onClick={() => void copy()}>
        {pending() ? "…" : discoverCopy("list.copyTopic")}
      </Button>
      <Show when={viewerTopicId()}>
        {(id) => (
          <a
            class="text-label text-brand hover:underline"
            href={problemsBrowseHref({ topicId: id() })}
          >
            {discoverCopy("toast.copyTopicOpen")}
          </a>
        )}
      </Show>
      <Show when={message()}>
        <p class="text-sm text-muted" role="status">
          {message()}
        </p>
      </Show>
    </div>
  );
}