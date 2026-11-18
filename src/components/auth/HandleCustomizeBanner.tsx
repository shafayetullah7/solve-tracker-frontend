import { createMemo, createSignal, Show } from "solid-js";
import { formatHandleLabel, isSystemAssignedHandle } from "../../lib/auth/user-handle";
import { useAuth } from "../../lib/auth/context";
import { paths } from "../../router";

/**
 * Nudge while the account still has a system-assigned handle (session/API truth).
 * Dismiss is session-only: we remember which user id dismissed — no browser storage, no effects.
 */
export function HandleCustomizeBanner() {
  const auth = useAuth();
  /** User id that clicked Dismiss this SPA session; does not apply after account switch. */
  const [dismissedForUserId, setDismissedForUserId] = createSignal<string | null>(
    null,
  );

  const visible = createMemo(() => {
    if (auth.status() !== "authenticated") return false;
    const user = auth.user();
    if (!user?.handle || !isSystemAssignedHandle(user.handle)) return false;
    return dismissedForUserId() !== user.id;
  });

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
            <button
              type="button"
              class="ui-button"
              data-variant="ghost"
              onClick={() => {
                const id = auth.user()?.id;
                if (id) setDismissedForUserId(id);
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
}