import type { ParentProps } from "solid-js";
import { RequireSession } from "../components/auth/RequireSession";

export default function ProblemsLayout(props: ParentProps) {
  return (
    <RequireSession>
      <main class="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">{props.children}</main>
    </RequireSession>
  );
}