import { cleanup, render, screen } from "@solidjs/testing-library";
import { flush } from "solid-js";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { AuthContextValue } from "../../lib/auth/context";
import { AuthContextOverride } from "../../lib/auth/context";
import { AppSidebar } from "./AppSidebar";

const navigate = vi.fn();

vi.mock("@solidjs/router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@solidjs/router")>();
  return {
    ...actual,
    useNavigate: () => navigate,
    useLocation: () => ({
      pathname: "/app",
      search: "",
      hash: "",
      state: {},
      query: {},
      key: "",
    }),
  };
});

const learningEnabled = vi.hoisted(() => vi.fn(() => false));

vi.mock("../../lib/learning/flag", () => ({
  isLearningGuidesEnabled: () => learningEnabled(),
}));

vi.mock("../../lib/discover/flag", () => ({
  isDiscoverFullEnabled: () => false,
}));

const user = { id: "u1", name: "Test", email: "t@example.test", handle: "test_user" };

function authValue(): AuthContextValue {
  return {
    status: () => "authenticated",
    user: () => user,
    account: () => undefined,
    productClient: { request: vi.fn() } as AuthContextValue["productClient"],
    authApi: {} as AuthContextValue["authApi"],
    coordinator: {} as AuthContextValue["coordinator"],
    supportsAutoRecovery: true,
    establishSession: vi.fn(),
    clearSession: vi.fn(),
    retryBootstrap: async () => {},
    reloadSession: async () => {},
    login: vi.fn(),
    logout: vi.fn().mockResolvedValue(undefined),
    revocationUnconfirmed: () => false,
    retryLogout: vi.fn(),
    notifyPeersLoggedOut: vi.fn(),
  };
}

afterEach(cleanup);

beforeEach(() => {
  learningEnabled.mockReturnValue(false);
});

describe("AppSidebar learning flag", () => {
  test("hides My guides when flag off", () => {
    render(() => (
      <AuthContextOverride value={authValue()}>
        <AppSidebar variant="rail" />
      </AuthContextOverride>
    ));
    expect(screen.queryByRole("link", { name: "My guides" })).toBeNull();
    expect(screen.queryByRole("menuitem", { name: "New guide" })).toBeNull();
  });

  test("shows My guides and guide create items when flag on", async () => {
    learningEnabled.mockReturnValue(true);
    render(() => (
      <AuthContextOverride value={authValue()}>
        <AppSidebar variant="rail" />
      </AuthContextOverride>
    ));
    await flush();
    expect(screen.getByRole("link", { name: "My guides" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "New guide" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Import guide" })).toBeInTheDocument();
  });
});