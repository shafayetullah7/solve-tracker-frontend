import type { TopicResponse } from "../../lib/api/modules/topics.api";
import { BrowseActiveFilters } from "./BrowseActiveFilters";
import { ProblemBrowseToolbar } from "./ProblemBrowseToolbar";
import type { ListProblemsQuery } from "../../lib/api/modules/problems.api";

type ProblemBrowseFiltersSectionProps = {
  searchKey: string;
  topics: () => TopicResponse[];
  topicsLoading: () => boolean;
  topicsTruncated: () => boolean;
  clearHref: string;
  onApply: (query: ListProblemsQuery) => void;
};

export function ProblemBrowseFiltersSection(
  props: ProblemBrowseFiltersSectionProps,
) {
  return (
    <div class="space-y-2" role="search" aria-label="Filter saved problems">
      <ProblemBrowseToolbar
        searchKey={props.searchKey}
        topics={props.topics}
        topicsLoading={props.topicsLoading}
        topicsTruncated={props.topicsTruncated}
        clearHref={props.clearHref}
        onApply={props.onApply}
      />
      <BrowseActiveFilters
        searchKey={props.searchKey}
        topics={props.topics}
        clearHref={props.clearHref}
      />
    </div>
  );
}