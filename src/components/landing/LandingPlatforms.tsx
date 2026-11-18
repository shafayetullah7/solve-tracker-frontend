import {
  createEffect,
  createMemo,
  createSignal,
  For,
  Match,
  Switch,
} from "solid-js";
import { createPlatformsApi } from "../../lib/api/modules/platforms.api";
import type { PlatformListResponse } from "../../lib/api/modules/platforms.api";
import { useAuth } from "../../lib/auth/context";
import { LANDING_PLATFORMS } from "./landing-copy";
import { resolveAllPlatforms } from "./landing-platforms-data";
import { LandingPlatformTile } from "./LandingPlatformTile";

const SKELETON_GRID_SLOTS = 16;

const gridClass =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4";

export type LandingPlatformsProps = {
  /** Injectable for tests; default uses `GET /platforms` via auth product client. */
  listPlatforms?: (signal?: AbortSignal) => Promise<PlatformListResponse>;
};

function GridSkeleton() {
  const pulse = "motion-safe:animate-pulse rounded-control bg-surface-muted";
  return (
    <ul class={gridClass} role="status" aria-label="Loading platforms">
      <For each={Array.from({ length: SKELETON_GRID_SLOTS })}>
        {() => (
          <li>
            <div
              class={`h-11 w-full rounded-control border border-line/60 ${pulse}`}
              aria-hidden="true"
            />
          </li>
        )}
      </For>
    </ul>
  );
}

type LandingCatalogStatus = "idle" | "loading" | "ready" | "error";

export function LandingPlatforms(props: LandingPlatformsProps = {}) {
  const auth = useAuth();
  const [status, setStatus] = createSignal<LandingCatalogStatus>("idle");
  const [entries, setEntries] = createSignal<
    PlatformListResponse["items"] | undefined
  >(undefined);

  let inflight: Promise<void> | undefined;

  async function loadCatalog(): Promise<void> {
    if (inflight) return inflight;
    setStatus("loading");
    inflight = (async () => {
      try {
        const list =
          props.listPlatforms ??
          ((s) =>
            createPlatformsApi(auth.productClient).listPlatforms(s));
        const { items } = await list();
        setEntries(items);
        setStatus("ready");
      } catch {
        setStatus("error");
      } finally {
        inflight = undefined;
      }
    })();
    return inflight;
  }

  createEffect(
    () => status(),
    (current) => {
      if (current === "idle") void loadCatalog();
    },
  );

  const platforms = createMemo(() => resolveAllPlatforms(entries()));

  const catalogState = (): LandingCatalogStatus => status();

  return (
    <section aria-label={LANDING_PLATFORMS.sectionAriaLabel}>
      <Switch>
        <Match when={catalogState() === "loading"}>
          <GridSkeleton />
        </Match>
        <Match when={catalogState() === "ready" && platforms().length > 0}>
          <ul class={gridClass}>
            <For each={platforms()}>
              {(cell) => (
                <li>
                  <LandingPlatformTile cell={cell} />
                </li>
              )}
            </For>
          </ul>
        </Match>
        <Match when={catalogState() === "error"}>
          <p class="text-caption text-muted" role="status">
            {LANDING_PLATFORMS.gridLoadError}
          </p>
        </Match>
      </Switch>
    </section>
  );
}