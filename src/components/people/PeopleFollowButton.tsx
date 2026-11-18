import { createSignal, Show } from "solid-js";
import { discoverCopy } from "../../lib/discover/copy";
import { trackDiscoverEvent } from "../../lib/discover/track";
import { Button } from "../ui/Button";
import { FormAlert } from "../ui/FormAlert";

export type PeopleFollowButtonProps = {
  handle: string;
  initialFollowing: boolean;
  follow: () => Promise<void>;
  unfollow: () => Promise<void>;
};

export function PeopleFollowButton(props: PeopleFollowButtonProps) {
  const [following, setFollowing] = createSignal(props.initialFollowing);
  const [pending, setPending] = createSignal(false);
  const [error, setError] = createSignal<string | undefined>();

  async function toggle() {
    setPending(true);
    setError(undefined);
    const next = !following();
    try {
      if (next) {
        await props.follow();
        trackDiscoverEvent("discover_follow", "people-profile");
      } else {
        await props.unfollow();
      }
      setFollowing(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not update follow.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div class="flex flex-col items-start gap-1">
      <Button
        type="button"
        variant={following() ? "secondary" : "primary"}
        disabled={pending()}
        aria-pressed={following()}
        onClick={() => void toggle()}
      >
        {following()
          ? discoverCopy("profile.following")
          : discoverCopy("profile.follow")}
      </Button>
      <Show when={error()}>
        <FormAlert variant="error" class="text-sm">
          {error()}
        </FormAlert>
      </Show>
    </div>
  );
}