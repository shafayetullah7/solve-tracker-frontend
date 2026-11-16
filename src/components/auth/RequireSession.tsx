import { useLocation, useNavigate } from "@solidjs/router";
import type { ParentProps } from "solid-js";
import { createEffect, Match, Show, Switch } from "solid-js";
import { Button } from "../ui/Button";
import { useAuth } from "../../lib/auth/context";
import { loginPathWithReturn } from "../../lib/auth/forms";
import { paths } from "../../router";

function RedirectToLogin() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  createEffect(
    () => [auth.status(), location.pathname, location.search] as const,
    ([status, pathname, search]) => {
      if (status !== "anonymous") return;
      const returnTo = `${pathname}${search}`;
      navigate(loginPathWithReturn(returnTo, paths.login()), { replace: true });
    },
  );

  return (
    <p class="text-muted" role="status">
      Redirecting to sign in…
    </p>
  );
}

export function RequireSession(props: ParentProps) {
  const auth = useAuth();

  return (
    <Switch>
      <Match when={auth.status() === "checking"}>
        <p class="text-muted" role="status">
          Checking session…
        </p>
      </Match>
      <Match when={auth.status() === "unavailable"}>
        <p class="text-muted">We could not reach the server.</p>
        <Button
          class="mt-4"
          variant="secondary"
          onClick={() => void auth.retryBootstrap()}
        >
          Try again
        </Button>
      </Match>
      <Match when={auth.status() === "anonymous"}>
        <RedirectToLogin />
      </Match>
      <Match when={auth.status() === "authenticated"}>
        <Show when={auth.user()}>{props.children}</Show>
      </Match>
    </Switch>
  );
}