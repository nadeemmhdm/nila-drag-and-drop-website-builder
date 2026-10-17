export type AiProvider = 'ollama' | 'gemini' | 'openai' | 'custom';

export interface AiConnection {
  provider: AiProvider;
  model: string;
  apiKey: string;
  baseUrl?: string;
}

export interface SavedAiSettings {
  provider: AiProvider;
  model: string;
  baseUrl?: string;
}

const SETTINGS_KEY = 'nila-ai-settings-v1';
const OFFICIAL_BASE_URLS: Record<Exclude<AiProvider, 'custom'>, string> = {
  ollama: 'https://ollama.com',
  gemini: 'https://generativelanguage.googleapis.com',
  openai: 'https://api.openai.com',
};

export const AI_DEFAULTS: Record<AiProvider, Omit<AiConnection, 'apiKey'>> = {
  ollama: { provider: 'ollama', model: 'gpt-oss:120b' },
  gemini: { provider: 'gemini', model: 'gemini-3.8-flash' },
  openai: { provider: 'openai', model: 'gpt-6-luna' },
  custom: { provider: 'custom', model: '', baseUrl: 'http://127.0.0.1:11434/v1' },
};

export function usesLocalAiBridge() {
  if (typeof window === 'undefined') return false;
  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
}

export function normalizeOllamaCloudModel(value: string) {
  return value.trim().replace(/-cloud$/i, '');
}

export function loadAiSettings(): SavedAiSettings {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null') as SavedAiSettings | null;
    if (parsed && ['ollama', 'gemini', 'openai', 'custom'].includes(parsed.provider)) {
      if (parsed.provider === 'ollama' && ['qwen3-coder:480b-cloud', 'qwen3-coder:480b'].includes(parsed.model)) {
        return AI_DEFAULTS.ollama;
      }
      return parsed;
    }
  } catch { /* ignore invalid local settings */ }
  return AI_DEFAULTS.ollama;
}

export function saveAiSettings(settings: SavedAiSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function cleanBaseUrl(value: string | undefined) {
  const raw = (value ?? '').trim().replace(/\/+$/, '');
  if (!raw) throw new Error('Base URL is required.');
  let parsed: URL;
  try { parsed = new URL(raw); } catch { throw new Error('Base URL is invalid.'); }
  const local = ['localhost', '127.0.0.1', '[::1]', '::1'].includes(parsed.hostname);
  if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && local)) throw new Error('Custom AI base URL must use HTTPS, except localhost.');
  return raw;
}

function providerUrl(provider: Exclude<AiProvider, 'custom'>, path: string) {
  return usesLocalAiBridge() ? `/__nila/ai/${provider}${path}` : `${OFFICIAL_BASE_URLS[provider]}${path}`;
}

function providerNetworkHelp(provider: AiProvider) {
  if (usesLocalAiBridge() && provider !== 'custom') {
    return 'Nila could not reach the provider through the local AI bridge. Restart Nila after updating (npm start) and retry. Also check your internet connection, API key and firewall.';
  }
  if (provider === 'custom') return 'Could not reach the custom AI endpoint. Check the base URL, server status and CORS settings.';
  return 'The browser could not reach the AI provider. This can be caused by a network/CORS policy. Run Nila locally with npm start so the built-in AI bridge can relay the request.';
}

async function fetchJson(url: string, init: RequestInit, provider: AiProvider) {
  let response: Response;
  try {
    response = await fetch(url, { ...init, cache: 'no-store' });
  } catch (cause) {
    const detail = cause instanceof Error && cause.message && cause.message !== 'Failed to fetch' ? ` ${cause.message}` : '';
    throw new Error(`${providerNetworkHelp(provider)}${detail}`.slice(0, 600));
  }
  const text = await response.text();
  let body: unknown = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!response.ok) {
    const record = body && typeof body === 'object' ? body as Record<string, unknown> : null;
    const error = record?.error;
    const message = typeof error === 'string'
      ? error
      : error && typeof error === 'object' && 'message' in error
        ? String((error as { message?: unknown }).message)
        : typeof record?.message === 'string'
          ? record.message
          : typeof body === 'string' && body.trim()
            ? body
            : `AI request failed (${response.status} ${response.statusText}).`;
    if (response.status === 401 || response.status === 403) throw new Error(`Authentication failed. Check the ${provider} API key and account access. ${message}`.slice(0, 600));
    if (response.status === 404) throw new Error(`Model or API endpoint was not found. Check the selected model. ${message}`.slice(0, 600));
    if (response.status === 429) throw new Error(`Provider rate limit or quota reached. ${message}`.slice(0, 600));
    throw new Error(message.slice(0, 600));
  }
  return body;
}

function requireConnection(connection: AiConnection) {
  const apiKey = connection.apiKey.trim();
  let model = connection.model.trim();
  if (!model) throw new Error('AI model is required.');
  if (connection.provider !== 'custom' && !apiKey) throw new Error('API key is required.');
  if (connection.provider === 'ollama') model = normalizeOllamaCloudModel(model);
  return { apiKey, model };
}

function openAiResponseText(body: unknown): string {
  if (!body || typeof body !== 'object') return '';
  const record = body as Record<string, unknown>;
  if (typeof record.output_text === 'string') return record.output_text;
  const output = Array.isArray(record.output) ? record.output : [];
  for (const item of output) {
    if (!item || typeof item !== 'object') continue;
    const content = Array.isArray((item as Record<string, unknown>).content) ? (item as Record<string, unknown>).content as unknown[] : [];
    for (const part of content) {
      if (!part || typeof part !== 'object') continue;
      const text = (part as Record<string, unknown>).text;
      if (typeof text === 'string') return text;
    }
  }
  return '';
}

export async function listAiModels(connection: AiConnection): Promise<string[]> {
  const apiKey = connection.apiKey.trim();
  if (connection.provider !== 'custom' && !apiKey) throw new Error('Enter the API key before loading models.');

  if (connection.provider === 'ollama') {
    const body = await fetchJson(providerUrl('ollama', '/api/tags'), {
      method: 'GET', headers: { Authorization: `Bearer ${apiKey}` },
    }, 'ollama') as { models?: Array<{ name?: string; model?: string }> };
    return [...new Set((body.models ?? []).map((item) => normalizeOllamaCloudModel(item.model ?? item.name ?? '')).filter(Boolean))].sort();
  }

  if (connection.provider === 'gemini') {
    const body = await fetchJson(providerUrl('gemini', '/v1beta/models?pageSize=1000'), {
      method: 'GET', headers: { 'x-goog-api-key': apiKey },
    }, 'gemini') as { models?: Array<{ name?: string; supportedGenerationMethods?: string[] }> };
    return (body.models ?? [])
      .filter((item) => !item.supportedGenerationMethods || item.supportedGenerationMethods.includes('generateContent'))
      .map((item) => (item.name ?? '').replace(/^models\//, ''))
      .filter(Boolean)
      .sort();
  }

  if (connection.provider === 'openai') {
    const body = await fetchJson(providerUrl('openai', '/v1/models'), {
      method: 'GET', headers: { Authorization: `Bearer ${apiKey}` },
    }, 'openai') as { data?: Array<{ id?: string }> };
    return (body.data ?? []).map((item) => item.id ?? '').filter(Boolean).sort();
  }

  const baseUrl = cleanBaseUrl(connection.baseUrl);
  const headers: Record<string, string> = {};
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  const body = await fetchJson(`${baseUrl}/models`, { method: 'GET', headers }, 'custom') as { data?: Array<{ id?: string }>; models?: Array<{ name?: string; model?: string }> };
  return [...new Set([
    ...(body.data ?? []).map((item) => item.id ?? ''),
    ...(body.models ?? []).map((item) => item.model ?? item.name ?? ''),
  ].filter(Boolean))].sort();
}

export async function callAiText(connection: AiConnection, system: string, user: string): Promise<string> {
  const { apiKey, model } = requireConnection(connection);

  if (connection.provider === 'ollama') {
    const body = await fetchJson(providerUrl('ollama', '/api/chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, stream: false, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
    }, 'ollama') as { message?: { content?: string } };
    const text = body?.message?.content?.trim();
    if (!text) throw new Error('Ollama returned an empty response.');
    return text;
  }

  if (connection.provider === 'gemini') {
    const body = await fetchJson(providerUrl('gemini', `/v1beta/models/${encodeURIComponent(model)}:generateContent`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: user }] }] }),
    }, 'gemini') as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = body?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('').trim();
    if (!text) throw new Error('Gemini returned an empty response.');
    return text;
  }

  if (connection.provider === 'openai') {
    const body = await fetchJson(providerUrl('openai', '/v1/responses'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, instructions: system, input: user }),
    }, 'openai');
    const text = openAiResponseText(body).trim();
    if (!text) throw new Error('OpenAI returned an empty response.');
    return text;
  }

  const baseUrl = cleanBaseUrl(connection.baseUrl);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  const body = await fetchJson(`${baseUrl}/chat/completions`, {
    method: 'POST', headers,
    body: JSON.stringify({ model, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: 0.4 }),
  }, 'custom') as { choices?: Array<{ message?: { content?: string } }> };
  const text = body?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Custom provider returned an empty response.');
  return text;
}

function extractJson(text: string) {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = Math.min(...['{', '['].map((token) => { const index = trimmed.indexOf(token); return index < 0 ? Number.POSITIVE_INFINITY : index; }));
  const endObject = trimmed.lastIndexOf('}');
  const endArray = trimmed.lastIndexOf(']');
  const end = Math.max(endObject, endArray);
  return Number.isFinite(start) && end >= start ? trimmed.slice(start, end + 1) : trimmed;
}

export async function callAiJson<T>(connection: AiConnection, system: string, user: string): Promise<T> {
  const text = await callAiText(connection, `${system}\nReturn only valid JSON. Do not use Markdown fences.`, user);
  try { return JSON.parse(extractJson(text)) as T; }
  catch { throw new Error('AI returned invalid JSON. Try again or use a model with stronger JSON output.'); }
}

export async function testAiConnection(connection: AiConnection) {
  const text = await callAiText(connection, 'You are a connection test. Reply with exactly: NILA_OK', 'Reply now.');
  if (!text.toUpperCase().includes('NILA_OK')) throw new Error('Provider responded, but the expected connection test response was not received.');
  return true;
}
