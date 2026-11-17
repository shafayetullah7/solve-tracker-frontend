#!/usr/bin/env node
/**
 * Fail on stale monorepo path names in runnable/contributor artifacts.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const STALE_PATTERNS = [
  { label: "cp-frontend", re: /cp-frontend/ },
  { label: "../backend (not solve-tracker-backend)", re: /\.\.\/backend(?!\/)/ },
  { label: "../backend/", re: /\.\.\/backend\// },
];

function walkFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full));
    else out.push(full);
  }
  return out;
}

function readTargets() {
  const targets = [
    path.join(root, "scripts"),
    path.join(root, "e2e"),
    path.join(root, "package.json"),
    path.join(root, "AGENTS.md"),
  ];
  const files = [];
  for (const t of targets) {
    if (!fs.existsSync(t)) {
      throw new Error(`Missing expected path: ${t}`);
    }
    if (fs.statSync(t).isDirectory()) files.push(...walkFiles(t));
    else files.push(t);
  }
  return files;
}

function main() {
  const offenders = [];
  for (const file of readTargets()) {
    if (path.basename(file) === "verify-repo-paths.mjs") continue;
    if (!/\.(mjs|ts|tsx|json|md)$/.test(file)) continue;
    const text = fs.readFileSync(file, "utf8");
    const rel = path.relative(root, file);
    for (const { label, re } of STALE_PATTERNS) {
      if (re.test(text)) offenders.push({ rel, label });
    }
  }
  if (offenders.length) {
    console.error("Stale repo path references found:\n");
    for (const o of offenders) {
      console.error(`  ${o.rel}: ${o.label}`);
    }
    process.exit(1);
  }
  console.log("OK: no stale cp-frontend or ../backend paths in scripts, e2e, package.json, AGENTS.md");
}

main();