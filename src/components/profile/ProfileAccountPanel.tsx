import { Show } from "solid-js";
import { paths } from "../../router";
import { Button } from "../ui/Button";
import { ProfileSectionShell } from "./ProfileSectionShell";

export type ProfileAccountPanelProps = {
  name?: string;
  email?: string;
  logoutPending: boolean;
  revocationUnconfirmed: boolean;
  onLogout: () => void;
  onRetryLogout: () => void;
};

export function ProfileAccountPanel(props: ProfileAccountPanelProps) {
  return (
    <ProfileSectionShell
      title="Account"
      description="Sign-in identity and session."
      titleId="profile-account-heading"
    >
      <dl class="grid gap-4 sm:grid-cols-2">
        <div>
          <dt class="text-sm text-muted">Name</dt>
          <dd class="mt-1 text-body font-medium text-ink">{props.name ?? "—"}</dd>
        </div>
        <div>
          <dt class="text-sm text-muted">Email</dt>
          <dd class="mt-1 text-body font-medium text-ink">{props.email ?? "—"}</dd>
        </div>
      </dl>
      <div class="mt-6 flex flex-wrap items-center gap-3">
        <Button
          variant="secondary"
          disabled={props.logoutPending}
          onClick={() => props.onLogout()}
        >
          {props.logoutPending ? "Signing out…" : "Sign out"}
        </Button>
        <a
          class="text-sm text-muted underline-offset-4 hover:underline"
          href={paths["forgot-password"]()}
        >
          Reset password via email
        </a>
      </div>
      <Show when={props.revocationUnconfirmed}>
        <p class="mt-4 text-sm text-warning" role="status">
          Sign-out may not have completed on the server.
        </p>
        <Button class="mt-2" variant="secondary" onClick={() => props.onRetryLogout()}>
          Retry sign-out
        </Button>
      </Show>
    </ProfileSectionShell>
  );
}