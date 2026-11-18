import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { ProfileConnectedAccountsPanel } from "./ProfileConnectedAccountsPanel";

vi.mock("../../lib/auth/google-oauth", () => ({
  isGoogleOAuthEnabled: () => true,
  googleOAuthLinkHref: () => "/api/auth/google?mode=link",
}));

describe("ProfileConnectedAccountsPanel", () => {
  test("shows link when Google is not linked", () => {
    render(() => (
      <ProfileConnectedAccountsPanel
        account={() => ({ googleLinked: false, hasPassword: true })}
        unlinkPending={false}
        onUnlink={() => {}}
        onSetPassword={() => {}}
      />
    ));
    expect(screen.getByRole("link", { name: /Link Google account/i })).toBeDefined();
  });

  test("shows set-password CTA when linked without password", () => {
    render(() => (
      <ProfileConnectedAccountsPanel
        account={() => ({ googleLinked: true, hasPassword: false })}
        unlinkPending={false}
        onUnlink={() => {}}
        onSetPassword={() => {}}
      />
    ));
    expect(screen.getByRole("button", { name: /Set password/i })).toBeDefined();
    expect(screen.getByText(/before you can unlink Google/i)).toBeDefined();
  });

  test("shows unlink when linked with password", () => {
    render(() => (
      <ProfileConnectedAccountsPanel
        account={() => ({ googleLinked: true, hasPassword: true })}
        unlinkPending={false}
        onUnlink={() => {}}
        onSetPassword={() => {}}
      />
    ));
    expect(screen.getByRole("button", { name: /Unlink Google/i })).toBeDefined();
  });
});