import { createSignal, Show } from "solid-js";
import type { PatchTopicInput } from "../../lib/api/modules/topics.api";
import type { PracticeVisibility } from "../profile/ProfilePracticeVisibilityPanel";
import { discoverCopy } from "../../lib/discover/copy";
import { codePointLength } from "../../lib/forms/unicode";
import { Button } from "../ui/Button";
import { FormAlert } from "../ui/FormAlert";

export type TopicShareControlProps = {
  topicId: string;
  name: string;
  isPublic: boolean;
  description: string;
  ownerVisibility: PracticeVisibility;
  onPatch: (topicId: string, input: PatchTopicInput) => Promise<void>;
  onEnableTopicSharing?: () => Promise<void>;
};

export function TopicShareControl(props: TopicShareControlProps) {
  const [open, setOpen] = createSignal(false);
  const [isPublic, setIsPublic] = createSignal(props.isPublic);
  const [description, setDescription] = createSignal(props.description);
  const [pending, setPending] = createSignal(false);
  const [error, setError] = createSignal<string | undefined>();

  const sharingOff = () => props.ownerVisibility !== "topics";

  async function save() {
    setPending(true);
    setError(undefined);
    try {
      await props.onPatch(props.topicId, {
        isPublic: isPublic(),
        description: description(),
      });
      setOpen(false);
    } catch {
      setError("Could not save topic sharing.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div class="relative">
      <Show
        when={!sharingOff()}
        fallback={
          <Button type="button" variant="secondary" disabled>
            🔒 {discoverCopy("topics.sharePrivate")}
          </Button>
        }
      >
        <Button
          type="button"
          variant="secondary"
          aria-expanded={open()}
          aria-haspopup="dialog"
          onClick={() => setOpen((v) => !v)}
        >
          {isPublic() ? "🌐" : "🔒"}{" "}
          {isPublic() ? discoverCopy("topics.sharePublic") : discoverCopy("topics.sharePrivate")}
        </Button>
        <Show when={open()}>
          <div
            role="dialog"
            class="absolute right-0 z-20 mt-2 w-[min(20rem,90vw)] rounded-panel border border-line bg-surface p-4 shadow-panel"
          >
            <p class="mb-3 text-sm text-muted">{discoverCopy("topics.shareMenuHint")}</p>
            <label class="mb-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isPublic()}
                onChange={(e) => setIsPublic(e.currentTarget.checked)}
                aria-label={
                  isPublic()
                    ? discoverCopy("topics.sharePublic")
                    : discoverCopy("topics.sharePrivate")
                }
              />
              {isPublic() ? discoverCopy("topics.sharePublic") : discoverCopy("topics.sharePrivate")}
            </label>
            <label class="block text-sm font-medium" for={`topic-desc-${props.topicId}`}>
              {discoverCopy("topics.descriptionLabel")}
            </label>
            <textarea
              id={`topic-desc-${props.topicId}`}
              class="mt-1 w-full rounded-control border border-line px-3 py-2 text-sm"
              rows={3}
              value={description()}
              onInput={(e) => setDescription(e.currentTarget.value)}
            />
            <p class="mt-1 text-xs text-muted">
              {discoverCopy("topics.descriptionCounter", {
                count: codePointLength(description()),
              })}
            </p>
            <div class="mt-3 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={pending()}
                aria-busy={pending()}
                onClick={() => void save()}
              >
                Save
              </Button>
            </div>
            <Show when={error()}>
              <FormAlert class="mt-2" variant="error">
                {error()}
              </FormAlert>
            </Show>
          </div>
        </Show>
      </Show>
    </div>
  );
}