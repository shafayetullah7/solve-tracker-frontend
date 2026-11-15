import type { ParentProps } from "solid-js";
import {
  createContext,
  createSignal,
  onSettled,
  untrack,
  useContext,
} from "solid-js";
import type { ApiClient } from "../api/client";
import type {
  createAuthApi,
  LoginInput,
} from "../api/modules/auth.api";
import { createAuthClients } from "./clients";
import type { AuthCoordinator } from "./coordinator";
import { createAuthCrossTab, createTabId, type AuthCrossTab } from "./cross-tab";
import {
  resolveBootstrapSession,
  type AuthUser,
  type BootstrapResult,
} from "./session-state";

export type AuthStatus =
  | "checking"
  | "authenticated"
  | "anonymous"
  | "unavailable";

export type AuthClientsBundle = ReturnType<typeof createAuthClients>;

export type AuthContextValue = {
  status: () => AuthStatus;
  user: () => AuthUser | undefined;
  productClient: ApiClient;
  authApi: ReturnType<typeof createAuthApi>;
  coordinator: AuthCoordinator;
  supportsAutoRecovery: boolean;
  revocationUnconfirmed: () => boolean;
  establishSession: (user: AuthUser) => void;
  clearSession: () => void;
  retryBootstrap: () => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  retryLogout: () => Promise<void>;
  notifyPeersLoggedOut: () => void;
};

const AuthContext = createContext<AuthContextValue>();

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

/** Test and story overrides without bootstrapping network. */
export function AuthContextOverride(
  props: ParentProps<{ value: AuthContextValue }>,
) {
  return <AuthContext value={props.value}>{props.children}</AuthContext>;
}

function applyBootstrapResult(
  result: BootstrapResult,
  setStatus: (value: AuthStatus) => void,
  setUser: (value: AuthUser | undefined) => void,
) {
  switch (result.kind) {
    case "authenticated":
      setUser(result.user);
      setStatus("authenticated");
      break;
    case "anonymous":
      setUser(undefined);
      setStatus("anonymous");
      break;
    case "unavailable":
      setUser(undefined);
      setStatus("unavailable");
      break;
    case "cancelled":
      break;
  }
}

export function AuthProvider(
  props: ParentProps<{ clients?: AuthClientsBundle }>,
) {
  const bundle =
    untrack(() => props.clients) ?? createAuthClients();
  const [status, setStatus] = createSignal<AuthStatus>("checking");
  const [user, setUser] = createSignal<AuthUser | undefined>();
  const [revocationUnconfirmed, setRevocationUnconfirmed] = createSignal(false);

  let bootstrapGeneration = 0;
  let crossTab: AuthCrossTab | undefined;

  async function runBootstrap() {
    const generation = ++bootstrapGeneration;
    setStatus("checking");
    setUser(undefined);
    const result = await resolveBootstrapSession(
      bundle.authApi,
      bundle.coordinator,
      { isAborted: () => generation !== bootstrapGeneration },
    );
    if (generation !== bootstrapGeneration) return;
    applyBootstrapResult(result, setStatus, setUser);
  }

  async function onPeerInvalidate() {
    bootstrapGeneration += 1;
    await runBootstrap();
  }

  async function callServerLogout(): Promise<boolean> {
    try {
      await bundle.coordinator.runWithSessionLock(() =>
        bundle.authApi.logout(),
      );
      setRevocationUnconfirmed(false);
      return true;
    } catch {
      setRevocationUnconfirmed(true);
      return false;
    }
  }

  onSettled(() => {
    if (typeof document === "undefined") return;
    const tabId = createTabId();
    crossTab = createAuthCrossTab({
      tabId,
      broadcast: bundle.broadcast,
      coordinator: bundle.coordinator,
      onInvalidate: onPeerInvalidate,
    });
    const unsubscribe = bundle.broadcast.subscribe((message) =>
      crossTab!.handleMessage(message),
    );
    void runBootstrap();
    return () => {
      bootstrapGeneration += 1;
      unsubscribe();
      crossTab?.close();
      crossTab = undefined;
    };
  });

  const value: AuthContextValue = {
    status,
    user,
    productClient: bundle.productClient,
    authApi: bundle.authApi,
    coordinator: bundle.coordinator,
    supportsAutoRecovery: bundle.coordinator.supportsAutoRecovery,
    revocationUnconfirmed,
    establishSession(sessionUser) {
      setUser(sessionUser);
      setStatus("authenticated");
    },
    clearSession() {
      bundle.coordinator.bumpEpoch();
      setUser(undefined);
      setStatus("anonymous");
    },
    retryBootstrap: runBootstrap,
    notifyPeersLoggedOut() {
      crossTab?.publishLoggedOut();
    },
    async login(input) {
      const startEpoch = bundle.coordinator.getEpoch();
      const session = await bundle.coordinator.runWithSessionLock(() =>
        bundle.authApi.login(input),
      );
      if (bundle.coordinator.getEpoch() !== startEpoch) return;
      setUser(session.user);
      setStatus("authenticated");
      setRevocationUnconfirmed(false);
      crossTab?.publishSessionChanged();
    },
    async logout() {
      bundle.coordinator.bumpEpoch();
      setUser(undefined);
      setStatus("anonymous");
      crossTab?.publishLoggedOut();
      await callServerLogout();
    },
    async retryLogout() {
      await callServerLogout();
    },
  };

  return <AuthContext value={value}>{props.children}</AuthContext>;
}