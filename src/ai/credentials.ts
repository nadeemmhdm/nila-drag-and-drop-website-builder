import type { AiProvider } from './client';

export interface SavedAiCredentials {
  apiKeys: Partial<Record<AiProvider, string>>;
}

type EncryptedSecret = { iv: number[]; cipher: number[] };

const DB_NAME = 'nila-ai-vault';
const STORE_NAME = 'vault';
const DB_VERSION = 1;
const MASTER_KEY_ID = 'master-key';
const LEGACY_CREDENTIALS_KEY = 'nila-ai-credentials-v1';
const providers: AiProvider[] = ['ollama', 'gemini', 'openai', 'custom'];
const cache: Partial<Record<AiProvider, string>> = {};
let initialized = false;
let initPromise: Promise<void> | null = null;

function request<T = unknown>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('AI vault request failed.'));
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('AI vault transaction failed.'));
    tx.onabort = () => reject(tx.error ?? new Error('AI vault transaction aborted.'));
  });
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('Unable to open the AI vault.'));
  });
}

async function getMasterKey(db: IDBDatabase): Promise<CryptoKey> {
  const readTx = db.transaction(STORE_NAME, 'readonly');
  const existing = await request(readTx.objectStore(STORE_NAME).get(MASTER_KEY_ID));
  await txDone(readTx);
  if (existing) return existing as CryptoKey;
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  const writeTx = db.transaction(STORE_NAME, 'readwrite');
  writeTx.objectStore(STORE_NAME).put(key, MASTER_KEY_ID);
  await txDone(writeTx);
  return key;
}

async function encryptSecret(key: CryptoKey, value: string): Promise<EncryptedSecret> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(value);
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext));
  return { iv: Array.from(iv), cipher: Array.from(encrypted) };
}

async function decryptSecret(key: CryptoKey, value: EncryptedSecret): Promise<string> {
  const iv = new Uint8Array(value.iv);
  const cipher = new Uint8Array(value.cipher);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
  return new TextDecoder().decode(decrypted);
}

async function writeSecret(db: IDBDatabase, key: CryptoKey, provider: AiProvider, value: string) {
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const clean = value.trim();
  if (clean) store.put(await encryptSecret(key, value), `provider:${provider}`);
  else store.delete(`provider:${provider}`);
  await txDone(tx);
}

async function migrateLegacy(db: IDBDatabase, key: CryptoKey) {
  if (typeof localStorage === 'undefined') return;
  const raw = localStorage.getItem(LEGACY_CREDENTIALS_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as { apiKeys?: Record<string, unknown> };
    for (const provider of providers) {
      const value = parsed.apiKeys?.[provider];
      if (typeof value === 'string' && value.trim()) await writeSecret(db, key, provider, value);
    }
  } catch {
    // Ignore malformed legacy state; it is removed below.
  }
  localStorage.removeItem(LEGACY_CREDENTIALS_KEY);
}

export function initializeAiCredentials(): Promise<void> {
  if (initialized) return Promise.resolve();
  if (initPromise) return initPromise;
  initPromise = (async () => {
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined' || !crypto?.subtle) {
      initialized = true;
      return;
    }
    try {
      const db = await openDb();
      const key = await getMasterKey(db);
      await migrateLegacy(db, key);
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const values = await Promise.all(providers.map((provider) => request(store.get(`provider:${provider}`))));
      await txDone(tx);
      for (let index = 0; index < providers.length; index += 1) {
        const encrypted = values[index] as EncryptedSecret | undefined;
        if (!encrypted) continue;
        try {
          const value = await decryptSecret(key, encrypted);
          if (value.trim()) cache[providers[index]] = value;
        } catch {
          // A corrupt secret is ignored rather than exposing or blocking the editor.
        }
      }
      db.close();
    } catch {
      // If persistent crypto storage is unavailable, keys still work in memory for this app session.
    } finally {
      initialized = true;
    }
  })();
  return initPromise;
}

export function loadAiCredentials(): SavedAiCredentials {
  return { apiKeys: { ...cache } };
}

export function loadAiApiKey(provider: AiProvider) {
  return cache[provider] ?? '';
}

export function saveAiApiKey(provider: AiProvider, apiKey: string) {
  const clean = apiKey.trim();
  if (clean) cache[provider] = apiKey;
  else delete cache[provider];
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined' || !crypto?.subtle) return;
  void (async () => {
    try {
      await initializeAiCredentials();
      const db = await openDb();
      const key = await getMasterKey(db);
      await writeSecret(db, key, provider, apiKey);
      db.close();
    } catch {
      // Memory cache remains available even if encrypted persistence fails.
    }
  })();
}

export function clearAiApiKey(provider: AiProvider) {
  saveAiApiKey(provider, '');
}
