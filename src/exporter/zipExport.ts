import { strToU8, zipSync } from 'fflate';
import type { ExportFile } from './types';

export function buildZip(files: ExportFile[]): Uint8Array {
  const entries: Record<string, Uint8Array> = {};
  for (const file of files) entries[file.path] = typeof file.content === 'string' ? strToU8(file.content) : file.content;
  return zipSync(entries, { level: 6 });
}

export function downloadZip(files: ExportFile[], fileName: string) {
  const zip = buildZip(files);
  const buffer = zip.buffer.slice(zip.byteOffset, zip.byteOffset + zip.byteLength) as ArrayBuffer;
  const url = URL.createObjectURL(new Blob([buffer], { type: 'application/zip' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName.endsWith('.zip') ? fileName : `${fileName}.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
