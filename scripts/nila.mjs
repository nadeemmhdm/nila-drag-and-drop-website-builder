import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function run(command, args, { allowFailure = false, capture = false } = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    shell: false,
  });
  if (result.error) {
    if (allowFailure) return result;
    throw result.error;
  }
  if (result.status !== 0 && !allowFailure) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}.`);
  }
  return result;
}

function commandWorks(command, args = ['--version']) {
  const result = run(command, args, { allowFailure: true, capture: true });
  return !result.error && result.status === 0;
}

function doctor() {
  const major = Number(process.versions.node.split('.')[0]);
  if (!Number.isFinite(major) || major < 22) throw new Error(`Node.js 22+ is required. Current: ${process.version}`);
  if (!commandWorks(npm)) throw new Error('npm is required but was not detected.');
  if (!existsSync(resolve(root, 'package.json'))) throw new Error('package.json was not found. Run this command from a valid Nila installation.');
  console.log(`Node ${process.version} OK`);
  const npmVersion = run(npm, ['--version'], { capture: true }).stdout.trim();
  console.log(`npm ${npmVersion} OK`);
  console.log(commandWorks('git') ? 'Git OK' : 'Git not found (only source updates require Git).');
}

function dependencies() {
  console.log('\nChecking and installing missing dependencies...');
  run(npm, ['install', '--no-audit', '--no-fund']);

  console.log('\nChecking for compatible dependency updates...');
  run(npm, ['outdated'], { allowFailure: true });
  run(npm, ['update', '--no-save', '--package-lock=false', '--no-audit', '--no-fund']);
}

function verify() {
  console.log('\nVerifying Nila...');
  run(npm, ['run', 'verify']);
}

function repair() {
  doctor();
  dependencies();
  verify();
  console.log('\nNila dependencies are installed, updated within compatible ranges, and verified.');
}

function update() {
  doctor();
  if (!commandWorks('git')) throw new Error('Git is required for npm run update.');
  const dirty = run('git', ['status', '--porcelain', '--untracked-files=no'], { capture: true }).stdout.trim();
  if (dirty) throw new Error('Tracked local source changes detected. Commit or revert them before updating.');
  console.log('\nUpdating Nila source...');
  run('git', ['pull', '--ff-only']);
  dependencies();
  verify();
  console.log('\nNila is up to date and verified.');
}

const action = process.argv[2] ?? 'doctor';
try {
  if (action === 'doctor') doctor();
  else if (action === 'repair') repair();
  else if (action === 'update') update();
  else throw new Error(`Unknown Nila command: ${action}`);
} catch (error) {
  console.error(`\nNila: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
