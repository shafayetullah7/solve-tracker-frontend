import { IconGoogle } from "../../icons/IconGoogle";
import { googleOAuthStartHref } from "../../lib/auth/google-oauth";

export type ContinueWithGoogleProps = {
  returnTo?: string;
};

export function ContinueWithGoogle(props: ContinueWithGoogleProps) {
  const href = () => googleOAuthStartHref(props.returnTo);
  return (
    <a
      class="ui-button inline-flex w-full items-center justify-center gap-2.5 no-underline"
      data-variant="secondary"
      href={href()}
    >
      <IconGoogle class="size-5 shrink-0" />
      Continue with Google
    </a>
  );
}