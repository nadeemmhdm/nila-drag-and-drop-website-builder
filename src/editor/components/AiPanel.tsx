import { Bot, CheckCircle2, KeyRound, Loader2, RefreshCw, Send, Server, Sparkles, Trash2, WandSparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { NilaPage, NilaSiteSeo } from '../../core/project';
import type { EditorNode } from '../types';
import { loadAiApiKey, saveAiApiKey } from '../../ai/credentials';
import { AI_DEFAULTS, listAiModels, loadAiSettings, saveAiSettings, testAiConnection, usesLocalAiBridge, type AiConnection, type AiProvider } from '../../ai/client';
import { applyAiSeoPlan, enhanceContent, generateSeoPlan, generateWebsitePlan, materializeAiSitePlan } from '../../ai/sitePlanner';

interface AiPanelProps {
  projectName: string;
  pages: NilaPage[];
  siteSeo: NilaSiteSeo;
  selectedNode: EditorNode | null;
  onReplaceWebsite: (pages: NilaPage[], seo: NilaSiteSeo) => void;
  onReplaceSeo: (pages: NilaPage[], seo: NilaSiteSeo) => void;
  onEnhanceSelected: (text: string) => void;
}

type Activity = { id: string; label: string; status: 'running' | 'success' | 'error'; detail?: string };

const providerLabels: Record<AiProvider, string> = {
  ollama: 'Ollama Cloud',
  gemini: 'Google Gemini',
  openai: 'OpenAI',
  custom: 'OpenAI-compatible / Local',
};

const providerHelp: Record<AiProvider, string> = {
  ollama: 'Uses Ollama Cloud API at ollama.com with Bearer API-key authentication. Cloud-model names are normalized automatically.',
  gemini: 'Uses the official Gemini generateContent API with the x-goog-api-key header.',
  openai: 'Uses the OpenAI Responses API with Bearer API-key authentication.',
  custom: 'Connects directly to an OpenAI-compatible endpoint. Local HTTP is allowed only for localhost.',
};

export function AiPanel({ projectName, pages, siteSeo, selectedNode, onReplaceWebsite, onReplaceSeo, onEnhanceSelected }: AiPanelProps) {
  const saved = useMemo(loadAiSettings, []);
  const [provider, setProvider] = useState<AiProvider>(saved.provider);
  const [model, setModel] = useState(saved.model || AI_DEFAULTS[saved.provider].model);
  const [baseUrl, setBaseUrl] = useState(saved.baseUrl ?? AI_DEFAULTS[saved.provider].baseUrl ?? '');
  const [apiKey, setApiKey] = useState(() => loadAiApiKey(saved.provider));
  const [models, setModels] = useState<string[]>([]);
  const [modelsBusy, setModelsBusy] = useState(false);
  const [modelsError, setModelsError] = useState('');
  const [request, setRequest] = useState('');
  const [enhanceInstruction, setEnhanceInstruction] = useState('Make this copy clearer, concise, professional and conversion-friendly.');
  const [busy, setBusy] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const bridgeActive = usesLocalAiBridge();

  const connection: AiConnection = { provider, model: model.trim(), apiKey, baseUrl: baseUrl.trim() };
  const selectedText = selectedNode?.props.text ?? '';
  const keyRequired = provider !== 'custom';
  const connectionReady = Boolean(model.trim()) && (!keyRequired || Boolean(apiKey.trim()));

  const persist = (nextProvider = provider, nextModel = model, nextBase = baseUrl, nextKey = apiKey) => {
    saveAiSettings({ provider: nextProvider, model: nextModel, baseUrl: nextBase || undefined });
    saveAiApiKey(nextProvider, nextKey);
  };

  const changeProvider = (next: AiProvider) => {
    persist();
    const defaults = AI_DEFAULTS[next];
    setProvider(next);
    setModel(defaults.model);
    setBaseUrl(defaults.baseUrl ?? '');
    setApiKey(loadAiApiKey(next));
    setModels([]);
    setModelsError('');
    saveAiSettings({ provider: next, model: defaults.model, baseUrl: defaults.baseUrl });
  };

  const clearSavedKey = () => {
    setApiKey('');
    saveAiApiKey(provider, '');
    setModels([]);
    setModelsError('Saved key cleared for this provider.');
  };

  const startActivity = (label: string) => {
    const id = crypto.randomUUID();
    const activity: Activity = { id, label, status: 'running' };
    setActivities((items) => [activity, ...items].slice(0, 8));
    return id;
  };
  const finishActivity = (id: string, status: Activity['status'], detail?: string) => setActivities((items) => items.map((item) => item.id === id ? { ...item, status, detail } : item));

  const run = async (label: string, task: (activityId: string) => Promise<void>) => {
    if (busy) return;
    persist();
    const id = startActivity(label);
    setBusy(true);
    try { await task(id); finishActivity(id, 'success'); }
    catch (error) { finishActivity(id, 'error', error instanceof Error ? error.message : 'AI request failed.'); }
    finally { setBusy(false); }
  };

  const loadModels = async () => {
    if (modelsBusy) return;
    persist();
    setModelsBusy(true);
    setModelsError('');
    try {
      const next = await listAiModels(connection);
      setModels(next);
      if (!next.length) setModelsError('Provider connected, but no compatible models were returned. You can still type a model name manually.');
      else if (!next.includes(model) && provider !== 'custom') setModel(next[0]);
    } catch (error) {
      setModels([]);
      setModelsError(error instanceof Error ? error.message : 'Unable to load models.');
    } finally {
      setModelsBusy(false);
    }
  };

  const test = () => run('Testing AI connection', async (id) => {
    await testAiConnection(connection);
    finishActivity(id, 'success', `${providerLabels[provider]} responded successfully with ${model}.`);
  });

  const build = () => run('Planning and building website', async (id) => {
    if (!request.trim()) throw new Error('Describe the website you want to build first.');
    if (!window.confirm('AI will replace the current website pages. Continue?')) throw new Error('Website build cancelled.');
    finishActivity(id, 'running', 'Generating a structured Nila section plan…');
    const plan = await generateWebsitePlan(connection, request, projectName);
    finishActivity(id, 'running', 'Applying Nila sections, responsive theme and media placeholders…');
    const result = materializeAiSitePlan(plan, projectName);
    const security = siteSeo.security;
    const identityAssets = { faviconAssetId: siteSeo.faviconAssetId, organizationLogoAssetId: siteSeo.organizationLogoAssetId };
    onReplaceWebsite(result.pages, { ...result.seo, ...identityAssets, security, baseUrl: siteSeo.baseUrl, copyrightText: siteSeo.copyrightText || result.seo.copyrightText });
    finishActivity(id, 'success', `Built ${result.pages.length} page${result.pages.length === 1 ? '' : 's'} using Nila sections. Media stayed as placeholders.`);
  });

  const enhance = () => run('Enhancing selected content', async (id) => {
    if (!selectedNode || !selectedText.trim()) throw new Error('Select a text element first.');
    const text = await enhanceContent(connection, selectedText, enhanceInstruction);
    onEnhanceSelected(text.trim());
    finishActivity(id, 'success', `Updated ${selectedNode.name}.`);
  });

  const seo = () => run('Generating SEO / AEO / GEO metadata', async (id) => {
    finishActivity(id, 'running', 'Analyzing visible website copy…');
    const plan = await generateSeoPlan(connection, siteSeo, pages);
    const result = applyAiSeoPlan(siteSeo, pages, plan);
    onReplaceSeo(result.pages, result.site);
    finishActivity(id, 'success', 'Metadata updated. robots.txt, sitemap.xml, llms.txt and security.txt previews now regenerate automatically.');
  });

  return <div className="ai-panel ai-panel-v2">
    <div className="ai-hero"><div className="ai-orb"><Bot size={20}/></div><div><strong>Nila AI</strong><span>Build, write and optimize with your provider</span></div></div>
    <div className="ai-security-note"><KeyRound size={14}/><span>Provider keys are saved once on this local browser/device and reused by every Nila project. Keys are never written into project files, backups or exported websites.</span></div>

    <section className="ai-card ai-provider-card">
      <div className="ai-card-heading"><div><h3>Provider connection</h3><p>Choose a provider, save its key once, load available models, then use the same connection across all projects.</p></div><span className={`ai-bridge-badge${bridgeActive ? ' active' : ''}`}><Server size={12}/>{bridgeActive ? 'Local bridge active' : 'Direct browser mode'}</span></div>
      <label>AI provider<select value={provider} onChange={(event) => changeProvider(event.target.value as AiProvider)}>{(Object.keys(providerLabels) as AiProvider[]).map((item) => <option key={item} value={item}>{providerLabels[item]}{item === 'ollama' ? ' · Recommended' : ''}</option>)}</select></label>
      <div className="ai-provider-help">{providerHelp[provider]}</div>
      {provider === 'custom' ? <label>Base URL<input value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} onBlur={() => persist()} placeholder="http://127.0.0.1:11434/v1"/><small>Must expose OpenAI-compatible <code>/models</code> and <code>/chat/completions</code> endpoints.</small></label> : null}
      <label>API key<input type="password" value={apiKey} onChange={(event) => { setApiKey(event.target.value); setModelsError(''); }} onBlur={() => persist()} autoComplete="new-password" spellCheck={false} placeholder={provider === 'custom' ? 'Optional for local providers' : 'Required — saved on this device'}/></label>
      {apiKey ? <button type="button" className="ai-secondary ai-clear-key" onClick={clearSavedKey}><Trash2 size={13}/> Clear saved key</button> : null}
      <div className="ai-model-row"><label>Model<input list="nila-ai-models" value={model} onChange={(event) => setModel(event.target.value)} onBlur={() => persist()} placeholder="Model name"/><datalist id="nila-ai-models">{models.map((item) => <option value={item} key={item}/>)}</datalist></label><button type="button" className="ai-model-refresh" disabled={modelsBusy || (keyRequired && !apiKey.trim())} onClick={() => void loadModels()}>{modelsBusy ? <Loader2 className="spin" size={14}/> : <RefreshCw size={14}/>}<span>{models.length ? 'Refresh' : 'Load models'}</span></button></div>
      {models.length ? <div className="ai-model-count"><CheckCircle2 size={13}/>{models.length} model{models.length === 1 ? '' : 's'} available. Start typing to search the list.</div> : null}
      {modelsError ? <div className="ai-provider-error">{modelsError}</div> : null}
      <button type="button" className="ai-secondary ai-test-button" disabled={busy || !connectionReady} onClick={test}>{busy ? <Loader2 className="spin" size={14}/> : <CheckCircle2 size={14}/>} Test connection</button>
      {!bridgeActive && provider !== 'custom' ? <small className="ai-bridge-warning">For the most reliable hosted-provider connection, run Nila with <code>npm start</code>. The local bridge avoids browser CORS failures.</small> : null}
    </section>

    <section className="ai-card ai-build-card">
      <h3><WandSparkles size={15}/> Build website</h3>
      <p>Describe the website. AI chooses from Nila sections and creates copy, responsive theme, pages and media alt-text placeholders.</p>
      <textarea rows={7} value={request} onChange={(event) => setRequest(event.target.value)} placeholder="Example: Build a modern web development agency website for Kerala businesses with Home, Services, About and Contact pages. Use a clean light theme with blue accents."/>
      <div className="ai-media-rule"><Sparkles size={13}/> AI does not generate or fetch images/videos. Upload your own media after the layout is created.</div>
      <button type="button" className="ai-primary" disabled={busy || !request.trim() || !connectionReady} onClick={build}>{busy ? <Loader2 className="spin" size={15}/> : <Send size={15}/>} Build with AI</button>
    </section>

    <section className="ai-card">
      <h3>Enhance selected content</h3>
      <div className="ai-selection">{selectedNode && selectedText ? <><strong>{selectedNode.name}</strong><span>{selectedText.slice(0, 130)}{selectedText.length > 130 ? '…' : ''}</span></> : <span>Select a heading, paragraph, button, link, badge or quote.</span>}</div>
      <textarea rows={3} value={enhanceInstruction} onChange={(event) => setEnhanceInstruction(event.target.value)}/>
      <button type="button" className="ai-secondary" disabled={busy || !selectedText.trim() || !connectionReady} onClick={enhance}><Sparkles size={14}/> Enhance copy</button>
    </section>

    <section className="ai-card">
      <h3>Search + AI readiness</h3>
      <p>Generate SEO, AEO and GEO metadata from the actual page copy. Nila then regenerates deterministic SEO files.</p>
      <button type="button" className="ai-primary" disabled={busy || pages.length === 0 || !connectionReady} onClick={seo}><WandSparkles size={14}/> Generate SEO / AEO / GEO</button>
    </section>

    <section className="ai-activity">
      <div className="ai-activity-head"><strong>AI activity</strong><span>{busy ? 'Working…' : 'Ready'}</span></div>
      {activities.length ? activities.map((item) => <div className={`ai-activity-item ${item.status}`} key={item.id}>{item.status === 'running' ? <Loader2 className="spin" size={13}/> : item.status === 'success' ? <CheckCircle2 size={13}/> : <span className="ai-error-dot">!</span>}<div><strong>{item.label}</strong>{item.detail ? <small>{item.detail}</small> : null}</div></div>) : <div className="ai-empty-activity">No AI actions yet.</div>}
    </section>
  </div>;
}
