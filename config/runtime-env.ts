import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveApiProxyOrigin } from "./api-proxy-origin.ts";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const DEV_DEFAULT_PROXY = "http://localhost:3000";

let dotenvApplied = false;

function parseDotenvLine(line: string): [string, string] | undefined {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return undefined;
  const eq = trimmed.indexOf("=");
  if (eq <= 0) return undefined;
  const key = trimmed.slice(0, eq).trim();
  let value = trimmed.slice(eq + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return [key, value];
}

/** Vite SSR middleware may not inherit shell `process.env` from `.env` — hydrate once. */
export function hydrateRuntimeEnvFromDotenv(): void {
  if (dotenvApplied) return;
  dotenvApplied = true;
  for (const name of [".env", ".env.local"]) {
    const file = path.join(projectRoot, name);
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, "utf8");
    for (const line of text.split("\n")) {
      const parsed = parseDotenvLine(line);
      if (!parsed) continue;
      const [key, value] = parsed;
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
}

function rawApiProxyTarget(): string | undefined {
  hydrateRuntimeEnvFromDotenv();
  if (process.env.API_PROXY_TARGET) {
    return process.env.API_PROXY_TARGET;
  }
  if (process.env.NODE_ENV === "production") {
    return undefined;
  }
  return DEV_DEFAULT_PROXY;
}

/** Resolved backend origin for proxy + SSR session probe. */
export function apiProxyTargetForRuntime(): string {
  return resolveApiProxyOrigin(rawApiProxyTarget());
}