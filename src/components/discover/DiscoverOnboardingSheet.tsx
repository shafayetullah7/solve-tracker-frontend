import { createEffect, createSignal, For, Show } from "solid-js";
import { discoverCopy } from "../../lib/discover/copy";
import { createProfileApi } from "../../lib/api/modules/profile.api";
import { useAuth } from "../../lib/auth/context";
import { Button } from "../ui/Button";
import { trackDiscoverEvent } from "../../lib/discover/track";

const STORAGE_KEY = "discover.onboarding.v1";

const GOALS = ["interview", "contests", "fundamentals", "coaching"] as const;
const VISIBILITY = ["private", "summary", "topics"] as const;

export type DiscoverOnboardingSheetProps = {
  onDismiss: () => void;
};

export function DiscoverOnboardingSheet(props: DiscoverOnboardingSheetProps) {
  const auth = useAuth();
  const profileApi = createProfileApi(auth.productClient);
  const [open, setOpen] = createSignal(false);
  const [goal, setGoal] = createSignal<(typeof GOALS)[number] | undefined>();
  const [visibility, setVisibility] = createSignal<(typeof VISIBILITY)[number]>("topics");
  const [pending, setPending] = createSignal(false);

  let opened = false;
  createEffect(
    () => auth.status(),
    (status) => {
      if (opened || status !== "authenticated") return;
      if (typeof localStorage === "undefined") return;
      if (localStorage.getItem(STORAGE_KEY)) return;
      opened = true;
      setOpen(true);
    },
  );

  async function skip() {
    localStorage.setItem(STORAGE_KEY, "1");
    trackDiscoverEvent("discover_onboarding_skip", "discover");
    setOpen(false);
    props.onDismiss();
  }

  async function start() {
    if (pending()) return;
    setPending(true);
    try {
      await profileApi.patchProfile({
        practiceVisibility: visibility(),
        ...(goal() ? { practiceGoal: goal() } : {}),
      });
      localStorage.setItem(STORAGE_KEY, "1");
      trackDiscoverEvent("discover_onboarding_start", "discover");
      setOpen(false);
      props.onDismiss();
    } finally {
      setPending(false);
    }
  }

  return (
    <Show when={open()}>
      <div
        class="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="discover-onboarding-title"
        onKeyDown={(e) => {
          if (e.key === "Escape") void skip();
        }}
      >
        <div class="w-full max-w-md rounded-card border border-line bg-surface p-6 shadow-lg">
          <h2 id="discover-onboarding-title" class="mb-4 text-title text-ink">
            {discoverCopy("onboarding.title")}
          </h2>
          <ol class="mb-4 flex flex-col gap-3 text-body text-ink">
            <li>1. {discoverCopy("onboarding.step1")}</li>
            <li>
              2. {discoverCopy("onboarding.step2Goal")}
              <div class="mt-2 flex flex-wrap gap-2">
                <For each={GOALS}>
                  {(g) => (
                    <button
                      type="button"
                      class={[
                        "min-h-11 rounded-pill border px-3 text-label",
                        goal() === g ? "border-brand bg-brand-soft text-brand" : "border-line",
                      ]}
                      onClick={() => setGoal(g)}
                    >
                      {g}
                    </button>
                  )}
                </For>
              </div>
            </li>
            <li>
              3. {discoverCopy("onboarding.step3Share")}
              <div class="mt-2 flex flex-col gap-2">
                <For each={VISIBILITY}>
                  {(v) => (
                    <label class="flex min-h-11 cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="onboarding-visibility"
                        checked={visibility() === v}
                        onChange={() => setVisibility(v)}
                      />
                      {v}
                    </label>
                  )}
                </For>
              </div>
            </li>
          </ol>
          <div class="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => void skip()}>
              {discoverCopy("onboarding.skip")}
            </Button>
            <Button type="button" disabled={pending()} onClick={() => void start()}>
              {discoverCopy("onboarding.start")}
            </Button>
          </div>
        </div>
      </div>
    </Show>
  );
}