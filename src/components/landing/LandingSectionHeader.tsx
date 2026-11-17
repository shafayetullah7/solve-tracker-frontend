import { Show } from "solid-js";

export function LandingSectionHeader(props: {
  id: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header class="max-w-2xl space-y-2">
      <h2 id={props.id} class="text-section font-semibold tracking-tight text-ink">
        {props.title}
      </h2>
      <Show when={props.subtitle}>
        <p class="text-label leading-relaxed text-muted">{props.subtitle}</p>
      </Show>
    </header>
  );
}