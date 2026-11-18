import { Show } from "solid-js";
import { discoverCopy } from "../../lib/discover/copy";
import { appProfile } from "../../lib/app/product-routes";

export type PeopleViewAsBannerProps = {
  show: boolean;
};

export function PeopleViewAsBanner(props: PeopleViewAsBannerProps) {
  return (
    <Show when={props.show}>
      <div
        class="mb-6 rounded-panel border border-line bg-surface-muted/60 px-4 py-3 text-sm"
        role="status"
      >
        <p>{discoverCopy("profile.viewAsBanner")}</p>
        <a
          class="mt-2 inline-block font-medium text-brand underline-offset-4 hover:underline"
          href={appProfile()}
        >
          {discoverCopy("profile.editVisibility")}
        </a>
      </div>
    </Show>
  );
}