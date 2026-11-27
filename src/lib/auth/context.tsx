import type { ParentProps } from "solid-js";
import {
  createContext,
  createSignal,
  onSettled,
  untrack,
  useContext,
} from "solid-js";
import { ApiError } from "../api/errors";
import type { ApiClient } from "../api/client";
import type {
  AccountFlags,
  createAuthApi,
  LoginInput,
} from "../api/modules/auth.api";
import { createAuthClients } from "./clients";
import type { AuthCoordinator } from "./coordinator";
import { createAuthCrossTab, createTabId, type AuthCrossTab } from "./cross-tab";
import type { ServerAuthBootstrap } from "./server-session";
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
  account: () => AccountFlags | undefined;
  productClient: ApiClient;
  authApi: ReturnType<typeof createAuthApi>;
  coordinator: AuthCoordinator;
  supportsAutoRecovery: boolean;
  revocationUnconfirmed: () => boolean;
  establishSession: (user: AuthUser) => void;
  clearSession: () => void;
  retryBootstrap: () => Promise<void>;
  reloadSession: () => Promise<void>;
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

function authStatusFromSeed(
  seed: ServerAuthBootstrap | undefined,
): AuthStatus {
  return seed?.kind ?? "checking";
}

function userFromSeed(
  seed: ServerAuthBootstrap | undefined,
): AuthUser | undefined {
  return seed?.kind === "authenticated" ? seed.user : undefined;
}

function applyBootstrapResult(
  result: BootstrapResult,
  setStatus: (value: AuthStatus) => void,
  setUser: (value: AuthUser | undefined) => void,
  setAccount: (value: AccountFlags | undefined) => void,
) {
  switch (result.kind) {
    case "authenticated":
      setUser(result.user);
      setAccount(result.account);
      setStatus("authenticated");
      break;
    case "anonymous":
      setUser(undefined);
      setAccount(undefined);
      setStatus("anonymous");
      break;
    case "unavailable":
      setUser(undefined);
      setAccount(undefined);
      setStatus("unavailable");
      break;
    case "cancelled":
      break;
  }
}

export function AuthProvider(
  props: ParentProps<{
    clients?: AuthClientsBundle;
    /** Test override; production starts with a session-neutral shell. */
    initialBootstrap?: ServerAuthBootstrap;
  }>,
) {
  const { hadSeed, seed } = untrack(() => {
    const resolved = props.initialBootstrap;
    return {
      hadSeed: resolved !== undefined,
      seed: resolved,
    };
  });

  const [status, setStatus] = createSignal<AuthStatus>(
    authStatusFromSeed(seed),
  );
  const [user, setUser] = createSignal<AuthUser | undefined>(
    userFromSeed(seed),
  );
  const [revocationUnconfirmed, setRevocationUnconfirmed] = createSignal(false);
  const [account, setAccount] = createSignal<AccountFlags | undefined>();

  let bootstrapGeneration = 0;
  let crossTab: AuthCrossTab | undefined;

  /** Drop in-flight SSR/client session probes so they cannot clobber a fresh login. */
  function invalidateBootstrapProbe() {
    bootstrapGeneration += 1;
  }

  let bundle: AuthClientsBundle;

  function invalidateLocalSession() {
    invalidateBootstrapProbe();
    bundle.coordinator.bumpEpoch();
    setUser(undefined);
    setAccount(undefined);
    setStatus("anonymous");
  }

  bundle =
    props.clients ??
    createAuthClients({ onSessionInvalidated: invalidateLocalSession });

  async function runBootstrap(options?: { forceChecking?: boolean }) {
    const generation = ++bootstrapGeneration;
    const soft = hadSeed && !options?.forceChecking;
    if (!soft) {
      setStatus("checking");
      setUser(undefined);
      setAccount(undefined);
    }
    const result = await resolveBootstrapSession(
      bundle.authApi,
      bundle.coordinator,
      { isAborted: () => generation !== bootstrapGeneration },
    );
    if (generation !== bootstrapGeneration) return;
    applyBootstrapResult(result, setStatus, setUser, setAccount);
  }

  async function reloadSession() {
    const session = await bundle.coordinator.runWithSessionLock(() =>
      bundle.authApi.getSession(),
    );
    setUser(session.user);
    setAccount(session.account);
    setStatus("authenticated");
  }

  async function onPeerInvalidate() {
    bootstrapGeneration += 1;
    await runBootstrap({ forceChecking: true });
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
    account,
    productClient: bundle.productClient,
    authApi: bundle.authApi,
    coordinator: bundle.coordinator,
    supportsAutoRecovery: bundle.coordinator.supportsAutoRecovery,
    revocationUnconfirmed,
    establishSession(sessionUser) {
      invalidateBootstrapProbe();
      setUser(sessionUser);
      setAccount(undefined);
      setStatus("authenticated");
    },
    clearSession: invalidateLocalSession,
    retryBootstrap: () => runBootstrap({ forceChecking: true }),
    reloadSession,
    notifyPeersLoggedOut() {
      crossTab?.publishLoggedOut();
    },
    async login(input) {
      invalidateBootstrapProbe();
      const startEpoch = bundle.coordinator.getEpoch();
      const session = await bundle.coordinator.runWithSessionLock(() =>
        bundle.authApi.login(input),
      );
      if (bundle.coordinator.getEpoch() !== startEpoch) {
        throw new ApiError(
          "context-changed",
          "Authentication context changed.",
        );
      }
      setUser(session.user);
      setAccount(session.account);
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