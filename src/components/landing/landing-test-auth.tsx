import type { ParentProps } from "solid-js";
import { vi } from "vitest";
import type { AuthContextValue } from "../../lib/auth/context";
import { AuthContextOverride } from "../../lib/auth/context";

export function landingAuthStub(
  overrides?: Partial<AuthContextValue>,
): AuthContextValue {
  return {
    status: () => "anonymous",
    user: () => undefined,
    productClient: { request: vi.fn() } as AuthContextValue["productClient"],
    authApi: {} as AuthContextValue["authApi"],
    coordinator: {} as AuthContextValue["coordinator"],
    supportsAutoRecovery: false,
    revocationUnconfirmed: () => false,
    establishSession: vi.fn(),
    clearSession: vi.fn(),
    retryBootstrap: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    retryLogout: vi.fn(),
    notifyPeersLoggedOut: vi.fn(),
    ...overrides,
  };
}

export function LandingTestAuth(
  props: ParentProps<{ value?: AuthContextValue }>,
) {
  return (
    <AuthContextOverride value={props.value ?? landingAuthStub()}>
      {props.children}
    </AuthContextOverride>
  );
}