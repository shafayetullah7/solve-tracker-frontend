import { useLocation, useNavigate } from "@solidjs/router";
import { createEffect } from "solid-js";
import { paths } from "../../router";
import { useAuth } from "./context";
import { safeReturnPath } from "./forms";

/**
 * Client fallback: redirect signed-in users away from login/register.
 * Hard loads are redirected by the auth gate middleware before render.
 */
export function useRedirectIfAuthenticated() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  createEffect(
    () => [auth.status(), location.search] as const,
    ([status, search]) => {
      if (status !== "authenticated") return;
      const fromQuery = safeReturnPath(
        new URLSearchParams(search).get("next"),
      );
      navigate(fromQuery ?? paths.app(), { replace: true });
    },
  );
}
