import { For, Show } from "solid-js";
import type { CompareResponse } from "../../lib/api/modules/discover.api";
import { discoverCopy } from "../../lib/discover/copy";

type Share = CompareResponse["me"]["platformShares"][number];

function SharePair(props: {
  label: string;
  mePercent: number;
  themPercent: number;
}) {
  return (
    <div class="space-y-1">
      <p class="text-label font-medium text-ink">{props.label}</p>
      <div class="grid gap-2 sm:grid-cols-2">
        <div>
          <p class="text-caption text-brand">You · {props.mePercent}%</p>
          <div class="h-2 rounded-full bg-surface-muted">
            <div
              class="h-2 rounded-full bg-brand"
              style={{ width: `${Math.min(100, props.mePercent)}%` }}
            />
          </div>
        </div>
        <div>
          <p class="text-caption text-muted">Them · {props.themPercent}%</p>
          <div class="h-2 rounded-full bg-surface-muted">
            <div
              class="h-2 rounded-full bg-ink/70"
              style={{ width: `${Math.min(100, props.themPercent)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function mergePlatformShares(me: Share[], them: Share[]) {
  const keys = new Set<string>();
  for (const row of me) keys.add(row.slug);
  for (const row of them) keys.add(row.slug);
  return [...keys].map((slug) => ({
    slug,
    me: me.find((r) => r.slug === slug)?.percent ?? 0,
    them: them.find((r) => r.slug === slug)?.percent ?? 0,
  }));
}

export function CompareShareBars(props: {
  titleKey: "compare.platformMix" | "compare.topicFocus";
  me: Share[];
  them: Share[];
  topicRows?: CompareResponse["topics"];
}) {
  const platforms = () => mergePlatformShares(props.me, props.them);

  return (
    <section>
      <h2 class="text-title text-ink">{discoverCopy(props.titleKey)}</h2>
      <Show
        when={props.titleKey === "compare.platformMix"}
        fallback={
          <Show
            when={(props.topicRows ?? []).length > 0}
            fallback={<p class="mt-2 text-sm text-muted">No topic breakdown.</p>}
          >
            <div class="mt-3 space-y-4">
              <For each={props.topicRows}>
                {(row) => (
                  <SharePair
                    label={row.name}
                    mePercent={row.yourPercent}
                    themPercent={row.theirPercent}
                  />
                )}
              </For>
            </div>
          </Show>
        }
      >
        <div class="mt-3 space-y-4">
          <For each={platforms()}>
            {(row) => (
              <SharePair
                label={row.slug}
                mePercent={row.me}
                themPercent={row.them}
              />
            )}
          </For>
        </div>
      </Show>
    </section>
  );
}