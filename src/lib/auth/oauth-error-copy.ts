const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAUTH_STATE_INVALID:
    "Sign-in with Google could not be started or verified. Try again.",
  OAUTH_TOKEN_EXCHANGE_FAILED:
    "Google sign-in did not complete. Try again or use email and password.",
  OAUTH_ID_TOKEN_INVALID:
    "Google sign-in could not be verified. Try again or use email and password.",
  OAUTH_EMAIL_UNVERIFIED:
    "Your Google email must be verified before signing in here.",
  OAUTH_ACCOUNT_CONFLICT:
    "This Google account could not be linked. Try email sign-in or contact support.",
  OAUTH_MISCONFIGURED:
    "Google sign-in is not available right now. Use email and password.",
  OAUTH_DISABLED:
    "Google sign-in is not enabled. Use email and password.",
};

const OAUTH_ERROR_FALLBACK =
  "Sign-in with Google did not complete. Try again or use email and password.";

/** Shown when Google OAuth UI is enabled (login, register, profile). */
export const GOOGLE_PRACTICE_LOGOUT_NOTE =
  "Signing out of Google in your browser does not sign you out of Practice. " +
  "When Cross-Account Protection is enabled on the server, Google may end your Practice session after you revoke app access or certain account security events.";

export function oauthErrorMessage(code: string | null | undefined): string | undefined {
  if (code == null || code === "") return undefined;
  return OAUTH_ERROR_MESSAGES[code] ?? OAUTH_ERROR_FALLBACK;
}