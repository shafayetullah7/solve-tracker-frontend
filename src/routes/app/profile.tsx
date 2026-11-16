import { Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { Button } from "../../components/ui/Button";
import { Panel } from "../../components/ui/Panel";
import { useAuth } from "../../lib/auth/context";
import { paths } from "../../router";

export default function ProfilePage() {
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
    <div class="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-14">
      <Title>Profile — Practice</Title>
      <Panel title="Profile" description="Signed-in session for this browser.">
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
          <Button variant="secondary" disabled={logoutPending()} onClick={() => void onLogout()}>
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
      </Panel>
    </div>
  );
}