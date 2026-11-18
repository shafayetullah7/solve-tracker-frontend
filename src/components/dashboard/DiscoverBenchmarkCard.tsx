import { createEffect, createSignal, Show } from "solid-js";
import { useAuth } from "../../lib/auth/context";
import {
  createDiscoverApi,
  type BenchmarkResponse,
} from "../../lib/api/modules/discover.api";
import { discoverCopy } from "../../lib/discover/copy";
import { discoverForYouPath } from "../../lib/discover/paths";
import { discoverPeersComparePath } from "../../lib/people/paths";

export function DiscoverBenchmarkCard() {
  const auth = useAuth();
  const api = createDiscoverApi(auth.productClient);
  const [data, setData] = createSignal<BenchmarkResponse | null | undefined>();

  createEffect(
    () => auth.status(),
    (status) => {
      if (status !== "authenticated") return;
      void api.benchmark().then(setData).catch(() => setData(null));
    },
  );

  const nudge = (
    <section class="rounded-card border border-line bg-surface p-4">
      <h2 class="text-title text-ink">{discoverCopy("dashboard.benchmarkTitle")}</h2>
      <p class="mt-2 text-body text-muted">{discoverCopy("dashboard.starterNudge")}</p>
      <a
        href={discoverForYouPath()}
        class="mt-3 inline-block text-label text-brand hover:underline"
      >
        {discoverCopy("discover.seeAll")}
      </a>
    </section>
  );

  return (
    <Show when={data()} fallback={data() === null ? nudge : null}>
      {(bench) => (
        <Show when={bench().peers} fallback={nudge}>
          {(peers) => (
            <section class="rounded-card border border-line bg-surface p-4" aria-labelledby="dash-bench">
              <h2 id="dash-bench" class="text-title text-ink">
                {discoverCopy("dashboard.benchmarkTitle")}
              </h2>
              <dl class="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                <div>
                  <dt class="text-muted">{discoverCopy("dashboard.benchmarkActiveWeeks")}</dt>
                  <dd class="tabular-nums font-medium">
                    {bench().me.activeWeeks} · {peers().activeWeeks} (
                    {discoverCopy("dashboard.benchmarkPeers")})
                  </dd>
                </div>
                <div>
                  <dt class="text-muted">{discoverCopy("dashboard.benchmarkSolvesPerWeek")}</dt>
                  <dd class="tabular-nums font-medium">
                    {bench().me.solvesPerWeek.toFixed(1)} · {peers().solvesPerWeek.toFixed(1)}
                  </dd>
                </div>
              </dl>
              <Show when={bench().insight}>
                {(insight) => <p class="mt-3 text-body text-ink">{insight().text}</p>}
              </Show>
              <a
                href={discoverPeersComparePath({ weeks: 12 })}
                class="mt-3 inline-block text-label text-brand hover:underline"
              >
                {discoverCopy("dashboard.benchmarkCompare")}
              </a>
            </section>
          )}
        </Show>
      )}
    </Show>
  );
}