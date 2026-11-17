#!/usr/bin/env node
/**
 * DEPLOY-1 gate — server must already be listening (see docs/DEPLOY.md).
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(rootDir, "..");

function run(scriptName) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(rootDir, scriptName)], {
      cwd: frontendRoot,
      stdio: "inherit",
      env: process.env,
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${scriptName} exited ${code ?? "unknown"}`)),
    );
  });
}

const steps = ["smoke-ssr.mjs", "verify-ssr-1.mjs", "verify-ssr-2.mjs"];

try {
  for (const step of steps) {
    console.log(`\n== ${step} ==`);
    await run(step);
  }
  console.log("\nok verify:deploy (all steps passed)");
} catch (error) {
  console.error("\nfail verify:deploy:", error.message ?? error);
  process.exit(1);
}