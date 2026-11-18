import { Show } from "solid-js";
import { googleOAuthLinkHref, isGoogleOAuthEnabled } from "../../lib/auth/google-oauth";
import { GOOGLE_PRACTICE_LOGOUT_NOTE } from "../../lib/auth/oauth-error-copy";
import type { AccountFlags } from "../../lib/api/modules/auth.api";
import { IconGoogle } from "../../icons/IconGoogle";
import { Button } from "../ui/Button";
import { ProfileSectionShell } from "./ProfileSectionShell";

export type ProfileConnectedAccountsPanelProps = {
  account: () => AccountFlags | undefined;
  unlinkPending: boolean;
  oauthBanner?: string;
  onUnlink: () => void;
  onSetPassword: () => void;
};

export function ProfileConnectedAccountsPanel(
  props: ProfileConnectedAccountsPanelProps,
) {
  const flags = () => props.account();
  const googleEnabled = isGoogleOAuthEnabled();

  return (
    <ProfileSectionShell
      title="Connected accounts"
      description="Link Google for one-click sign-in, or manage an existing connection."
      titleId="profile-connected-accounts-heading"
    >
      <Show when={props.oauthBanner}>
        {(message) => (
          <p class="mb-4 text-sm text-muted" role="status">
            {message()}
          </p>
        )}
      </Show>
      <Show
        when={flags()?.googleLinked}
        fallback={
          <Show when={googleEnabled}>
            <a
              class="ui-button inline-flex items-center justify-center gap-2.5 no-underline"
              data-variant="secondary"
              href={googleOAuthLinkHref()}
            >
              <IconGoogle class="size-5 shrink-0" />
              Link Google account
            </a>
          </Show>
        }
      >
        <p class="text-sm text-ink">
          Google is linked to this account.
        </p>
        <Show
          when={flags()?.hasPassword}
          fallback={
            <div class="mt-4 space-y-3">
              <p class="text-sm text-muted">
                Set a password on this account before you can unlink Google.
              </p>
              <Button variant="secondary" onClick={() => props.onSetPassword()}>
                Set password
              </Button>
            </div>
          }
        >
          <Button
            class="mt-4"
            variant="secondary"
            disabled={props.unlinkPending}
            onClick={() => props.onUnlink()}
          >
            {props.unlinkPending ? "Unlinking…" : "Unlink Google"}
          </Button>
        </Show>
      </Show>
      <Show when={!googleEnabled && !flags()?.googleLinked}>
        <p class="text-sm text-muted">Google sign-in is not enabled in this environment.</p>
      </Show>
      <Show when={googleEnabled}>
        <p class="mt-4 text-xs text-muted">{GOOGLE_PRACTICE_LOGOUT_NOTE}</p>
      </Show>
    </ProfileSectionShell>
  );
}