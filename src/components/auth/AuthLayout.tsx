import { Title } from "@solidjs/meta";
import type { ParentProps } from "solid-js";
import { PracticeBrandLink } from "../brand/PracticeBrandLink";
import { Panel } from "../ui/Panel";
import { paths } from "../../router";

export function AuthLayout(
  props: ParentProps<{ title: string; description?: string; pageTitle?: string }>,
) {
  return (
    <main
      id="main-content"
      class="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 py-10 sm:px-8 sm:py-12"
    >
      <Title>{props.pageTitle ?? props.title}</Title>
      <div class="mb-6 flex justify-center">
        <PracticeBrandLink href={paths()} size="auth" />
      </div>
      <Panel title={props.title} description={props.description}>
        {props.children}
      </Panel>
    </main>
  );
}