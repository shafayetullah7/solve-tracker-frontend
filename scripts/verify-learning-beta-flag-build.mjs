#!/usr/bin/env node
/**
 * Verify the production client bundle includes learning routes (always-on UI).
 */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir = path.join(frontendRoot, 'dist', 'client', 'assets');

function runBuild() {
  return new Promise((resolve, reject) => {
    const child = spawn('pnpm', ['exec', 'vite', 'build'], {
      cwd: frontendRoot,
      stdio: 'inherit',
      shell: false,
      env: {
        ...process.env,
        VITE_PUBLIC_SITE_URL:
          process.env.VITE_PUBLIC_SITE_URL ?? 'http://localhost:3001',
      },
    });
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`vite build exited ${code}`)),
    );
  });
}

function assertRouterReferencesLearning() {
  assert.ok(fs.existsSync(assetsDir), `missing ${assetsDir} after build`);
  const routerFiles = fs
    .readdirSync(assetsDir)
    .filter((name) => name.startsWith('router-') && name.endsWith('.js'));
  assert.ok(routerFiles.length >= 1, 'router chunk missing from client assets');
  const text = fs.readFileSync(path.join(assetsDir, routerFiles[0]), 'utf8');
  assert.ok(
    text.includes('learning-guides.api'),
    'router lazy map must reference learning-guides.api chunk',
  );
}

function assertLearningNavCopyPresent() {
  let found = false;
  for (const name of fs.readdirSync(assetsDir)) {
    if (!name.endsWith('.js')) continue;
    const text = fs.readFileSync(path.join(assetsDir, name), 'utf8');
    if (text.includes('Study guides')) {
      found = true;
      break;
    }
  }
  assert.ok(found, 'client bundle must include Study guides nav copy');
}

function assertNoDisabledLearningGateCopy() {
  for (const name of fs.readdirSync(assetsDir)) {
    if (!name.endsWith('.js')) continue;
    const text = fs.readFileSync(path.join(assetsDir, name), 'utf8');
    assert.ok(
      !text.includes('VITE_LEARNING_GUIDES_ENABLED=true'),
      `${name} must not ship disabled-learning gate copy`,
    );
  }
}

async function main() {
  console.log('Learning guides build — always-on client bundle …');
  await runBuild();
  assertRouterReferencesLearning();
  assertLearningNavCopyPresent();
  assertNoDisabledLearningGateCopy();
  console.log('Learning guides always-on build verification passed.');
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});