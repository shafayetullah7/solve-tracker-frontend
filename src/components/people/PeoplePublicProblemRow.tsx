import { createSignal, Show } from "solid-js";
import type { PublicProblemRow } from "../../lib/api/modules/people.api";
import { useAuth } from "../../lib/auth/context";
import { discoverCopy } from "../../lib/discover/copy";
import {
  addProblemFromRow,
  createProblemInputFromPublicRow,
} from "../../lib/discover/create-from-public-row";
import { reduceAddProblemState } from "../../lib/discover/add-state";
import { trackDiscoverEvent } from "../../lib/discover/track";
import { PlatformMark } from "../platforms/PlatformMark";
import { Button } from "../ui/Button";

export type PeoplePublicProblemRowProps = {
  row: PublicProblemRow;
  viewerTopicId?: string;
  onAdded?: () => void;
};

export function PeoplePublicProblemRow(props: PeoplePublicProblemRowProps) {
  const auth = useAuth();
  const [state, setState] = createSignal(reduceAddProblemState({ status: "idle" }, { type: "reset" }));

  const ownerLabel = () =>
    props.row.ownerStatus === "solved" ? "✓ Solved" : "○ Unsolved";

  const inLibrary = () =>
    props.row.inViewerLibrary ||
    state().status === "added" ||
    state().status === "already";

  const errorMessage = () => {
    const s = state();
    return s.status === "error" ? s.message : undefined;
  };

  async function addOne() {
    setState(reduceAddProblemState(state(), { type: "start" }));
    try {
      const topicIds = props.viewerTopicId ? [props.viewerTopicId] : undefined;
      const result = await addProblemFromRow(
        auth.productClient,
        createProblemInputFromPublicRow(props.row, topicIds),
      );
      setState(
        reduceAddProblemState(state(), {
          type: result === "already" ? "already" : "done",
        }),
      );
      if (result === "added") {
        trackDiscoverEvent("discover_problem_add", "public-topic");
      }
      props.onAdded?.();
    } catch {
      setState(
        reduceAddProblemState(state(), {
          type: "fail",
          message: "Could not add problem.",
        }),
      );
    }
  }

  return (
    <tr class="border-t border-line">
      <td class="px-3 py-3">
        <span class="font-medium">{props.row.title}</span>
      </td>
      <td class="px-3 py-3">
        <PlatformMark
          slug={props.row.platformSlug === "other" ? undefined : props.row.platformSlug}
          label={props.row.platformSlug}
        />
      </td>
      <td class="px-3 py-3 text-sm text-muted">
        {props.row.difficulty ?? props.row.rating ?? "—"}
      </td>
      <td class="px-3 py-3 text-sm tabular-nums">{ownerLabel()}</td>
      <td class="px-3 py-3 text-sm">
        <Show
          when={inLibrary()}
          fallback={
            <div class="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={state().status === "adding"}
                onClick={() => void addOne()}
              >
                {state().status === "adding" ? "…" : discoverCopy("row.add")}
              </Button>
              <a
                class="text-brand underline-offset-4 hover:underline"
                href={props.row.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {discoverCopy("row.open")}
              </a>
            </div>
          }
        >
          <span class="text-muted">✓ {discoverCopy("row.inLibrary")}</span>
        </Show>
        <Show when={errorMessage()}>
          {(message) => <p class="text-caption text-danger">{message()}</p>}
        </Show>
      </td>
    </tr>
  );
}