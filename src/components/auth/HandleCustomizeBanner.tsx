import { createEffect, createSignal, Show } from "solid-js";
import {
  formatHandleLabel,
  handleNudgeStorageKey,
  isSystemAssignedHandle,
} from "../../lib/auth/user-handle";
import { useAuth } from "../../lib/auth/context";
import { paths } from "../../router";

export function HandleCustomizeBanner() {
  const auth = useAuth();
  const [dismissed, setDismissed] = createSignal(false);

  createEffect(() => {
    const user = auth.user();
    if (!user) {
      setDismissed(false);
      return;
    }
    try {
      setDismissed(localStorage.getItem(handleNudgeStorageKey(user.id)) === "1");
    } catch {
      setDismissed(false);
    }
  });

  const visible = () =>
    auth.status() === "authenticated" &&
    !dismissed() &&
    (() => {
      const handle = auth.user()?.handle;
      return handle ? isSystemAssignedHandle(handle) : false;
    })();

  function dismiss() {
    const user = auth.user();
    if (!user) return;
    try {
      localStorage.setItem(handleNudgeStorageKey(user.id), "1");
    } catch {
      // ignore
    }
    setDismissed(true);
  }

  return (
    <Show when={visible()}>
      <div
        class="border-b border-line bg-brand-soft px-5 py-3"
        role="status"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-ink">
            You have a temporary handle ({formatHandleLabel(auth.user()!.handle)}). Choose a
            memorable one on your profile.
          </p>
          <div class="flex shrink-0 gap-2">
            <a class="ui-button" data-variant="secondary" href={`${paths.app.profile()}?focus=handle`}>
              Set handle
            </a>
            <button type="button" class="ui-button" data-variant="ghost" onClick={dismiss}>
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
}