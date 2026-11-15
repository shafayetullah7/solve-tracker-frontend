import { Match, Show, Switch } from "solid-js";
import type { ProgressCounts } from "../../lib/api/modules/progress.api";

export type ProgressLoadStatus = "idle" | "loading" | "ready" | "error";

type LibraryProgressStripProps = {
  loadStatus: () => ProgressLoadStatus;
  overall: () => ProgressCounts | undefined;
  errorMessage: () => string | undefined;
  matchingTotal: () => number | undefined;
  listReady: () => boolean;
};

export function LibraryProgressStrip(props: LibraryProgressStripProps) {
  return (
    <div class="mb-6 max-w-2xl space-y-2 text-sm">
      <Switch>
        <Match when={props.loadStatus() === "loading" || props.loadStatus() === "idle"}>
          <p class="text-muted" role="status">
            Loading progress…
          </p>
        </Match>
        <Match when={props.loadStatus() === "error"}>
          <p class="text-muted" role="status">
            {props.errorMessage()}
          </p>
        </Match>
        <Match when={props.loadStatus() === "ready" && props.overall()}>
          <>
            <p class="text-body">
              <span class="tabular-nums font-medium">{props.overall()!.total}</span> total ·{" "}
              <span class="tabular-nums font-medium">{props.overall()!.solved}</span> solved ·{" "}
              <span class="tabular-nums font-medium">{props.overall()!.unsolved}</span>{" "}
              unsolved
            </p>
            <p class="text-muted">
              These counts reflect your entire library, not the filters below.
            </p>
            <Show when={props.listReady() && props.matchingTotal() !== undefined}>
              <p class="text-muted" role="status">
                Showing{" "}
                <span class="tabular-nums text-body">{props.matchingTotal()}</span> matching
                results
              </p>
            </Show>
          </>
        </Match>
      </Switch>
    </div>
  );
}