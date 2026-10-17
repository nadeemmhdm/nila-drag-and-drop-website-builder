import { Bot, CheckCircle2, KeyRound, Loader2, Send, Sparkles, WandSparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { NilaPage, NilaSiteSeo } from '../../core/project';
import type { EditorNode } from '../types';
import { AI_DEFAULTS, loadAiSettings, saveAiSettings, testAiConnection, type AiConnection, type AiProvider } from '../../ai/client';
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

const providerLabels: Record<AiProvider, string> = { ollama: 'Ollama Cloud', gemini: 'Google Gemini', openai: 'OpenAI', custom: 'OpenAI-compatible / Local' };

export function AiPanel({ projectName, pages, siteSeo, selectedNode, onReplaceWebsite, onReplaceSeo, onEnhanceSelected }: AiPanelProps) {
  const saved = useMemo(loadAiSettings, []);
  const [provider, setProvider] = useState<AiProvider>(saved.provider);
  const [model, setModel] = useState(saved.model || AI_DEFAULTS[saved.provider].model);
  const [baseUrl, setBaseUrl] = useState(saved.baseUrl ?? AI_DEFAULTS[saved.provider].baseUrl ?? '');
  const [apiKey, setApiKey] = useState('');
  const [request, setRequest] = useState('');
  const [enhanceInstruction, setEnhanceInstruction] = useState('Make this copy clearer, concise, professional and conversion-friendly.');
  const [busy, setBusy] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);

  const connection: AiConnection = { provider, model: model.trim(), apiKey, baseUrl: baseUrl.trim() };
  const selectedText = selectedNode?.props.text ?? '';

  const persist = (nextProvider = provider, nextModel = model, nextBase = baseUrl) => {
    saveAiSettings({ provider: nextProvider, model: nextModel, baseUrl: nextBase || undefined });
  };

  const changeProvider = (next: AiProvider) => {
    const defaults = AI_DEFAULTS[next];
    setProvider(next); setModel(defaults.model); setBaseUrl(defaults.baseUrl ?? '');
    saveAiSettings({ provider: next, model: defaults.model, baseUrl: defaults.baseUrl });
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
    const id = startActivity(label); setBusy(true);
    try { await task(id); finishActivity(id, 'success'); }
    catch (error) { finishActivity(id, 'error', error instanceof Error ? error.message : 'AI request failed.'); }
    finally { setBusy(false); }
  };

  const test = () => run('Testing AI connection', async (id) => {
    await testAiConnection(connection);
    finishActivity(id, 'success', `${providerLabels[provider]} responded successfully.`);
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

  return <div className="ai-panel">
    <div className="ai-hero"><div className="ai-orb"><Bot size={20}/></div><div><strong>Nila AI</strong><span>Build with structured Nila components</span></div></div>
    <div className="ai-security-note"><KeyRound size={14}/><span>API keys are memory-only. They are never written to browser storage, project files or exported websites, and they clear on refresh.</span></div>

    <section className="ai-card">
      <h3>Provider</h3>
      <label>AI provider<select value={provider} onChange={(event) => changeProvider(event.target.value as AiProvider)}>{(Object.keys(providerLabels) as AiProvider[]).map((item) => <option key={item} value={item}>{providerLabels[item]}{item === 'ollama' ? ' · Recommended' : ''}</option>)}</select></label>
      <label>Model<input value={model} onChange={(event) => setModel(event.target.value)} onBlur={() => persist()} placeholder="Model name"/></label>
      {provider === 'custom' ? <label>Base URL<input value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} onBlur={() => persist()} placeholder="http://127.0.0.1:11434/v1"/><small>HTTPS required except localhost. Must expose an OpenAI-compatible /chat/completions endpoint.</small></label> : null}
      <label>API key<input type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} autoComplete="off" placeholder={provider === 'custom' ? 'Optional for local providers' : 'Required'}/></label>
      <button type="button" className="ai-secondary" disabled={busy || !model.trim()} onClick={test}>{busy ? <Loader2 className="spin" size={14}/> : <CheckCircle2 size={14}/>} Test connection</button>
    </section>

    <section className="ai-card ai-build-card">
      <h3><WandSparkles size={15}/> Build website</h3>
      <p>Describe the website. AI chooses from Nila sections and creates copy, responsive theme, pages and media alt-text placeholders.</p>
      <textarea rows={7} value={request} onChange={(event) => setRequest(event.target.value)} placeholder="Example: Build a modern web development agency website for Kerala businesses with Home, Services, About and Contact pages. Use a clean light theme with blue accents."/>
      <div className="ai-media-rule"><Sparkles size={13}/> AI does not generate or fetch images/videos. Upload your own media after the layout is created.</div>
      <button type="button" className="ai-primary" disabled={busy || !request.trim()} onClick={build}>{busy ? <Loader2 className="spin" size={15}/> : <Send size={15}/>} Build with AI</button>
    </section>

    <section className="ai-card">
      <h3>Enhance selected content</h3>
      <div className="ai-selection">{selectedNode && selectedText ? <><strong>{selectedNode.name}</strong><span>{selectedText.slice(0, 130)}{selectedText.length > 130 ? '…' : ''}</span></> : <span>Select a heading, paragraph, button, link, badge or quote.</span>}</div>
      <textarea rows={3} value={enhanceInstruction} onChange={(event) => setEnhanceInstruction(event.target.value)}/>
      <button type="button" className="ai-secondary" disabled={busy || !selectedText.trim()} onClick={enhance}><Sparkles size={14}/> Enhance copy</button>
    </section>

    <section className="ai-card">
      <h3>Search + AI readiness</h3>
      <p>Generate SEO, AEO and GEO metadata from the actual page copy. Nila then regenerates deterministic SEO files.</p>
      <button type="button" className="ai-primary" disabled={busy || pages.length === 0} onClick={seo}><WandSparkles size={14}/> Generate SEO / AEO / GEO</button>
    </section>

    <section className="ai-activity">
      <div className="ai-activity-head"><strong>AI activity</strong><span>{busy ? 'Working…' : 'Ready'}</span></div>
      {activities.length ? activities.map((item) => <div className={`ai-activity-item ${item.status}`} key={item.id}>{item.status === 'running' ? <Loader2 className="spin" size={13}/> : item.status === 'success' ? <CheckCircle2 size={13}/> : <span className="ai-error-dot">!</span>}<div><strong>{item.label}</strong>{item.detail ? <small>{item.detail}</small> : null}</div></div>) : <div className="ai-empty-activity">No AI actions yet.</div>}
    </section>
  </div>;
}
