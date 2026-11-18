import type { PeopleTopicBoardRow } from "../../lib/api/modules/people.api";
import type { TopicProgress } from "../../lib/api/modules/progress.api";
import { peopleTopicPath } from "../../lib/people/paths";
import { discoverCopy } from "../../lib/discover/copy";
import { DashboardTopicProgressList } from "../dashboard/DashboardTopicProgressList";

export type PeopleTopicBoardProps = {
  handle: string;
  rows: PeopleTopicBoardRow[];
  topicHref?: (handle: string, topicId: string) => string;
};

function toTopicProgress(row: PeopleTopicBoardRow): TopicProgress {
  return {
    id: row.id ?? `name:${row.name}`,
    name: row.name,
    total: row.total,
    solved: row.solved,
    unsolved: row.unsolved,
    percentComplete: row.percentComplete,
  };
}

export function PeopleTopicBoard(props: PeopleTopicBoardProps) {
  const topics = () => props.rows.map(toTopicProgress);

  const hrefFor = (row: TopicProgress) => {
    const source = props.rows.find((r) => r.name === row.name);
    if (source?.isPublic && source.id) {
      return props.topicHref
        ? props.topicHref(props.handle, source.id)
        : peopleTopicPath(props.handle, source.id);
    }
    return undefined;
  };

  return (
    <div>
      <DashboardTopicProgressList topics={topics()} hrefFor={hrefFor} />
      <p class="mt-2 text-xs text-muted sr-only">
        {discoverCopy("topics.sharePublic")} topics link to shared lists.
      </p>
    </div>
  );
}