import { For, Show } from "solid-js";
import type { CompareResponse } from "../../lib/api/modules/discover.api";
import { discoverCopy } from "../../lib/discover/copy";
import { peopleProfilePath, peopleTopicPath } from "../../lib/people/paths";
import { problemsBrowseHref } from "../../lib/problems/paths";

type Insight = CompareResponse["insights"][number];

function insightActionHref(action: Insight["action"]): string | undefined {
  if (!action) return undefined;
  if (action.kind === "viewProfile" && action.handle)
    return peopleProfilePath(action.handle);
  if (action.kind === "copyTopic" && action.handle && action.topicId)
    return peopleTopicPath(action.handle, action.topicId);
  if (action.kind === "filterLibrary" && action.normalizedName)
    return problemsBrowseHref({ q: action.normalizedName });
  return undefined;
}

export function CompareInsights(props: { insights: Insight[] }) {
  return (
    <section aria-labelledby="compare-insights">
      <h2 id="compare-insights" class="text-title text-ink">
        {discoverCopy("compare.insights")}
      </h2>
      <Show
        when={props.insights.length > 0}
        fallback={<p class="mt-2 text-sm text-muted">No insights for this window.</p>}
      >
        <ul class="mt-3 space-y-3">
          <For each={props.insights}>
            {(insight) => {
              const href = insightActionHref(insight.action);
              return (
                <li class="rounded-panel border border-line px-4 py-3">
                  <p class="text-body text-ink">{insight.text}</p>
                  <Show when={href}>
                    {(link) => (
                      <a
                        class="mt-2 inline-block text-label text-brand hover:underline"
                        href={link()}
                      >
                        {insight.action?.kind === "copyTopic"
                          ? discoverCopy("list.copyTopic")
                          : discoverCopy("row.open")}
                      </a>
                    )}
                  </Show>
                </li>
              );
            }}
          </For>
        </ul>
      </Show>
    </section>
  );
}