import type { ExportFile } from '../exporter/types';
import { getProjectMeta } from '../projects/projectMeta';

type VendorFile = { path: string; target: string; type: string; url: string };
type VendorItem = { name: string; title: string; kind: string; dependencies: string[]; registryDependencies: string[]; files: VendorFile[] };
type VendorManifest = { source: string; revision: string; license: string; items: VendorItem[] };

const MAX_VENDOR_FILE_BYTES = 2 * 1024 * 1024;
const MAX_VENDOR_TOTAL_BYTES = 24 * 1024 * 1024;

function cleanPath(value: string) {
  const normalized = value.replaceAll('\\', '/').replace(/^\/+/, '');
  if (!normalized || normalized.includes('..') || normalized.includes('\0')) return null;
  return normalized;
}

function dependencyName(value: string, knownNames: Set<string>) {
  if (knownNames.has(value)) return value;
  const clean = value.split('?')[0].replace(/\/$/, '');
  const candidate = clean.split('/').filter(Boolean).at(-1) ?? clean;
  return knownNames.has(candidate) ? candidate : null;
}

function collectItems(manifest: VendorManifest, installedIds: string[]) {
  const byName = new Map(manifest.items.map((item) => [item.name, item]));
  const knownNames = new Set(byName.keys());
  const selected = new Map<string, VendorItem>();
  const visit = (name: string) => {
    if (selected.has(name)) return;
    const item = byName.get(name);
    if (!item) return;
    selected.set(name, item);
    for (const dependency of item.registryDependencies ?? []) {
      const resolved = dependencyName(dependency, knownNames);
      if (resolved) visit(resolved);
    }
  };
  installedIds.forEach(visit);
  return [...selected.values()];
}

async function fetchLocalBytes(url: string) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Unable to read local vendored source: ${url}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > MAX_VENDOR_FILE_BYTES) throw new Error(`Vendored source file is too large: ${url}`);
  return bytes;
}

async function fetchLicense(): Promise<ExportFile | null> {
  for (const name of ['LICENSE.md', 'LICENSE']) {
    const response = await fetch(`/vendor/shadcnspace/${name}`, { cache: 'no-store' });
    if (response.ok) return { path: 'vendor/shadcnspace/LICENSE.md', content: await response.text() };
  }
  return null;
}

export async function loadInstalledVendorFiles(projectId: string): Promise<ExportFile[]> {
  const installedIds = getProjectMeta(projectId).installedLibraryIds;
  if (!installedIds.length) return [];

  const response = await fetch('/vendor/shadcnspace/manifest.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('The offline ShadcnSpace source snapshot is not synced. Run npm run vendor:sync once while online.');
  const manifest = await response.json() as VendorManifest;
  const items = collectItems(manifest, installedIds);
  if (!items.length) return [];

  const files: ExportFile[] = [];
  const seen = new Set<string>();
  let totalBytes = 0;
  for (const item of items) {
    for (const file of item.files ?? []) {
      const sourcePath = cleanPath(file.path);
      if (!sourcePath || seen.has(sourcePath)) continue;
      const bytes = await fetchLocalBytes(file.url);
      totalBytes += bytes.byteLength;
      if (totalBytes > MAX_VENDOR_TOTAL_BYTES) throw new Error('Installed offline library source exceeds the 24 MB export safety limit. Remove unused library items and retry.');
      seen.add(sourcePath);
      files.push({ path: `vendor/shadcnspace/source/${sourcePath}`, content: bytes, binary: true });
    }
  }

  const dependencyList = [...new Set(items.flatMap((item) => item.dependencies ?? []))].sort();
  files.push({
    path: 'vendor/shadcnspace/installed.json',
    content: JSON.stringify({
      source: manifest.source,
      revision: manifest.revision,
      license: manifest.license,
      installed: items.map((item) => ({ name: item.name, title: item.title, kind: item.kind, dependencies: item.dependencies, registryDependencies: item.registryDependencies, files: item.files.map((file) => file.path) })),
      packageDependencies: dependencyList,
      note: 'Vendored public source selected in Nila. Source is kept outside src so the generated application remains buildable until you intentionally integrate a component.',
    }, null, 2) + '\n',
  });
  const license = await fetchLicense();
  if (license) files.push(license);
  return files;
}
