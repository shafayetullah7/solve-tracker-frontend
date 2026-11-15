import { Show } from "solid-js";
import { useAuth } from "../../lib/auth/context";
import { paths } from "../../router";

export function AuthNav() {
  const auth = useAuth();
  return (
    <div class="flex flex-wrap items-center gap-4 text-sm">
      <Show
        when={auth.status() === "authenticated"}
        fallback={
          <>
            <a class="text-muted underline-offset-4 hover:underline" href={paths.login()}>
              Sign in
            </a>
            <a class="text-brand underline-offset-4 hover:underline" href={paths.register()}>
              Register
            </a>
          </>
        }
      >
        <a class="text-brand underline-offset-4 hover:underline" href={paths.topics()}>
          Topics
        </a>
        <a class="text-muted underline-offset-4 hover:underline" href={paths.account()}>
          Account
        </a>
      </Show>
      <a class="text-muted underline-offset-4 hover:underline" href={paths.users()}>
        Template examples
      </a>
    </div>
  );
}