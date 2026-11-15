import { useNavigate } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { AuthLayout } from "../components/auth/AuthLayout";
import { RequireSession } from "../components/auth/RequireSession";
import { Button } from "../components/ui/Button";
import { useAuth } from "../lib/auth/context";
import { paths } from "../router";

export default function Account() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [logoutPending, setLogoutPending] = createSignal(false);

  async function onLogout() {
    if (logoutPending()) return;
    setLogoutPending(true);
    try {
      await auth.logout();
      navigate(paths.login());
    } finally {
      setLogoutPending(false);
    }
  }

  return (
    <AuthLayout
      title="Your account"
      description="Signed-in session for this browser."
      pageTitle="Account — Practice"
    >
      <RequireSession>
        <div class="space-y-3">
          <p>
            <span class="text-sm text-muted">Name</span>
            <br />
            <span class="text-body font-medium">{auth.user()?.name}</span>
          </p>
          <p>
            <span class="text-sm text-muted">Email</span>
            <br />
            <span class="text-body font-medium">{auth.user()?.email}</span>
          </p>
          <Button variant="secondary" disabled={logoutPending()} onClick={onLogout}>
            {logoutPending() ? "Signing out…" : "Sign out"}
          </Button>
          <Show when={auth.revocationUnconfirmed()}>
            <p class="text-sm text-warning" role="status">
              Sign-out may not have completed on the server.
            </p>
            <Button
              class="mt-2"
              variant="secondary"
              onClick={() => void auth.retryLogout()}
            >
              Retry sign-out
            </Button>
          </Show>
        </div>
      </RequireSession>
    </AuthLayout>
  );
}