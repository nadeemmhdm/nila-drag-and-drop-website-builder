import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const vendorRoot = resolve(root, '.nila-vendor', 'shadcnspace');
const publicRoot = resolve(root, 'public', 'vendor', 'shadcnspace');
const sourceRoot = resolve(publicRoot, 'source');
const upstream = 'https://github.com/shadcnspace/shadcnspace.git';
const revision = '315a4366dfa936216a3a00aa24759ad7f043b602';
const manifestPath = resolve(publicRoot, 'manifest.json');

function run(args) {
  return spawnSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], shell: false });
}
function failSoft(message) {
  if (existsSync(manifestPath)) { console.warn(`${message} Using the existing offline ShadcnSpace snapshot.`); process.exit(0); }
  console.warn(`${message} Nila will continue without the optional offline ShadcnSpace library.`); process.exit(0);
}
if (process.env.CI && process.env.NILA_SYNC_VENDOR !== '1') { console.log('Skipping optional ShadcnSpace vendor sync in CI.'); process.exit(0); }
if (run(['--version']).status !== 0) failSoft('Git is unavailable.');
mkdirSync(dirname(vendorRoot), { recursive: true });
if (!existsSync(join(vendorRoot, '.git'))) {
  rmSync(vendorRoot, { recursive: true, force: true });
  const cloned = run(['clone', '--filter=blob:none', '--no-checkout', upstream, vendorRoot]);
  if (cloned.status !== 0) failSoft('Unable to clone the public ShadcnSpace repository.');
}
const fetchResult = spawnSync('git', ['fetch', '--depth=1', 'origin', revision], { cwd: vendorRoot, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] });
if (fetchResult.status !== 0) failSoft('Unable to fetch the pinned ShadcnSpace revision.');
const checkout = spawnSync('git', ['checkout', '--detach', '--force', revision], { cwd: vendorRoot, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] });
if (checkout.status !== 0) failSoft('Unable to checkout the pinned ShadcnSpace revision.');

const registryFile = join(vendorRoot, 'registry.json');
if (!existsSync(registryFile)) failSoft('ShadcnSpace registry.json was not found.');
const registry = JSON.parse(readFileSync(registryFile, 'utf8'));
rmSync(publicRoot, { recursive: true, force: true });
mkdirSync(sourceRoot, { recursive: true });

const copied = new Set();
function copySource(relativePath) {
  const clean = String(relativePath).replaceAll('\\','/').replace(/^\/+/, '');
  if (!clean || clean.includes('..')) return false;
  const from = join(vendorRoot, clean);
  if (!existsSync(from)) return false;
  const to = join(sourceRoot, clean);
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to);
  copied.add(clean);
  return true;
}
function classify(item) {
  if (item.type === 'registry:ui') return 'component';
  if (item.type === 'registry:block') {
    const animated = (item.dependencies || []).some((dep) => /^(motion|framer-motion)$/.test(dep)) || (item.files || []).some((file) => String(file.path).includes('/animations/'));
    return animated ? 'animated' : 'block';
  }
  return 'component';
}
const items = [];
for (const item of Array.isArray(registry.items) ? registry.items : []) {
  const files = [];
  for (const file of Array.isArray(item.files) ? item.files : []) {
    if (copySource(file.path)) files.push({ path: file.path, target: file.target || file.path, type: file.type || 'registry:component', url: `/vendor/shadcnspace/source/${file.path}` });
  }
  items.push({ name:item.name, title:item.title || item.name, description:item.description || '', type:item.type || 'registry:component', kind:classify(item), dependencies:item.dependencies || [], registryDependencies:item.registryDependencies || [], files });
}
const themePath = 'src/app/globals.css';
if (copySource(themePath)) items.unshift({ name:'shadcnspace-theme', title:'ShadcnSpace Theme', description:'Public MIT theme tokens and global styles from the pinned ShadcnSpace snapshot.', type:'registry:theme', kind:'theme', dependencies:[], registryDependencies:[], files:[{path:themePath,target:'src/styles/shadcnspace-theme.css',type:'registry:theme',url:`/vendor/shadcnspace/source/${themePath}`}] });
const licenseCandidates = ['LICENSE.md','LICENSE'];
for (const name of licenseCandidates) if (existsSync(join(vendorRoot,name))) { cpSync(join(vendorRoot,name), join(publicRoot,name)); break; }
writeFileSync(manifestPath, JSON.stringify({ name:'ShadcnSpace Offline Library', source:'shadcnspace/shadcnspace', revision, license:'MIT', generatedAt:new Date().toISOString(), itemCount:items.length, fileCount:copied.size, items }, null, 2));
console.log(`ShadcnSpace offline library ready: ${items.length} items, ${copied.size} source files @ ${revision.slice(0,7)}.`);
