import { Show } from "solid-js";
import type { TopicProgress } from "../../lib/api/modules/progress.api";
import { formatTopicProgressDetail } from "../../lib/problems/progress-display";
import { paths } from "../../router";
import { ProgressBar } from "../ui/ProgressBar";

export type TopicProgressRowProps = {
  row: TopicProgress;
  /** When true, hide bar and show unavailable copy (summaries failed to load). */
  progressUnavailable?: boolean;
  class?: string;
};

export function TopicProgressRow(props: TopicProgressRowProps) {
  const detail = () => {
    if (props.progressUnavailable) return "Progress unavailable";
    return formatTopicProgressDetail(props.row);
  };

  return (
    <div class={["min-w-0 flex-1 space-y-2", props.class].filter(Boolean).join(" ")}>
      <a
        class="text-body font-medium text-brand underline-offset-4 hover:underline"
        href={`${paths.app.problems()}?topicId=${props.row.id}`}
      >
        {props.row.name}
      </a>
      <Show when={!props.progressUnavailable}>
        <ProgressBar
          value={props.row.percentComplete}
          label={`${props.row.name}: ${props.row.percentComplete}% complete`}
        />
      </Show>
      <p class="text-sm text-muted tabular-nums">{detail()}</p>
    </div>
  );
}