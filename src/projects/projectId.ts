const ALPHANUM = /[^a-zA-Z0-9]/g;

function fnv1a(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
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
