import { Show } from "solid-js";
import type { TopicProgress } from "../../lib/api/modules/progress.api";
import { formatTopicProgressDetail } from "../../lib/problems/progress-display";
import { paths } from "../../router";
import { ProgressBar } from "../ui/ProgressBar";

const titleClass =
  "text-body font-medium text-brand underline-offset-4 hover:underline";

export type TopicProgressRowProps = {
  row: TopicProgress;
  /** When true, hide bar and show unavailable copy (summaries failed to load). */
  progressUnavailable?: boolean;
  /** `null` = plain text; `string` = custom link; omit = link to library topic filter. */
  nameHref?: string | null;
  class?: string;
};

export function TopicProgressRow(props: TopicProgressRowProps) {
  const detail = () => {
    if (props.progressUnavailable) return "Progress unavailable";
    return formatTopicProgressDetail(props.row);
  };

  const nameHref = () => {
    if (props.nameHref === null) return null;
    if (typeof props.nameHref === "string") return props.nameHref;
    return `${paths.app.problems()}?topicId=${props.row.id}`;
  };

  return (
    <div class={["min-w-0 flex-1 space-y-2", props.class]}>
      <Show
        when={nameHref()}
        fallback={<span class="text-body font-medium text-foreground">{props.row.name}</span>}
      >
        {(href) => (
          <a class={titleClass} href={href()}>
            {props.row.name}
          </a>
        )}
      </Show>
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