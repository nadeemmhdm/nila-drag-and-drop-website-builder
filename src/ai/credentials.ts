import type { AiProvider } from './client';

export interface SavedAiCredentials {
  apiKeys: Partial<Record<AiProvider, string>>;
}

const CREDENTIALS_KEY = 'nila-ai-credentials-v1';

function sanitize(value: unknown): SavedAiCredentials {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const raw = source.apiKeys && typeof source.apiKeys === 'object' ? source.apiKeys as Record<string, unknown> : {};
  const apiKeys: Partial<Record<AiProvider, string>> = {};
  for (const provider of ['ollama', 'gemini', 'openai', 'custom'] as AiProvider[]) {
    const key = raw[provider];
    if (typeof key === 'string' && key.trim()) apiKeys[provider] = key;
  }
  return { apiKeys };
}

export function loadAiCredentials(): SavedAiCredentials {
  if (typeof window === 'undefined') return { apiKeys: {} };
  try {
    return sanitize(JSON.parse(localStorage.getItem(CREDENTIALS_KEY) || 'null'));
  } catch {
    return { apiKeys: {} };
  }
}

export function loadAiApiKey(provider: AiProvider) {
  return loadAiCredentials().apiKeys[provider] ?? '';
}

export function saveAiApiKey(provider: AiProvider, apiKey: string) {
  if (typeof window === 'undefined') return;
  const current = loadAiCredentials();
  const next = { ...current.apiKeys };
  const clean = apiKey.trim();
  if (clean) next[provider] = apiKey;
  else delete next[provider];
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify({ apiKeys: next } satisfies SavedAiCredentials));
}

export function clearAiApiKey(provider: AiProvider) {
  saveAiApiKey(provider, '');
}
