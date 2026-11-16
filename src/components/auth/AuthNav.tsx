import { Show } from "solid-js";
import { paths } from "../../router";

export function AuthNav() {
  return (
    <div class="flex flex-wrap items-center gap-4 text-sm">
      <a class="text-muted underline-offset-4 hover:underline" href={paths.login()}>
        Sign in
      </a>
      <a class="text-brand underline-offset-4 hover:underline" href={paths.register()}>
        Register
      </a>
      <Show when={import.meta.env.DEV}>
        <a class="text-muted underline-offset-4 hover:underline" href={paths.users()}>
          Template examples
        </a>
      </Show>
    </div>
  );
}