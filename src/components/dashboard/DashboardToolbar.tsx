import {
  DASHBOARD_UNSOLVED_BROWSE_HREF,
  DASHBOARD_UNTAGGED_BROWSE_HREF,
} from "../../lib/dashboard/dashboard-queries";
import { paths } from "../../router";
import { Button } from "../ui/Button";

const pillClass =
  "inline-flex items-center rounded-full border border-line bg-surface px-3 py-1.5 text-label font-medium text-foreground transition-colors hover:border-brand/40 hover:bg-brand-soft";

type DashboardToolbarProps = {
  total?: number;
  unsolvedCount?: number;
  untaggedCount?: number;
  onRefresh?: () => void;
  refreshing?: boolean;
};

export function DashboardToolbar(props: DashboardToolbarProps) {
  const showTotal = () => typeof props.total === "number";
  const showUnsolved = () => typeof props.unsolvedCount === "number";
  const showUntagged = () => typeof props.untaggedCount === "number";

  return (
    <nav
      aria-label="Dashboard actions"
      class="flex flex-wrap items-center gap-2"
    >
      <a class={pillClass} href={paths.app.problems()}>
        Browse library{showTotal() ? ` (${props.total})` : ""}
      </a>
      {showUnsolved() && (
        <a class={pillClass} href={DASHBOARD_UNSOLVED_BROWSE_HREF}>
          Unsolved ({props.unsolvedCount})
        </a>
      )}
      {showUntagged() && (
        <a class={pillClass} href={DASHBOARD_UNTAGGED_BROWSE_HREF}>
          Untagged ({props.untaggedCount})
        </a>
      )}
      <a class={pillClass} href={paths.app.topics()}>
        Manage topics
      </a>
      {props.onRefresh && (
        <Button
          variant="secondary"
          class="!rounded-full !px-3 !py-1.5 !text-label"
          disabled={props.refreshing}
          onClick={() => props.onRefresh!()}
        >
          Re-fetch
        </Button>
      )}
    </nav>
  );
}