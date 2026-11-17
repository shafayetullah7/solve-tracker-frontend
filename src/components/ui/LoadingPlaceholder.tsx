import { For, Match, Switch } from "solid-js";

type LoadingPlaceholderProps = {
  variant?: "text" | "block" | "row";
  lines?: number;
};

const pulse = "motion-safe:animate-pulse bg-surface-muted";

export function LoadingPlaceholder(props: LoadingPlaceholderProps) {
  const variant = () => props.variant ?? "text";
  const lineCount = () =>
    props.lines ?? (variant() === "row" ? 1 : variant() === "block" ? 2 : 3);

  return (
    <div class="space-y-3" role="status" aria-label="Loading">
      <Switch>
        <Match when={variant() === "row"}>
          <For each={Array.from({ length: lineCount() })}>
            {() => <div class={`h-20 rounded-control ${pulse}`} />}
          </For>
        </Match>
        <Match when={variant() === "block"}>
          <For each={Array.from({ length: lineCount() })}>
            {() => <div class={`h-32 w-full rounded-panel ${pulse}`} />}
          </For>
        </Match>
        <Match when={variant() === "text"}>
          <For each={Array.from({ length: lineCount() })}>
            {(_, i) => (
              <div
                class={`h-4 rounded ${pulse}`}
                style={{
                  width: i() === lineCount() - 1 ? "60%" : "100%",
                }}
              />
            )}
          </For>
        </Match>
      </Switch>
    </div>
  );
}
