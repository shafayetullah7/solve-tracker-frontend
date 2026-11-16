import {
  DASHBOARD_UNSOLVED_BROWSE_HREF,
  DASHBOARD_UNTAGGED_BROWSE_HREF,
} from "../../lib/dashboard/dashboard-queries";
import { problemNewPath } from "../../lib/problems/paths";
import { paths } from "../../router";
import { DashboardStatLink } from "./DashboardStatLink";

const linkClass =
  "text-brand underline-offset-4 hover:underline focus-visible:outline-offset-2";

type DashboardQuickLinksProps = {
  unsolvedCount?: number;
  untaggedCount?: number;
};

export function DashboardQuickLinks(props: DashboardQuickLinksProps) {
  const showUnsolved = () => typeof props.unsolvedCount === "number";
  const showUntagged = () => typeof props.untaggedCount === "number";

  return (
    <nav aria-label="Quick links" class="flex flex-wrap items-center gap-x-2 gap-y-1 text-label">
      <a class={linkClass} href={paths.app.problems()}>
        Browse library
      </a>
      {showUnsolved() && (
        <>
          <span class="text-muted" aria-hidden="true">
            ·
          </span>
          <DashboardStatLink
            href={DASHBOARD_UNSOLVED_BROWSE_HREF}
            label={`Unsolved (${props.unsolvedCount})`}
          />
        </>
      )}
      {showUntagged() && (
        <>
          <span class="text-muted" aria-hidden="true">
            ·
          </span>
          <DashboardStatLink
            href={DASHBOARD_UNTAGGED_BROWSE_HREF}
            label={`Untagged (${props.untaggedCount})`}
          />
        </>
      )}
      <span class="text-muted" aria-hidden="true">
        ·
      </span>
      <a class={linkClass} href={paths.app.topics()}>
        Manage topics
      </a>
      <span class="text-muted" aria-hidden="true">
        ·
      </span>
      <a class={linkClass} href={problemNewPath()}>
        Add problem
      </a>
    </nav>
  );
}