import { cleanup, render, screen } from "@solidjs/testing-library";
import { createSignal, flush, onSettled } from "solid-js";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { AuthContextValue, AuthStatus } from "../../lib/auth/context";
import { AuthContextOverride } from "../../lib/auth/context";
import { RequireSession } from "./RequireSession";

const navigate = vi.fn();

vi.mock("@solidjs/router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@solidjs/router")>();
  return {
    ...actual,
    useNavigate: () => navigate,
    useLocation: () => ({
      pathname: "/account",
      search: "",
      hash: "",
      state: {},
      query: {},
      key: "",
    }),
  };
});

const user = { id: "u1", name: "Test", email: "t@example.test" };

function authValue(partial: {
  status: AuthStatus;
  user?: typeof user;
  retryBootstrap?: () => Promise<void>;
}): AuthContextValue {
  const [status] = createSignal(partial.status);
  const [user] = createSignal(partial.user);
  return {
    status,
    user,
    productClient: { request: vi.fn() } as AuthContextValue["productClient"],
    authApi: {} as AuthContextValue["authApi"],
    coordinator: {} as AuthContextValue["coordinator"],
    supportsAutoRecovery: true,
    establishSession: vi.fn(),
    clearSession: vi.fn(),
    retryBootstrap: partial.retryBootstrap ?? (async () => {}),
    login: vi.fn(),
    logout: vi.fn(),
    revocationUnconfirmed: () => false,
    retryLogout: vi.fn(),
    notifyPeersLoggedOut: vi.fn(),
  };
}

function renderGuard(status: AuthStatus, userArg?: typeof user) {
  return render(() => (
    <AuthContextOverride value={authValue({ status, user: userArg })}>
      <RequireSession>
        <p data-testid="private">Private area</p>
      </RequireSession>
    </AuthContextOverride>
  ));
}

describe("RequireSession", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    navigate.mockClear();
  });

  test("shows loading mark while checking", async () => {
    renderGuard("checking");
    await flush();
    expect(screen.getByRole("status", { name: "Loading" })).toBeTruthy();
    expect(screen.queryByTestId("private")).toBeNull();
  });

  test("shows unavailable with retry", async () => {
    const retry = vi.fn().mockResolvedValue(undefined);
    render(() => (
      <AuthContextOverride value={authValue({ status: "unavailable", retryBootstrap: retry })}>
        <RequireSession>
          <p data-testid="private">Private area</p>
        </RequireSession>
      </AuthContextOverride>
    ));
    await flush();
    expect(screen.getByText(/could not reach/i)).toBeTruthy();
    expect(screen.queryByTestId("private")).toBeNull();
  });

  test("renders children when authenticated", async () => {
    renderGuard("authenticated", user);
    await flush();
    expect(screen.getByTestId("private")).toBeTruthy();
  });

  test("redirects anonymous to login with next", async () => {
    renderGuard("anonymous");
    await flush();
    await new Promise<void>((resolve) => onSettled(() => resolve()));
    await flush();
    expect(navigate).toHaveBeenCalledWith("/login?next=%2Faccount", { replace: true });
    expect(screen.getByRole("status", { name: "Loading" })).toBeTruthy();
  });
});