import type { NilaPage, NilaPageSeo, NilaSiteSeo } from '../core/project';
import { SECTION_PRESETS } from '../editor/catalog';
import type { EditorNode, NodeStyle } from '../editor/types';
import { createDefaultPageSeo, createDefaultSiteSeo } from '../seo/defaults';
import type { AiConnection } from './client';
import { callAiJson, callAiText } from './client';

export interface AiThemePlan {
  primary?: string;
  background?: string;
  surface?: string;
  text?: string;
  muted?: string;
}

export interface AiSectionPlan {
  presetId: string;
  texts?: string[];
  mediaAlt?: string[];
}

export interface AiPagePlan {
  name: string;
  slug: string;
  sections: AiSectionPlan[];
}

export interface AiSitePlan {
  siteName: string;
  browserTitle?: string;
  description?: string;
  language?: string;
  theme?: AiThemePlan;
  topics?: string[];
  llmsSummary?: string;
  pages: AiPagePlan[];
}

export interface AiSeoPagePlan {
  pageId: string;
  title?: string;
  description?: string;
  primaryTopic?: string;
  answerSummary?: string;
  entityName?: string;
  audience?: string;
  keywords?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  ogTitle?: string;
  ogDescription?: string;
}

export interface AiSeoPlan {
  siteName?: string;
  browserTitle?: string;
  defaultDescription?: string;
  llmsSummary?: string;
  topics?: string[];
  pages?: AiSeoPagePlan[];
}

const allowedPresets = new Map(SECTION_PRESETS.map((preset) => [preset.id, preset]));
export const AI_ALLOWED_SECTION_IDS = SECTION_PRESETS.map((preset) => preset.id);
const textTypes = new Set(['heading', 'paragraph', 'link', 'button', 'badge', 'quote']);
const mediaTypes = new Set(['image', 'avatar', 'video']);

function cleanColor(value: unknown, fallback: string) {
  const text = String(value ?? '').trim();
  return /^#[0-9a-f]{6}$/i.test(text) ? text : fallback;
}

function safeSlug(value: string, index: number) {
  const slug = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64);
  return slug || `page-${index + 1}`;
}

function walk(nodes: EditorNode[], visitor: (node: EditorNode) => void) {
  for (const node of nodes) { visitor(node); walk(node.children, visitor); }
}

function applySectionPlan(nodes: EditorNode[], section: AiSectionPlan, theme: Required<AiThemePlan>) {
  let textIndex = 0;
  let mediaIndex = 0;
  walk(nodes, (node) => {
    if (textTypes.has(node.type) && section.texts?.[textIndex]) {
      node.props = { ...node.props, text: String(section.texts[textIndex]).slice(0, 1200) };
      textIndex += 1;
    } else if (textTypes.has(node.type)) textIndex += 1;

    if (mediaTypes.has(node.type)) {
      const alt = section.mediaAlt?.[mediaIndex];
      node.props = { ...node.props, assetId: undefined, src: '', alt: alt ? String(alt).slice(0, 220) : node.props.alt || `${node.name} placeholder` };
      mediaIndex += 1;
    }

    const style: NodeStyle = {};
    if (node.type === 'section') style.background = theme.background;
    if (node.type === 'card') { style.background = theme.surface; style.color = theme.text; }
    if (node.type === 'heading') style.color = theme.text;
    if (node.type === 'paragraph' || node.type === 'quote' || node.type === 'list') style.color = theme.muted;
    if (node.type === 'button') { style.background = theme.primary; style.color = '#ffffff'; }
    if (node.type === 'link') style.color = theme.primary;
    if (node.type === 'badge') { style.color = theme.primary; style.background = `${theme.primary}14`; }
    node.styles = { ...node.styles, desktop: { ...node.styles.desktop, ...style } };
  });
}

function normalizedTheme(theme?: AiThemePlan): Required<AiThemePlan> {
  return {
    primary: cleanColor(theme?.primary, '#4f46e5'),
    background: cleanColor(theme?.background, '#ffffff'),
    surface: cleanColor(theme?.surface, '#f8fafc'),
    text: cleanColor(theme?.text, '#111827'),
    muted: cleanColor(theme?.muted, '#4b5563'),
  };
}

export function materializeAiSitePlan(plan: AiSitePlan, projectName: string): { pages: NilaPage[]; seo: NilaSiteSeo } {
  const siteName = String(plan.siteName || projectName || 'Website').trim().slice(0, 120) || 'Website';
  const theme = normalizedTheme(plan.theme);
  const sourcePages = Array.isArray(plan.pages) && plan.pages.length ? plan.pages.slice(0, 8) : [{ name: 'Home', slug: '/', sections: [{ presetId: 'hero-split' }, { presetId: 'features-grid' }, { presetId: 'footer' }] }];
  const seenSlugs = new Set<string>();
  const pages: NilaPage[] = sourcePages.map((page, pageIndex) => {
    let slug = pageIndex === 0 ? '/' : safeSlug(String(page.slug || page.name), pageIndex);
    if (slug !== '/') {
      const base = slug; let suffix = 2;
      while (seenSlugs.has(slug)) { slug = `${base}-${suffix}`; suffix += 1; }
      seenSlugs.add(slug);
    }
    const sections = (Array.isArray(page.sections) ? page.sections : []).slice(0, 14);
    const nodes: EditorNode[] = [];
    for (const sectionPlan of sections) {
      const preset = allowedPresets.get(String(sectionPlan.presetId));
      if (!preset) continue;
      const built = preset.build();
      applySectionPlan(built, sectionPlan, theme);
      nodes.push(...built);
    }
    if (!nodes.length) {
      const fallback = allowedPresets.get(pageIndex === 0 ? 'hero-split' : 'features-grid');
      if (fallback) nodes.push(...fallback.build());
    }
    const name = String(page.name || (pageIndex === 0 ? 'Home' : `Page ${pageIndex + 1}`)).trim().slice(0, 80);
    return { id: crypto.randomUUID(), name, slug, isHome: pageIndex === 0, nodes, seo: createDefaultPageSeo(name) };
  });
  const seo = createDefaultSiteSeo(siteName);
  seo.browserTitle = String(plan.browserTitle || siteName).slice(0, 120);
  seo.defaultDescription = String(plan.description || '').slice(0, 320);
  seo.language = String(plan.language || 'en').slice(0, 20);
  seo.topics = (plan.topics ?? []).map(String).filter(Boolean).slice(0, 20);
  seo.llmsSummary = String(plan.llmsSummary || plan.description || '').slice(0, 2500);
  return { pages, seo };
}

function siteSystemPrompt() {
  const catalog = SECTION_PRESETS.map((preset) => `${preset.id}: ${preset.name} — ${preset.description}`).join('\n');
  return `You are the planning engine for Nila Website Builder. Build structured websites only from the allowed Nila section presets below. Never output HTML, CSS, JavaScript, remote scripts, image URLs or video URLs. Images and videos must remain placeholders; supply only useful alt-text descriptions. Keep pages practical and responsive. Use concise professional copy.\n\nAllowed section presets:\n${catalog}\n\nJSON schema:\n{"siteName":"string","browserTitle":"string","description":"string","language":"en","theme":{"primary":"#RRGGBB","background":"#RRGGBB","surface":"#RRGGBB","text":"#RRGGBB","muted":"#RRGGBB"},"topics":["string"],"llmsSummary":"string","pages":[{"name":"Home","slug":"/","sections":[{"presetId":"one allowed id","texts":["replacement strings in visual order"],"mediaAlt":["media descriptions in visual order"]}]}]}\nThe first page is Home. Use no more than 8 pages and 14 sections per page.`;
}

export async function generateWebsitePlan(connection: AiConnection, request: string, projectName: string) {
  return callAiJson<AiSitePlan>(connection, siteSystemPrompt(), `Project name: ${projectName}\nUser request: ${request}`);
}

export async function enhanceContent(connection: AiConnection, text: string, instruction: string) {
  return callAiText(connection, 'You improve website copy. Return only the improved copy, no quotes, labels, Markdown or explanation. Preserve factual meaning and do not invent unverifiable claims.', `Current copy:\n${text}\n\nRequested improvement:\n${instruction || 'Make it clearer, more concise, professional and conversion-friendly.'}`);
}

export async function generateSeoPlan(connection: AiConnection, site: NilaSiteSeo, pages: NilaPage[]) {
  const pageContext = pages.map((page) => ({ id: page.id, name: page.name, slug: page.slug, currentTitle: page.seo.title, visibleCopy: collectVisibleCopy(page.nodes).slice(0, 5000) }));
  const system = `You are an SEO, AEO and GEO metadata assistant for a website builder. Return JSON only. Improve metadata based strictly on supplied page content. Do not invent security contacts, URLs, certifications, addresses, statistics or claims. sitemap.xml, robots.txt, llms.txt and security.txt are generated deterministically later by Nila; you only provide safe metadata and topics. JSON schema: {"siteName":"string","browserTitle":"string","defaultDescription":"string","llmsSummary":"string","topics":["string"],"pages":[{"pageId":"exact supplied id","title":"string","description":"string","primaryTopic":"string","answerSummary":"string","entityName":"string","audience":"string","keywords":["string"],"faqs":[{"question":"string","answer":"string"}],"ogTitle":"string","ogDescription":"string"}]}`;
  return callAiJson<AiSeoPlan>(connection, system, JSON.stringify({ siteName: site.siteName, language: site.language, pages: pageContext }));
}

function collectVisibleCopy(nodes: EditorNode[]) {
  const output: string[] = [];
  walk(nodes, (node) => {
    if (node.hidden) return;
    if (textTypes.has(node.type) && node.props.text) output.push(node.props.text);
    if (node.props.label) output.push(node.props.label);
    if (node.props.items?.length) output.push(...node.props.items);
  });
  return output.join('\n');
}

export function applyAiSeoPlan(site: NilaSiteSeo, pages: NilaPage[], plan: AiSeoPlan) {
  const nextSite: NilaSiteSeo = {
    ...site,
    siteName: String(plan.siteName || site.siteName).slice(0, 120),
    browserTitle: String(plan.browserTitle || site.browserTitle || site.siteName).slice(0, 120),
    defaultDescription: String(plan.defaultDescription || site.defaultDescription).slice(0, 320),
    llmsSummary: String(plan.llmsSummary || site.llmsSummary).slice(0, 2500),
    topics: (plan.topics ?? site.topics).map(String).filter(Boolean).slice(0, 30),
    robots: { ...site.robots },
    security: { ...site.security },
  };
  const byId = new Map((plan.pages ?? []).map((entry) => [entry.pageId, entry]));
  const nextPages = pages.map((page) => {
    const entry = byId.get(page.id);
    if (!entry) return page;
    const patch: Partial<NilaPageSeo> = {
      title: entry.title?.slice(0, 120),
      description: entry.description?.slice(0, 320),
      primaryTopic: entry.primaryTopic?.slice(0, 160),
      answerSummary: entry.answerSummary?.slice(0, 800),
      entityName: entry.entityName?.slice(0, 160),
      audience: entry.audience?.slice(0, 160),
      keywords: entry.keywords?.map(String).filter(Boolean).slice(0, 30),
      faqs: entry.faqs?.filter((faq) => faq.question && faq.answer).slice(0, 12),
      ogTitle: entry.ogTitle?.slice(0, 120),
      ogDescription: entry.ogDescription?.slice(0, 320),
      modifiedAt: new Date().toISOString(),
    };
    return { ...page, seo: { ...page.seo, ...Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined)) } };
  });
  return { site: nextSite, pages: nextPages };
}
