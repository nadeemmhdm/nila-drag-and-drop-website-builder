import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
const isWindows = process.platform === 'win32';
const npmCli = resolve(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
const NODE_COMMAND = isWindows ? 'node.exe' : 'node';

function execute(command, args, { allowFailure = false, capture = false } = {}) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit', shell: false });
  if (result.error) { if (allowFailure) return result; throw result.error; }
  if (result.status !== 0 && !allowFailure) throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}.`);
  return result;
}
function runGit(args, options = {}) { return execute('git', args, options); }
function runNode(args, options = {}) { return execute(NODE_COMMAND, args, options); }
function runNpm(args, options = {}) {
  if (isWindows) {
    if (!existsSync(npmCli)) {
      const error = new Error('npm-cli.js was not found next to the active Node.js installation. Reinstall Node.js 22+ with npm included.');
      if (options.allowFailure) return { error, status: 1, stdout: '', stderr: error.message };
      throw error;
    }
    return runNode([npmCli, ...args], options);
  }
  return execute('npm', args, options);
}
function gitWorks() { const result = runGit(['--version'], { allowFailure: true, capture: true }); return !result.error && result.status === 0; }
function npmWorks() { const result = runNpm(['--version'], { allowFailure: true, capture: true }); return !result.error && result.status === 0; }
function doctor() {
  const major = Number(process.versions.node.split('.')[0]);
  if (!Number.isFinite(major) || major < 22) throw new Error(`Node.js 22+ is required. Current: ${process.version}`);
  if (!npmWorks()) throw new Error('npm is required but was not detected. Reinstall Node.js 22+ with npm included, then rerun the installer.');
  if (!existsSync(resolve(root, 'package.json'))) throw new Error('package.json was not found. Run this command from a valid Nila installation.');
  console.log(`Node ${process.version} OK`);
  console.log(`npm ${runNpm(['--version'], { capture: true }).stdout.trim()} OK`);
  console.log(gitWorks() ? 'Git OK' : 'Git not found (source and optional UI-library updates require Git).');
}
function dependencies() {
  console.log('\nChecking and installing missing dependencies...');
  runNpm(['install', '--no-audit', '--no-fund']);
  console.log('\nChecking for compatible dependency updates...');
  runNpm(['outdated'], { allowFailure: true });
  runNpm(['update', '--no-save', '--package-lock=false', '--no-audit', '--no-fund']);
}
function syncVendor() {
  console.log('\nSyncing optional offline ShadcnSpace public library...');
  const result = runNode(['scripts/sync-shadcnspace.mjs'], { allowFailure: true });
  if (result.status !== 0) console.warn('Offline UI library sync did not complete. Nila core remains available.');
}
function verify() { console.log('\nVerifying Nila...'); runNpm(['run', 'verify']); }
function repair() { doctor(); dependencies(); syncVendor(); verify(); console.log('\nNila dependencies and the available offline UI snapshot are ready and verified.'); }
function update() {
  doctor();
  if (!gitWorks()) throw new Error('Git is required for npm run update.');
  const dirty = runGit(['status', '--porcelain', '--untracked-files=no'], { capture: true }).stdout.trim();
  if (dirty) throw new Error('Tracked local source changes detected. Commit or revert them before updating.');
  console.log('\nUpdating Nila source...');
  runGit(['pull', '--ff-only']);
  dependencies(); syncVendor(); verify();
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
