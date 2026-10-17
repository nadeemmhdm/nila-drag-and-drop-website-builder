import type { AssetKind, NilaAsset, NilaFont } from '../core/project';

export const MAX_TOTAL_ASSET_BYTES = 80 * 1024 * 1024;

const LIMITS: Record<AssetKind, number> = {
  image: 15 * 1024 * 1024,
  video: 60 * 1024 * 1024,
  font: 12 * 1024 * 1024,
};

const EXTENSIONS: Record<string, AssetKind> = {
  png: 'image', jpg: 'image', jpeg: 'image', webp: 'image', gif: 'image',
  mp4: 'video', webm: 'video',
  woff2: 'font', woff: 'font', ttf: 'font', otf: 'font',
};

export const ASSET_ACCEPT = '.png,.jpg,.jpeg,.webp,.gif,.mp4,.webm,.woff2,.woff,.ttf,.otf';
export const IMAGE_ACCEPT = '.png,.jpg,.jpeg,.webp,.gif';
export const VIDEO_ACCEPT = '.mp4,.webm';

function extensionOf(name: string) {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

export function classifyAsset(file: File): AssetKind {
  const extension = extensionOf(file.name);
  const kind = EXTENSIONS[extension];
  if (!kind) throw new Error(`Unsupported file type: .${extension || 'unknown'}`);
  if (file.type === 'image/svg+xml' || extension === 'svg') throw new Error('SVG uploads are blocked until sanitization is enabled.');
  if (kind === 'image' && file.type && !file.type.startsWith('image/')) throw new Error('Image extension and MIME type do not match.');
  if (kind === 'video' && file.type && !file.type.startsWith('video/')) throw new Error('Video extension and MIME type do not match.');
  return kind;
}

export function sanitizeFileName(name: string) {
  const extension = extensionOf(name);
  const base = name.replace(/\.[^.]+$/, '').normalize('NFKD').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase().slice(0, 64) || 'asset';
  return extension ? `${base}.${extension}` : base;
}

export function uniqueFileName(name: string, assets: NilaAsset[]) {
  const safe = sanitizeFileName(name);
  const dot = safe.lastIndexOf('.');
  const base = dot > 0 ? safe.slice(0, dot) : safe;
  const extension = dot > 0 ? safe.slice(dot) : '';
  const used = new Set(assets.map((asset) => asset.fileName));
  if (!used.has(safe)) return safe;
  let index = 2;
  while (used.has(`${base}-${index}${extension}`)) index += 1;
  return `${base}-${index}${extension}`;
}

export function projectPathForAsset(kind: AssetKind, fileName: string) {
  return kind === 'font' ? `src/assets/fonts/${fileName}` : `public/assets/media/${fileName}`;
}

export function publicUrlForAsset(asset: Pick<NilaAsset, 'kind' | 'fileName'>) {
  return asset.kind === 'font' ? `/assets/fonts/${asset.fileName}` : `/assets/media/${asset.fileName}`;
}

export async function createAssetFromFile(file: File, assets: NilaAsset[]): Promise<NilaAsset> {
  const kind = classifyAsset(file);
  if (file.size <= 0) throw new Error('Empty files are not allowed.');
  if (file.size > LIMITS[kind]) throw new Error(`${kind} file is too large.`);
  await validateSignature(file, extensionOf(file.name));
  const fileName = uniqueFileName(file.name, assets);
  const dataUrl = await readAsDataUrl(file);
  return {
    id: crypto.randomUUID(),
    name: file.name,
    fileName,
    kind,
    mimeType: file.type || mimeFromExtension(extensionOf(file.name)),
    size: file.size,
    dataUrl,
    projectPath: projectPathForAsset(kind, fileName),
    createdAt: new Date().toISOString(),
  };
}

export function createFontFromAsset(asset: NilaAsset, fonts: NilaFont[]): NilaFont {
  if (asset.kind !== 'font') throw new Error('Only font assets can be registered as fonts.');
  const base = asset.fileName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, (value) => value.toUpperCase()) || 'Project Font';
  const used = new Set(fonts.map((font) => font.family));
  let family = base;
  let index = 2;
  while (used.has(family)) { family = `${base} ${index}`; index += 1; }
  return { id: crypto.randomUUID(), family, assetId: asset.id, weight: '400', style: 'normal', format: fontFormat(asset.fileName) };
}

export function clearAssetReference<T extends { props: { assetId?: string }; children: T[] }>(nodes: T[], assetId: string): T[] {
  return nodes.map((node) => ({ ...node, props: node.props.assetId === assetId ? { ...node.props, assetId: undefined } : node.props, children: clearAssetReference(node.children, assetId) }));
}

function fontFormat(name: string): NilaFont['format'] {
  const extension = extensionOf(name);
  if (extension === 'woff2') return 'woff2';
  if (extension === 'woff') return 'woff';
  if (extension === 'otf') return 'opentype';
  return 'truetype';
}

function mimeFromExtension(extension: string) {
  const values: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', mp4: 'video/mp4', webm: 'video/webm', woff2: 'font/woff2', woff: 'font/woff', ttf: 'font/ttf', otf: 'font/otf' };
  return values[extension] ?? 'application/octet-stream';
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the selected file.'));
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Invalid file data.'));
    reader.readAsDataURL(file);
  });
}

async function validateSignature(file: File, extension: string) {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const ascii = (start: number, length: number) => String.fromCharCode(...bytes.slice(start, start + length));
  const valid = (() => {
    if (extension === 'png') return bytes[0] === 0x89 && ascii(1, 3) === 'PNG';
    if (extension === 'jpg' || extension === 'jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    if (extension === 'gif') return ascii(0, 4) === 'GIF8';
    if (extension === 'webp') return ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP';
    if (extension === 'mp4') return ascii(4, 4) === 'ftyp';
    if (extension === 'webm') return bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
    if (extension === 'woff') return ascii(0, 4) === 'wOFF';
    if (extension === 'woff2') return ascii(0, 4) === 'wOF2';
    if (extension === 'otf') return ascii(0, 4) === 'OTTO';
    if (extension === 'ttf') return (bytes[0] === 0x00 && bytes[1] === 0x01 && bytes[2] === 0x00 && bytes[3] === 0x00) || ascii(0, 4) === 'true';
    return false;
  })();
  if (!valid) throw new Error('File signature does not match the selected file type.');
}
