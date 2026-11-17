import { useNavigate } from "@solidjs/router";
import { onSettled } from "solid-js";
import { RequireSession } from "../components/auth/RequireSession";
import { paths } from "../router";

/** Client fallback; hard loads of `/account` get a 302 from the auth gate. */
function RedirectToProfile() {
  const navigate = useNavigate();
  onSettled(() => navigate(paths.app.profile(), { replace: true }));
  return (
    <main class="mx-auto max-w-2xl px-5 py-12 sm:px-8">
      <p class="text-muted" role="status">
        Redirecting to profile…
      </p>
    </main>
  );
}

export default function AccountRedirect() {
  return (
    <RequireSession>
      <RedirectToProfile />
    </RequireSession>
  );
}
