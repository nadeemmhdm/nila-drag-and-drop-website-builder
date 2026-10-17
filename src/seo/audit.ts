import type { NilaPage, NilaSiteSeo } from '../core/project';
import type { EditorNode } from '../editor/types';
import { normalizeBaseUrl } from './generators';

export type SeoIssueSeverity = 'error' | 'warning' | 'info';
export interface SeoIssue { severity: SeoIssueSeverity; scope: string; message: string; }
export interface SeoAuditResult { score: number; errors: number; warnings: number; infos: number; issues: SeoIssue[]; }

function walk(nodes: EditorNode[]): EditorNode[] {
  return nodes.flatMap((node) => [node, ...walk(node.children)]);
}

function validHttpUrl(value: string): boolean {
  if (!value.trim()) return false;
  try { const parsed = new URL(value); return parsed.protocol === 'http:' || parsed.protocol === 'https:'; } catch { return false; }
}

export function auditSeo(site: NilaSiteSeo, pages: NilaPage[]): SeoAuditResult {
  const issues: SeoIssue[] = [];
  const push = (severity: SeoIssueSeverity, scope: string, message: string) => issues.push({ severity, scope, message });
  const base = normalizeBaseUrl(site.baseUrl);
  if (!base) push('error', 'Site', 'Set a valid absolute Site URL so canonical URLs and sitemap entries can be generated.');
  else if (!base.startsWith('https://')) push('warning', 'Site', 'HTTPS is recommended for the public canonical Site URL.');
  if (!site.siteName.trim() || site.siteName === 'Untitled Site') push('warning', 'Site', 'Use a descriptive site name.');
  if (!site.defaultDescription.trim()) push('warning', 'Site', 'Add a default site description for metadata fallback.');
  if (!site.llmsSummary.trim()) push('warning', 'GEO', 'Add an llms.txt summary describing what the site offers and who it serves.');
  if (!site.topics.length) push('info', 'GEO', 'Add core topics so machine-readable summaries have clearer topical scope.');
  if (!site.security.contact.trim()) push('warning', 'Security', 'security.txt should include a vulnerability-reporting Contact.');
  if (!site.security.expires.trim()) push('info', 'Security', 'Add an Expires date to security.txt before publishing.');

  const titles = new Map<string, number>();
  const descriptions = new Map<string, number>();
  for (const page of pages) {
    const scope = page.name;
    const title = page.seo.title.trim();
    const description = page.seo.description.trim();
    if (!title) push('error', scope, 'Page title is missing.');
    else {
      titles.set(title.toLowerCase(), (titles.get(title.toLowerCase()) ?? 0) + 1);
      if (title.length < 20 || title.length > 65) push('warning', scope, `Title length is ${title.length}; aim for a concise, descriptive title.`);
    }
    if (!description) push('error', scope, 'Meta description is missing.');
    else {
      descriptions.set(description.toLowerCase(), (descriptions.get(description.toLowerCase()) ?? 0) + 1);
      if (description.length < 70 || description.length > 165) push('warning', scope, `Description length is ${description.length}; improve search-result readability.`);
    }
    if (!page.seo.primaryTopic.trim()) push('warning', scope, 'Set a primary topic for stronger semantic and generative-engine context.');
    if (!page.seo.answerSummary.trim()) push('warning', scope, 'Add a concise answer summary for AEO/GEO extraction.');

    const nodes = walk(page.nodes);
    if (!nodes.some((node) => node.type === 'heading' && node.props.text?.trim())) push('error', scope, 'Add a meaningful primary heading to the page.');
    for (const node of nodes) {
      if ((node.type === 'image' || node.type === 'avatar') && (node.props.src || node.props.assetId) && !node.props.alt?.trim()) push('warning', scope, `${node.name} is missing alt text.`);
      if ((node.type === 'link' || node.type === 'button') && node.props.linkType === 'page' && node.props.pageId && !pages.some((candidate) => candidate.id === node.props.pageId)) push('error', scope, `${node.name} points to a missing internal page.`);
      if ((node.type === 'link' || node.type === 'button') && node.props.linkType === 'external' && node.props.href && !validHttpUrl(node.props.href)) push('error', scope, `${node.name} has an invalid external URL.`);
    }
    for (const faq of page.seo.faqs) if (!faq.question.trim() || !faq.answer.trim()) push('warning', scope, 'FAQ entries need both a question and an answer.');
  }

  for (const [title, count] of titles) if (count > 1) push('warning', 'Pages', `Duplicate SEO title used ${count} times: “${title}”.`);
  for (const [description, count] of descriptions) if (description && count > 1) push('info', 'Pages', `Duplicate meta description used ${count} times.`);

  const errors = issues.filter((issue) => issue.severity === 'error').length;
  const warnings = issues.filter((issue) => issue.severity === 'warning').length;
  const infos = issues.filter((issue) => issue.severity === 'info').length;
  const score = Math.max(0, 100 - errors * 12 - warnings * 5 - infos * 2);
  return { score, errors, warnings, infos, issues };
}
