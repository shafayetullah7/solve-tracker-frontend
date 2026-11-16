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
    <div class="text-label text-muted">
      <Switch>
        <Match when={props.loadStatus() === "loading" || props.loadStatus() === "idle"}>
          <span role="status">Loading progress…</span>
        </Match>
        <Match when={props.loadStatus() === "error"}>
          <span role="status">{props.errorMessage()}</span>
        </Match>
        <Match when={props.loadStatus() === "ready" && props.overall()}>
          <span class="tabular-nums" role="status">
            <span class="text-body">{props.overall()!.total}</span> total ·{" "}
            <span class="text-body">{props.overall()!.solved}</span> solved ·{" "}
            <span class="text-body">{props.overall()!.unsolved}</span> unsolved
            <Show when={props.listReady() && props.matchingTotal() !== undefined}>
              {" · "}
              <span class="text-body">{props.matchingTotal()}</span> matching
            </Show>
          </span>
        </Match>
      </Switch>
    </div>
  );
}