import { createSignal, For, onSettled, Match, Switch } from "solid-js";

type LoadingPlaceholderProps = {
  variant?: "text" | "block" | "row";
  lines?: number;
};

function pulseClass(reduced: boolean) {
  return reduced ? "bg-surface-muted" : "animate-pulse bg-surface-muted";
}

export function LoadingPlaceholder(props: LoadingPlaceholderProps) {
  const [reducedMotion, setReducedMotion] = createSignal(false);

  onSettled(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  });

  const variant = () => props.variant ?? "text";
  const lineCount = () =>
    props.lines ?? (variant() === "row" ? 1 : variant() === "block" ? 2 : 3);

  return (
    <div class="space-y-3" role="status" aria-label="Loading">
      <Switch>
        <Match when={variant() === "row"}>
          <For each={Array.from({ length: lineCount() })}>
            {() => (
              <div
                class={`h-20 rounded-control ${pulseClass(reducedMotion())}`}
              />
            )}
          </For>
        </Match>
        <Match when={variant() === "block"}>
          <div class={`h-32 rounded-panel ${pulseClass(reducedMotion())}`} />
          <div class={`h-24 rounded-panel ${pulseClass(reducedMotion())}`} />
        </Match>
        <Match when={variant() === "text"}>
          <For each={Array.from({ length: lineCount() })}>
            {(_, i) => (
              <div
                class={`h-4 rounded ${pulseClass(reducedMotion())}`}
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