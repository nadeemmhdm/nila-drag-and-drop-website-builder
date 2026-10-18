import type { WorkspaceId } from '../workspace/types';

const ALPHANUM = /[^a-zA-Z0-9]/g;

function fnv1a(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function byte(): number {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const value = new Uint8Array(1);
    crypto.getRandomValues(value);
    return value[0];
  }
  return Math.floor(Math.random() * 256);
}

/**
 * Generates a persistent RFC4122 v4 workspace/page ID without relying only on
 * crypto.randomUUID(). This keeps project creation working in browsers where
 * randomUUID is unavailable while remaining compatible with workspace validation.
 */
export function createWorkspaceId(): WorkspaceId {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = Array.from({ length: 16 }, () => byte());
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.map((value) => value.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}` as WorkspaceId;
}

/**
 * Stable human-readable project code derived from the persisted workspace UUID.
 * The underlying workspace ID remains the IndexedDB primary key; this code is
 * safe to show in the UI and remains identical after refresh/reopen.
 */
export function projectDisplayId(workspaceId: string): string {
  const compact = workspaceId.replace(ALPHANUM, '').toUpperCase();
  const head = (compact.slice(0, 4) || 'NILA').padEnd(4, '0');
  const hash = fnv1a(workspaceId).toString(36).toUpperCase().padStart(6, '0').slice(-6);
  return `NILA-${head}${hash}`;
}
