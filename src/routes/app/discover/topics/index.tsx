import { createEffect, createSignal, For, Match, Switch } from "solid-js";
import { FormAlert } from "../../../../components/ui/FormAlert";
import { LoadingPlaceholder } from "../../../../components/ui/LoadingPlaceholder";
import { useAuth } from "../../../../lib/auth/context";
import { createDiscoverApi } from "../../../../lib/api/modules/discover.api";
import { discoverTopicHubPath, encodeTopicKey } from "../../../../lib/discover/topic-key";
import { trackDiscoverEvent } from "../../../../lib/discover/track";

export default function DiscoverTopicsDirectoryPage() {
  const auth = useAuth();
  const api = createDiscoverApi(auth.productClient);
  const [status, setStatus] = createSignal<"idle" | "loading" | "ready" | "error">("idle");
  const [data, setData] = createSignal<
    Awaited<ReturnType<ReturnType<typeof createDiscoverApi>["topicsDirectory"]>> | undefined
  >();
  const [error, setError] = createSignal<string | undefined>();

  createEffect(
    () => auth.status(),
    (s) => {
      if (s !== "authenticated") return;
      setStatus("loading");
      void api
        .topicsDirectory()
        .then((res) => {
          setData(res);
          setStatus("ready");
          trackDiscoverEvent("discover_topic_hub_open", "topics-directory");
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : "Could not load topics.");
          setStatus("error");
        });
    },
  );

  return (
    <Switch>
      <Match when={status() === "loading" || status() === "idle"}>
        <LoadingPlaceholder lines={8} />
      </Match>
      <Match when={status() === "error"}>
        <FormAlert variant="error">{error()}</FormAlert>
      </Match>
      <Match when={status() === "ready"}>
        <div class="flex flex-col gap-8">
          <section aria-labelledby="your-topics-dir">
            <h2 id="your-topics-dir" class="mb-3 text-title text-ink">
              Your topics
            </h2>
            <ul class="flex flex-col gap-2">
              <For each={data()?.yourTopics ?? []}>
                {(row) => (
                  <li>
                    <a
                      class="flex min-h-11 items-center justify-between rounded-card border border-line px-4 py-2 hover:border-brand"
                      href={discoverTopicHubPath(encodeTopicKey(row.normalizedName))}
                    >
                      <span class="text-label text-ink">{row.name}</span>
                      <span class="text-caption text-muted">
                        {row.practicerCount} practicers · {row.publicListCount} lists
                      </span>
                    </a>
                  </li>
                )}
              </For>
            </ul>
          </section>
          <section aria-labelledby="popular-topics-dir">
            <h2 id="popular-topics-dir" class="mb-3 text-title text-ink">
              Popular topics
            </h2>
            <ul class="flex flex-col gap-2">
              <For each={data()?.popularTopics ?? []}>
                {(row) => (
                  <li>
                    <a
                      class="flex min-h-11 items-center justify-between rounded-card border border-line px-4 py-2 hover:border-brand"
                      href={discoverTopicHubPath(encodeTopicKey(row.normalizedName))}
                    >
                      <span class="text-label text-ink">{row.name}</span>
                      <span class="text-caption text-muted">
                        {row.practicerCount} practicers · {row.publicListCount} lists
                      </span>
                    </a>
                  </li>
                )}
              </For>
            </ul>
          </section>
        </div>
      </Match>
    </Switch>
  );
}