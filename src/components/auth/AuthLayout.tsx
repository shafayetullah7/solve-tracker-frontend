import { Title } from "@solidjs/meta";
import type { ParentProps } from "solid-js";
import { Panel } from "../ui/Panel";

export function AuthLayout(
  props: ParentProps<{ title: string; description?: string; pageTitle?: string }>,
) {
  return (
    <main class="mx-auto max-w-2xl px-5 py-10 sm:px-8">
      <Title>{props.pageTitle ?? props.title}</Title>
      <Panel title={props.title} description={props.description}>
        {props.children}
      </Panel>
    </main>
  );
}