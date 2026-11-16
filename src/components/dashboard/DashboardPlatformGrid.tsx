import { For, Show } from "solid-js";
import type { PlatformProgress } from "../../lib/api/modules/progress.api";
import { problemNewPath } from "../../lib/problems/paths";
import { paths } from "../../router";
import { DashboardPlatformCell } from "./DashboardPlatformCell";

const linkClass =
  "text-brand underline-offset-4 hover:underline focus-visible:outline-offset-2";

type DashboardPlatformGridProps = {
  platforms: PlatformProgress[];
};

export function DashboardPlatformGrid(props: DashboardPlatformGridProps) {
  return (
    <section aria-labelledby="dashboard-by-platform">
      <h2 id="dashboard-by-platform" class="text-section font-semibold">
        By platform
      </h2>
      <Show
        when={props.platforms.length > 0}
        fallback={
          <p class="mt-4 text-muted">
            No problems yet.{" "}
            <a class={linkClass} href={paths.app.problems()}>
              Browse your library
            </a>{" "}
            or{" "}
            <a class={linkClass} href={problemNewPath()}>
              add a problem
            </a>
            .
          </p>
        }
      >
        <ul class="mt-4 grid grid-cols-2 gap-3">
          <For each={props.platforms}>
            {(row) => (
              <li>
                <DashboardPlatformCell row={row} />
              </li>
            )}
          </For>
        </ul>
      </Show>
    </section>
  );
}