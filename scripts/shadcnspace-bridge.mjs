import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';

const MCP_URL = 'https://mcp.shadcnspace.com/mcp';
const MAX_BODY = 128 * 1024;
const REQUEST_TIMEOUT = 45_000;
const SESSION_TTL = 10 * 60_000;
const ALLOWED_TOOLS = new Set([
  'get_audit_checklist',
  'listCategories',
  'listBlocks',
  'listFreeBlocks',
  'listComponents',
  'getBlockInstall',
  'searchBlocks',
  'listInstalledBlocks',
  'listPages',
  'getPageInstall',
  'searchPages',
  'listInstalledPages',
  'getComponentInstall',
  'searchComponents',
]);

let cachedSession = null;
let requestCounter = 1;

function json(res, status, value) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(value));
}

function isAllowedOrigin(origin) {
  if (!origin) return true;
  try {
    const url = new URL(origin);
    return (url.hostname === '127.0.0.1' || url.hostname === 'localhost') && (url.protocol === 'http:' || url.protocol === 'https:');
  } catch {
    return false;
  }
}

async function readBody(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw new Error('Request body is too large.');
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function tokenKey(token) {
  return token ? createHash('sha256').update(token).digest('hex') : 'free';
}

class StdioRpcClient {
  constructor(token) {
    const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const args = ['-y', 'mcp-remote@0.15.1', MCP_URL];
    const env = { ...process.env };
    if (token) {
      env.NILA_SHADCNSPACE_AUTH = `Bearer ${token}`;
      args.push('--header', 'Authorization:${NILA_SHADCNSPACE_AUTH}');
    }
    this.process = spawn(command, args, {
      cwd: process.cwd(),
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
      shell: process.platform === 'win32',
    });
    this.pending = new Map();
    this.stderr = '';
    this.buffer = '';
    this.closed = false;
    this.process.stdout.setEncoding('utf8');
    this.process.stderr.setEncoding('utf8');
    this.process.stdout.on('data', (chunk) => this.onStdout(chunk));
    this.process.stderr.on('data', (chunk) => {
      this.stderr = (this.stderr + chunk).slice(-6000);
    });
    this.process.on('error', (error) => this.failAll(error));
    this.process.on('exit', (code) => {
      if (!this.closed && code !== 0) this.failAll(new Error(`MCP bridge exited with code ${code ?? 'unknown'}.`));
    });
  }

  onStdout(chunk) {
    this.buffer += chunk;
    let newline = this.buffer.indexOf('\n');
    while (newline >= 0) {
      const line = this.buffer.slice(0, newline).trim();
      this.buffer = this.buffer.slice(newline + 1);
      if (line) {
        try {
          const message = JSON.parse(line);
          if (message.id !== undefined && this.pending.has(String(message.id))) {
            const entry = this.pending.get(String(message.id));
            this.pending.delete(String(message.id));
            clearTimeout(entry.timer);
            if (message.error) entry.reject(new Error(message.error.message || 'MCP request failed.'));
            else entry.resolve(message.result);
          }
        } catch {
          // mcp-remote may emit non-protocol banners on stdout in some versions; ignore them.
        }
      }
      newline = this.buffer.indexOf('\n');
    }
  }

  failAll(error) {
    for (const entry of this.pending.values()) {
      clearTimeout(entry.timer);
      entry.reject(error);
    }
    this.pending.clear();
  }

  send(message) {
    if (this.closed || !this.process.stdin.writable) throw new Error('MCP bridge is not available.');
    this.process.stdin.write(`${JSON.stringify(message)}\n`);
  }

  request(method, params = {}) {
    const id = requestCounter++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(String(id));
        reject(new Error(`MCP request timed out: ${method}`));
      }, REQUEST_TIMEOUT);
      this.pending.set(String(id), { resolve, reject, timer });
      this.send({ jsonrpc: '2.0', id, method, params });
    });
  }

  notify(method, params = {}) {
    this.send({ jsonrpc: '2.0', method, params });
  }

  close() {
    this.closed = true;
    this.failAll(new Error('MCP bridge closed.'));
    if (this.process.exitCode === null) this.process.kill();
  }
}

async function createSession(token) {
  const rpc = new StdioRpcClient(token);
  try {
    await rpc.request('initialize', {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'nila-website-builder', version: '0.10.0-beta.1' },
    });
    rpc.notify('notifications/initialized');
    const toolsResult = await rpc.request('tools/list');
    const tools = Array.isArray(toolsResult?.tools) ? toolsResult.tools.filter((tool) => ALLOWED_TOOLS.has(tool.name)) : [];
    if (!tools.length) throw new Error('ShadcnSpace MCP connected, but no supported catalog tools were exposed.');
    return { rpc, tools, key: tokenKey(token), touchedAt: Date.now() };
  } catch (error) {
    const detail = rpc.stderr.trim();
    rpc.close();
    throw new Error(detail ? `${error.message} ${detail.slice(-1200)}` : error.message);
  }
}

async function getSession(token) {
  const key = tokenKey(token);
  if (cachedSession && (cachedSession.key !== key || Date.now() - cachedSession.touchedAt > SESSION_TTL || cachedSession.rpc.process.exitCode !== null)) {
    cachedSession.rpc.close();
    cachedSession = null;
  }
  if (!cachedSession) cachedSession = await createSession(token);
  cachedSession.touchedAt = Date.now();
  return cachedSession;
}

function getTool(session, names) {
  for (const name of names) {
    const tool = session.tools.find((candidate) => candidate.name === name);
    if (tool) return tool;
  }
  return null;
}

function schemaProperties(tool) {
  return tool?.inputSchema?.properties && typeof tool.inputSchema.properties === 'object' ? tool.inputSchema.properties : {};
}

function setFirstSupported(args, tool, candidates, value) {
  if (value === undefined || value === null || value === '') return;
  const props = schemaProperties(tool);
  const key = candidates.find((candidate) => Object.prototype.hasOwnProperty.call(props, candidate));
  if (key) args[key] = value;
}

function catalogTool(session, kind, query, licensed) {
  if (kind === 'page') {
    if (!licensed) throw new Error('ShadcnSpace Pages require a valid ShadcnSpace MCP token.');
    return query ? getTool(session, ['searchPages', 'listPages']) : getTool(session, ['listPages']);
  }
  if (kind === 'component') return query ? getTool(session, ['searchComponents', 'listComponents']) : getTool(session, ['listComponents']);
  if (!licensed && !query && kind !== 'animated') return getTool(session, ['listFreeBlocks', 'listBlocks']);
  return query || kind === 'animated' ? getTool(session, ['searchBlocks', 'listFreeBlocks', 'listBlocks']) : getTool(session, ['listBlocks', 'listFreeBlocks']);
}

function buildCatalogArgs(tool, kind, query, licensed) {
  const args = {};
  const effectiveQuery = kind === 'animated' ? ['animated', 'motion', query].filter(Boolean).join(' ') : query;
  setFirstSupported(args, tool, ['query', 'keyword', 'search', 'topic'], effectiveQuery);
  if (!licensed) {
    setFirstSupported(args, tool, ['freeOnly', 'free_only', 'onlyFree'], true);
    setFirstSupported(args, tool, ['license', 'licenseType', 'type'], 'free');
  } else {
    setFirstSupported(args, tool, ['license', 'licenseType'], 'all');
  }
  return args;
}

function detailTool(session, kind) {
  if (kind === 'page') return getTool(session, ['getPageInstall']);
  if (kind === 'component') return getTool(session, ['getComponentInstall']);
  return getTool(session, ['getBlockInstall']);
}

function buildDetailArgs(tool, kind, name, style) {
  const args = {};
  setFirstSupported(args, tool, kind === 'page' ? ['page', 'pageName', 'name', 'id', 'slug'] : kind === 'component' ? ['component', 'componentName', 'name', 'id', 'slug'] : ['block', 'blockName', 'name', 'id', 'slug'], name);
  setFirstSupported(args, tool, ['style', 'uiStyle', 'primitive'], style || 'radix');
  setFirstSupported(args, tool, ['packageManager', 'package_manager', 'pm'], 'npm');
  return args;
}

async function callTool(session, tool, args) {
  if (!tool || !ALLOWED_TOOLS.has(tool.name)) throw new Error('Requested ShadcnSpace MCP operation is unavailable.');
  return session.rpc.request('tools/call', { name: tool.name, arguments: args });
}

async function handleAction(payload) {
  const token = typeof payload.token === 'string' ? payload.token.trim() : '';
  if (token.length > 512) throw new Error('MCP token is too long.');
  const session = await getSession(token);
  const licensed = Boolean(token);
  if (payload.action === 'tools') {
    return { licensed, tools: session.tools.map((tool) => ({ name: tool.name, description: tool.description, inputSchema: tool.inputSchema })) };
  }
  if (payload.action === 'catalog') {
    const kind = ['block', 'animated', 'component', 'page'].includes(payload.kind) ? payload.kind : 'block';
    const query = typeof payload.query === 'string' ? payload.query.trim().slice(0, 160) : '';
    const tool = catalogTool(session, kind, query, licensed);
    if (!tool) throw new Error(`No MCP catalog tool is available for ${kind}.`);
    const result = await callTool(session, tool, buildCatalogArgs(tool, kind, query, licensed));
    return { licensed, kind, tool: tool.name, result };
  }
  if (payload.action === 'details') {
    const kind = ['block', 'animated', 'component', 'page'].includes(payload.kind) ? payload.kind : 'block';
    const name = typeof payload.name === 'string' ? payload.name.trim().slice(0, 180) : '';
    if (!name) throw new Error('A ShadcnSpace item name is required.');
    if (kind === 'page' && !licensed) throw new Error('ShadcnSpace Pages require a valid ShadcnSpace MCP token.');
    const tool = detailTool(session, kind);
    if (!tool) throw new Error(`Install metadata is not exposed by the MCP server for ${kind} items.`);
    const result = await callTool(session, tool, buildDetailArgs(tool, kind, name, payload.style));
    return { licensed, kind, tool: tool.name, result };
  }
  throw new Error('Unsupported ShadcnSpace MCP action.');
}

function middleware(req, res, next) {
  if (req.url !== '/api/shadcnspace') return next();
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' });
  if (!isAllowedOrigin(req.headers.origin)) return json(res, 403, { error: 'Origin is not allowed.' });
  void readBody(req)
    .then(handleAction)
    .then((data) => json(res, 200, data))
    .catch((error) => json(res, 502, { error: error instanceof Error ? error.message : 'ShadcnSpace MCP request failed.' }));
}

export function shadcnSpaceBridge() {
  return {
    name: 'nila-shadcnspace-mcp-bridge',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
