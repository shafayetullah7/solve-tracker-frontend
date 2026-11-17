#!/usr/bin/env node
/**
 * Step 4.7 orchestrator — static checks, 4.1 proxy gate, API races, Playwright e2e.
 * Prereqs: backend :3000, `pnpm dev` on :3001 (or PHASE_47_BASE_URL).
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const BASE = (process.env.PHASE_47_BASE_URL ?? "http://localhost:3001").replace(
  /\/$/,
  "",
);
const rootDir = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(rootDir, "..");

function run(command, args, cwd = frontendRoot) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      shell: false,
      env: process.env,
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} ${args.join(" ")} exited ${code}`)),
    );
  });
}

async function probe() {
  const url = `${BASE}/api/auth/session`;
  try {
    const response = await fetch(url, { redirect: "error" });
    if (response.status === 404)
      throw new Error(`No API at ${url}. Is backend on :3000 and frontend proxy on :3001?`);
  } catch (error) {
    throw new Error(
      `Cannot reach ${url}. Start backend (pnpm start:dev) and frontend (pnpm dev). ${error.message ?? error}`,
    );
  }
  console.log(`OK: prereq probe ${url}`);
}

async function main() {
  await probe();
  await run("pnpm", ["exec", "tsc", "--noEmit"]);
  await run("pnpm", ["lint"]);
  await run("pnpm", ["test", "--run"]);
  await run("pnpm", ["api:check"]);
  await run("node", ["scripts/verify-phase-4.1.mjs"]);
  await run("node", ["scripts/verify-phase-4.7-api.mjs"]);
  await run("pnpm", ["--dir", "../solve-tracker-backend", "build"]);
  await run("pnpm", ["exec", "playwright", "test", "-c", "e2e/playwright.config.ts"]);
  console.log("Phase 4.7 full verification passed.");
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});