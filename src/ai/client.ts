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
const API_KEY_KEY = 'nila-ai-api-key-v1';

export const AI_DEFAULTS: Record<AiProvider, Omit<AiConnection, 'apiKey'>> = {
  ollama: { provider: 'ollama', model: 'qwen3-coder:480b-cloud' },
  gemini: { provider: 'gemini', model: 'gemini-2.5-flash' },
  openai: { provider: 'openai', model: 'gpt-5.1' },
  custom: { provider: 'custom', model: '', baseUrl: 'http://127.0.0.1:11434/v1' },
};

export function loadAiSettings(): SavedAiSettings {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null') as SavedAiSettings | null;
    if (parsed && ['ollama', 'gemini', 'openai', 'custom'].includes(parsed.provider)) return parsed;
  } catch { /* ignore invalid local settings */ }
  return AI_DEFAULTS.ollama;
}

export function saveAiSettings(settings: SavedAiSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadSessionApiKey() {
  return sessionStorage.getItem(API_KEY_KEY) ?? '';
}

export function saveSessionApiKey(value: string) {
  if (value) sessionStorage.setItem(API_KEY_KEY, value);
  else sessionStorage.removeItem(API_KEY_KEY);
}

function cleanBaseUrl(value: string | undefined) {
  const raw = (value ?? '').trim().replace(/\/+$/, '');
  if (!raw) throw new Error('Base URL is required.');
  let parsed: URL;
  try { parsed = new URL(raw); } catch { throw new Error('Base URL is invalid.'); }
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname);
  if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && local)) throw new Error('Custom AI base URL must use HTTPS, except localhost.');
  return raw;
}

async function fetchJson(url: string, init: RequestInit) {
  const response = await fetch(url, init);
  const text = await response.text();
  let body: unknown = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!response.ok) {
    const record = body && typeof body === 'object' ? body as Record<string, unknown> : null;
    const error = record?.error;
    const message = typeof error === 'string' ? error : error && typeof error === 'object' && 'message' in error ? String((error as {message?:unknown}).message) : typeof body === 'string' ? body : `AI request failed (${response.status}).`;
    throw new Error(message.slice(0, 500));
  }
  return body;
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

export async function callAiText(connection: AiConnection, system: string, user: string): Promise<string> {
  const apiKey = connection.apiKey.trim();
  const model = connection.model.trim();
  if (!model) throw new Error('AI model is required.');
  if (connection.provider !== 'custom' && !apiKey) throw new Error('API key is required.');

  if (connection.provider === 'ollama') {
    const body = await fetchJson('https://ollama.com/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, stream: false, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
    }) as { message?: { content?: string } };
    const text = body?.message?.content;
    if (!text) throw new Error('Ollama returned an empty response.');
    return text;
  }

  if (connection.provider === 'gemini') {
    const body = await fetchJson(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: user }] }] }),
    }) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = body?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('').trim();
    if (!text) throw new Error('Gemini returned an empty response.');
    return text;
  }

  if (connection.provider === 'openai') {
    const body = await fetchJson('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, instructions: system, input: user }),
    });
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
  }) as { choices?: Array<{ message?: { content?: string } }> };
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
