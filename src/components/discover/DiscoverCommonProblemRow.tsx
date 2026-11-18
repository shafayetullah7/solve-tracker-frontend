import { createSignal } from "solid-js";
import type { DiscoverHubProblemsResponse } from "../../lib/api/modules/discover.api";
import { useAuth } from "../../lib/auth/context";
import { discoverCopy } from "../../lib/discover/copy";
import { reduceAddProblemState } from "../../lib/discover/add-state";
import {
  addProblemFromRow,
  createProblemInputFromHubRow,
} from "../../lib/discover/create-from-public-row";
import { trackDiscoverEvent } from "../../lib/discover/track";
import { Button } from "../ui/Button";
import { DiscoverReasonLine } from "./DiscoverReasonLine";

type Row = DiscoverHubProblemsResponse["items"][number];

export function DiscoverCommonProblemRow(props: {
  row: Row;
  topicId?: string;
}) {
  const auth = useAuth();
  const [state, setState] = createSignal(reduceAddProblemState({ status: "idle" }, { type: "reset" }));
  const row = () => props.row;

  const label = () => {
    const s = state().status;
    if (s === "added" || s === "already") return discoverCopy("row.added");
    if (s === "adding") return "…";
    return discoverCopy("row.add");
  };

  async function addOne() {
    setState(reduceAddProblemState(state(), { type: "start" }));
    try {
      const topicIds = props.topicId ? [props.topicId] : undefined;
      const result = await addProblemFromRow(
        auth.productClient,
        createProblemInputFromHubRow(row(), topicIds),
      );
      setState(
        reduceAddProblemState(state(), {
          type: result === "already" ? "already" : "done",
        }),
      );
      if (result === "added") {
        trackDiscoverEvent("discover_problem_add", "topic-hub");
      }
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
    <li class="flex flex-col gap-2 border-b border-line py-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <p class="truncate text-label font-medium text-ink">{row().title}</p>
        <p class="text-caption text-muted">
          {row().platformSlug}
          {row().difficulty ? ` · ${row().difficulty}` : ""}
        </p>
        <DiscoverReasonLine text={row().reason.text} />
      </div>
      <Button
        type="button"
        variant="secondary"
        disabled={state().status === "adding" || state().status === "added" || state().status === "already"}
        onClick={() => void addOne()}
      >
        {label()}
      </Button>
    </li>
  );
}