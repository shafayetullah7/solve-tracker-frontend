import { createEffect, createSignal, Show } from "solid-js";
import { isLearningGuidesEnabled } from "../../lib/learning/flag";
import {
  WELCOME_BANNER_BODY,
  WELCOME_BANNER_STORAGE_KEY,
  WELCOME_BANNER_TITLE,
} from "../../lib/learning/learning-product-copy";
import { learningImportPath, learningNewGuidePath } from "../../lib/learning/paths";
import { paths } from "../../router";
import { Button } from "../ui/Button";

type LearningWelcomeBannerProps = {
  authStatus: () => string;
};

function isDismissed(): boolean {
  if (typeof localStorage === "undefined") return true;
  return localStorage.getItem(WELCOME_BANNER_STORAGE_KEY) === "1";
}

export function LearningWelcomeBanner(props: LearningWelcomeBannerProps) {
  const [visible, setVisible] = createSignal(false);

  createEffect(
    () => props.authStatus(),
    (status) => {
      if (!isLearningGuidesEnabled() || status !== "authenticated") {
        setVisible(false);
        return;
      }
      setVisible(!isDismissed());
    },
  );

  function dismiss() {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(WELCOME_BANNER_STORAGE_KEY, "1");
    }
    setVisible(false);
  }

  return (
    <Show when={visible()}>
      <div
        class="rounded-panel border border-line bg-surface-muted px-5 py-4"
        role="region"
        aria-labelledby="learning-welcome-title"
      >
        <h2 id="learning-welcome-title" class="text-section font-semibold text-ink">
          {WELCOME_BANNER_TITLE}
        </h2>
        <p class="mt-2 text-body text-muted">{WELCOME_BANNER_BODY}</p>
        <div class="mt-4 flex flex-wrap items-center gap-2">
          <a class="ui-button inline-flex min-h-11" data-variant="primary" href={learningNewGuidePath()}>
            New guide
          </a>
          <a
            class="ui-button inline-flex min-h-11"
            data-variant="secondary"
            href={learningImportPath()}
          >
            Import guide
          </a>
          <a class="ui-button inline-flex min-h-11" data-variant="secondary" href={paths.app.problems()}>
            Browse problems
          </a>
          <Button type="button" variant="ghost" class="min-h-11" onClick={() => dismiss()}>
            Dismiss
          </Button>
        </div>
      </div>
    </Show>
  );
}