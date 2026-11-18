import { Show } from "solid-js";
import { PlatformMark } from "../platforms/PlatformMark";
import type { LandingPlatformCell } from "./landing-platforms-data";

const tileShell =
  "flex min-h-11 w-full min-w-0 items-center rounded-control border border-line bg-surface px-3 py-2.5 transition-colors duration-150 motion-safe:hover:border-brand/50 motion-safe:hover:bg-surface-muted/80";

const tileLink =
  "text-inherit no-underline outline-offset-2 focus-visible:outline focus-visible:outline-3 focus-visible:outline-brand";

export function LandingPlatformTile(props: { cell: LandingPlatformCell }) {
  const mark = (
    <PlatformMark
      slug={props.cell.slug}
      label={props.cell.name}
      class="min-w-0 text-sm text-ink"
    />
  );

  return (
    <Show when={props.cell.baseUrl} fallback={<div class={tileShell}>{mark}</div>}>
      {(baseUrl) => (
        <a
          class={[tileShell, tileLink]}
          href={baseUrl()}
          rel="noopener noreferrer"
          target="_blank"
          title={props.cell.name}
        >
          {mark}
        </a>
      )}
    </Show>
  );
}