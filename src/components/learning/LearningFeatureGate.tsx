import { useNavigate } from "@solidjs/router";
import type { ParentProps } from "solid-js";
import { Show } from "solid-js";
import { isLearningGuidesEnabled } from "../../lib/learning/flag";
import { appHome } from "../../lib/app/product-routes";
import { Button } from "../ui/Button";

export function LearningFeatureGate(props: ParentProps) {
  const navigate = useNavigate();
  return (
    <Show
      when={isLearningGuidesEnabled()}
      fallback={
        <div class="mx-auto max-w-lg space-y-4 rounded-panel border border-line bg-surface p-6">
          <h1 class="text-section font-semibold tracking-tight text-ink">
            Learning guides
          </h1>
          <p class="text-body text-muted">
            Study guides are not enabled on this deployment. Ask your operator to set{" "}
            <code class="text-sm">VITE_LEARNING_GUIDES_ENABLED=true</code> in the
            frontend environment.
          </p>
          <Button type="button" variant="secondary" onClick={() => navigate(appHome())}>
            Back to dashboard
          </Button>
        </div>
      }
    >
      {props.children}
    </Show>
  );
}