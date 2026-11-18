import { For, Match, Show, Switch } from "solid-js";
import type { CompareResponse } from "../../lib/api/modules/discover.api";
import { discoverCopy } from "../../lib/discover/copy";
import {
  compareSectionOrder,
  type CompareFocus,
} from "./compare-section-order";
import { CompareInsights } from "./CompareInsights";
import { CompareShareBars } from "./CompareShareBars";
import { CompareSummaryTable } from "./CompareSummaryTable";

export type ComparePageProps = {
  data: CompareResponse;
  themLabel: string;
  focus?: CompareFocus;
  summaryOnlyMessage?: string;
};

export function ComparePage(props: ComparePageProps) {
  const sections = () => compareSectionOrder(props.focus);

  return (
    <div class="space-y-8">
      <For each={sections()}>
        {(section) => (
          <Switch>
            <Match when={section === "summary"}>
              <CompareSummaryTable
                me={props.data.me}
                them={props.data.them}
                themLabel={props.themLabel}
              />
            </Match>
            <Match when={section === "platforms"}>
              <CompareShareBars
                titleKey="compare.platformMix"
                me={props.data.me.platformShares}
                them={props.data.them.platformShares}
              />
            </Match>
            <Match when={section === "topics"}>
              <Show
                when={props.data.summaryOnlyTopics}
                fallback={
                  <CompareShareBars
                    titleKey="compare.topicFocus"
                    me={props.data.me.platformShares}
                    them={props.data.them.platformShares}
                    topicRows={props.data.topics}
                  />
                }
              >
                <p class="text-sm text-muted">
                  {props.summaryOnlyMessage ??
                    discoverCopy("compare.summaryOnlyTopics", { handle: "…" })}
                </p>
              </Show>
            </Match>
            <Match when={section === "insights"}>
              <CompareInsights insights={props.data.insights} />
            </Match>
          </Switch>
        )}
      </For>
    </div>
  );
}