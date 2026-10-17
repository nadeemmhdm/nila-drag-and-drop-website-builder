import { Check, Clipboard, Cloud, Code2, KeyRound, LoaderCircle, RefreshCw, Search, ShieldCheck, Sparkles, Unplug, WandSparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

type LibraryMode = 'components' | 'blocks' | 'pages';
type RemoteKind = 'component' | 'block' | 'animated' | 'page';

type RemoteItem = {
  key: string;
  name: string;
  description: string;
  category: string;
  isPro: boolean;
  raw: unknown;
};

type ApiResponse = {
  error?: string;
  licensed?: boolean;
  kind?: RemoteKind;
  tool?: string;
  result?: unknown;
};

let volatileToken = '';

function parseMaybeJson(value: string): unknown {
  const text = value.trim();
  if (!text) return '';
  if ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'))) {
    try { return JSON.parse(text); } catch { return text; }
  }
  return text;
}

function unpackResult(result: unknown): unknown[] {
  if (!result || typeof result !== 'object') return [result];
  const record = result as Record<string, unknown>;
  const values: unknown[] = [];
  if (record.structuredContent) values.push(record.structuredContent);
  if (Array.isArray(record.content)) {
    for (const part of record.content) {
      if (part && typeof part === 'object' && (part as Record<string, unknown>).type === 'text') {
        values.push(parseMaybeJson(String((part as Record<string, unknown>).text ?? '')));
      }
    }
  }
  if (!values.length) values.push(result);
  return values;
}

function collectObjects(value: unknown, depth = 0): Record<string, unknown>[] {
  if (depth > 6 || value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.flatMap((item) => collectObjects(item, depth + 1));
  if (typeof value !== 'object') return [];
  const record = value as Record<string, unknown>;
  const objectKeys = ['name', 'title', 'id', 'slug', 'blockName', 'componentName', 'pageName'];
  const looksLikeItem = objectKeys.some((key) => typeof record[key] === 'string');
  const nested = Object.values(record).flatMap((item) => collectObjects(item, depth + 1));
  return looksLikeItem ? [record, ...nested] : nested;
}

function stringValue(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function itemFromRecord(record: Record<string, unknown>, index: number): RemoteItem | null {
  const name = stringValue(record, ['name', 'title', 'blockName', 'componentName', 'pageName', 'slug', 'id']);
  if (!name) return null;
  const description = stringValue(record, ['description', 'summary', 'subtitle', 'details']);
  const category = stringValue(record, ['category', 'group', 'type', 'section']) || 'Library';
  const license = stringValue(record, ['license', 'licenseType', 'tier']).toLowerCase();
  const isPro = record.isPro === true || record.pro === true || record.premium === true || license.includes('pro') || license.includes('premium');
  const id = stringValue(record, ['id', 'slug', 'name', 'title']) || String(index);
  return { key: `${id}-${index}`, name, description, category, isPro, raw: record };
}

function normalizeItems(result: unknown): RemoteItem[] {
  const seen = new Set<string>();
  const items: RemoteItem[] = [];
  for (const value of unpackResult(result)) {
    for (const record of collectObjects(value)) {
      const item = itemFromRecord(record, items.length);
      if (!item) continue;
      const key = item.name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      items.push(item);
    }
  }
  return items;
}

function resultText(result: unknown): string {
  const pieces: string[] = [];
  for (const value of unpackResult(result)) {
    if (typeof value === 'string') pieces.push(value);
    else if (value !== undefined) pieces.push(JSON.stringify(value, null, 2));
  }
  return pieces.join('\n\n').trim();
}

async function requestMcp(payload: Record<string, unknown>): Promise<ApiResponse> {
  const response = await fetch('/api/shadcnspace', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json() as ApiResponse;
  if (!response.ok) throw new Error(data.error || `ShadcnSpace MCP request failed (${response.status}).`);
  return data;
}

function copyText(value: string) {
  if (!value) return Promise.resolve();
  return navigator.clipboard.writeText(value);
}

export function ShadcnSpaceLibrary({ mode }: { mode: LibraryMode }) {
  const [token, setTokenState] = useState(volatileToken);
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<RemoteKind>(mode === 'components' ? 'component' : mode === 'pages' ? 'page' : 'block');
  const [style, setStyle] = useState<'radix' | 'base'>('radix');
  const [items, setItems] = useState<RemoteItem[]>([]);
  const [status, setStatus] = useState('Not connected');
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsName, setDetailsName] = useState('');
  const [details, setDetails] = useState('');
  const [copied, setCopied] = useState(false);
  const licensed = Boolean(token.trim());
  const visibleKinds = useMemo<RemoteKind[]>(() => mode === 'components' ? ['component'] : mode === 'pages' ? ['page'] : ['block', 'animated'], [mode]);

  const setToken = (value: string) => {
    volatileToken = value;
    setTokenState(value);
    setItems([]);
    setDetails('');
    setStatus(value ? 'Licensed mode ready to connect' : 'Free mode ready to connect');
  };

  const load = async () => {
    setLoading(true);
    setDetails('');
    try {
      const data = await requestMcp({ action: 'catalog', kind, query, token: token.trim() });
      const next = normalizeItems(data.result);
      setItems(next);
      setStatus(`Connected via ${data.tool ?? 'MCP'} · ${next.length} items`);
    } catch (error) {
      setItems([]);
      setStatus(error instanceof Error ? error.message : 'MCP connection failed');
    } finally {
      setLoading(false);
    }
  };

  const openDetails = async (item: RemoteItem) => {
    setDetailsLoading(true);
    setDetailsName(item.name);
    setDetails('');
    setCopied(false);
    try {
      const data = await requestMcp({ action: 'details', kind, name: item.name, style, token: token.trim() });
      setDetails(resultText(data.result) || 'The MCP server returned no text install metadata for this item.');
    } catch (error) {
      setDetails(error instanceof Error ? error.message : 'Unable to load install metadata.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCopy = async () => {
    await copyText(details);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="shadcnspace-library">
      <div className="mcp-library-head">
        <div className="mcp-library-brand"><span><WandSparkles size={16} /></span><div><strong>ShadcnSpace Live MCP</strong><small>Official live registry · optional online connector</small></div></div>
        <span className={`mcp-mode-badge${licensed ? ' licensed' : ''}`}>{licensed ? <ShieldCheck size={12} /> : <Cloud size={12} />}{licensed ? 'Licensed' : 'Free'}</span>
      </div>

      <div className="mcp-security-note"><KeyRound size={14} /><span>Token is optional and kept only in memory. Free mode exposes free resources; licensed mode can access resources allowed by your ShadcnSpace account.</span></div>

      <label className="mcp-token-field"><span>Optional MCP token</span><input type="password" autoComplete="off" value={token} onChange={(event) => setToken(event.target.value)} placeholder="email:license-key" /></label>

      <div className="mcp-kind-tabs">{visibleKinds.map((item) => <button type="button" key={item} className={kind === item ? 'active' : ''} onClick={() => { setKind(item); setItems([]); setDetails(''); }}>{item === 'component' ? 'Components' : item === 'page' ? 'Pages' : item === 'animated' ? 'Animated blocks' : 'Blocks'}</button>)}</div>

      <div className="mcp-toolbar">
        <div className="catalog-search"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void load(); }} placeholder={`Search ${kind === 'component' ? 'components' : kind === 'page' ? 'pages' : kind === 'animated' ? 'animated blocks' : 'blocks'}`} /></div>
        <button type="button" className="mcp-refresh" onClick={() => void load()} disabled={loading}>{loading ? <LoaderCircle className="spin" size={15} /> : <RefreshCw size={15} />}{items.length ? 'Refresh' : 'Connect'}</button>
      </div>

      <div className="mcp-status"><span className={status.startsWith('Connected') ? 'online' : ''} /><span>{status}</span></div>

      {kind === 'page' && !licensed ? <div className="mcp-license-callout"><Unplug size={15} /><span>ShadcnSpace documentation requires a valid MCP token for Pages. Add your own licensed token above to browse them.</span></div> : null}

      {items.length ? <div className="mcp-results">{items.map((item) => <article className="mcp-item" key={item.key}>
        <div className="mcp-item-icon">{kind === 'animated' ? <Sparkles size={16} /> : <Code2 size={16} />}</div>
        <div className="mcp-item-copy"><div><strong>{item.name}</strong>{item.isPro ? <span className="mcp-pro">PRO</span> : <span className="mcp-free">FREE</span>}</div><small>{item.category}</small>{item.description ? <p>{item.description}</p> : null}</div>
        <button type="button" onClick={() => void openDetails(item)}>Install details</button>
      </article>)}</div> : null}

      {detailsName ? <div className="mcp-details">
        <div className="mcp-details-head"><div><span>Official MCP install metadata</span><strong>{detailsName}</strong></div><label>Style<select value={style} onChange={(event) => setStyle(event.target.value as 'radix' | 'base')}><option value="radix">Radix</option><option value="base">Base UI</option></select></label></div>
        {detailsLoading ? <div className="mcp-details-loading"><LoaderCircle className="spin" size={16} /> Loading from MCP…</div> : <><pre>{details}</pre><button type="button" className="mcp-copy" onClick={() => void handleCopy()}>{copied ? <Check size={14} /> : <Clipboard size={14} />}{copied ? 'Copied' : 'Copy metadata / install code'}</button></>}
      </div> : null}
    </div>
  );
}
