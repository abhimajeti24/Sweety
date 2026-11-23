// After the browser tests: remove the throwaway accounts the register tests created, and put the
// demo data back the way the seed leaves it.
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reseed } from './tests/helpers.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export default function globalTeardown() {
  execSync('node e2e/remove-test-accounts.js', { cwd: ROOT, stdio: 'ignore' });
  reseed();
}
