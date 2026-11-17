import type { ServerAuthBootstrap } from "../lib/auth/server-session";

declare module "@solidjs/web" {
  interface RequestEventLocals {
    /** Set by `config/auth-gate.ts` for document requests; read by `AuthProvider` during SSR. */
    practiceAuthBootstrap?: ServerAuthBootstrap;
  }
}
