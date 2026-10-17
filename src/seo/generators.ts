import type { NilaAsset, NilaPage, NilaSiteSeo } from '../core/project';

export interface GeneratedSeoFile {
  path: string;
  label: string;
  content: string;
}

const xmlEscape = (value: string) => value.replace(/[<>&'\"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[character] ?? character));
const htmlEscape = (value: string) => value.replace(/[&<>\"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[character] ?? character));

export function normalizeBaseUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    if (!['http:', 'https:'].includes(parsed.protocol)) return '';
    return `${parsed.protocol}//${parsed.host}${parsed.pathname.replace(/\/$/, '')}`;
  } catch {
    return '';
  }
}

export function routeForSeoPage(page: NilaPage): string {
  return page.isHome ? '/' : `/${page.slug.replace(/^\/+|\/+$/g, '')}`;
}

export function absolutePageUrl(site: NilaSiteSeo, page: NilaPage): string {
  const base = normalizeBaseUrl(site.baseUrl);
  if (!base) return routeForSeoPage(page);
  return `${base}${routeForSeoPage(page) === '/' ? '/' : routeForSeoPage(page)}`;
}

function assetPublicUrl(site: NilaSiteSeo, asset?: NilaAsset): string {
  if (!asset) return '';
  const relative = asset.projectPath.replace(/^src\/assets\//, 'assets/').replace(/^\/+/, '');
  const base = normalizeBaseUrl(site.baseUrl);
  return base ? `${base}/${relative}` : `/${relative}`;
}

function securityDate(value: string): string {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return `${trimmed}T23:59:59Z`;
  return trimmed;
}

export function generateRobotsTxt(site: NilaSiteSeo): string {
  const lines = ['User-agent: *'];
  if (!site.robots.allowIndexing) lines.push('Disallow: /');
  else {
    lines.push('Allow: /');
    for (const path of site.robots.disallow.map((item) => item.trim()).filter(Boolean)) lines.push(`Disallow: ${path.startsWith('/') ? path : `/${path}`}`);
  }
  const base = normalizeBaseUrl(site.baseUrl);
  if (base) lines.push('', `Sitemap: ${base}/sitemap.xml`);
  return `${lines.join('\n')}\n`;
}

export function generateSitemapXml(site: NilaSiteSeo, pages: NilaPage[]): string {
  const base = normalizeBaseUrl(site.baseUrl);
  if (!base) return '<!-- Configure a valid Site URL to generate absolute sitemap URLs. -->\n';
  const urls = pages.filter((page) => page.seo.index).map((page) => {
    const lastmod = page.seo.modifiedAt ? page.seo.modifiedAt.slice(0, 10) : '';
    return `  <url>\n    <loc>${xmlEscape(absolutePageUrl(site, page))}</loc>${lastmod ? `\n    <lastmod>${xmlEscape(lastmod)}</lastmod>` : ''}\n  </url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

export function generateLlmsTxt(site: NilaSiteSeo, pages: NilaPage[]): string {
  const publicPages = pages.filter((page) => page.seo.index);
  const lines = [`# ${site.siteName || 'Website'}`, ''];
  if (site.llmsSummary.trim()) lines.push(site.llmsSummary.trim(), '');
  if (site.topics.length) lines.push('## Core topics', '', ...site.topics.filter(Boolean).map((topic) => `- ${topic}`), '');
  lines.push('## Pages', '');
  for (const page of publicPages) {
    lines.push(`- [${page.seo.title || page.name}](${absolutePageUrl(site, page)})${page.seo.description ? ` — ${page.seo.description}` : ''}`);
    if (page.seo.answerSummary) lines.push(`  - Summary: ${page.seo.answerSummary}`);
    if (page.seo.primaryTopic) lines.push(`  - Primary topic: ${page.seo.primaryTopic}`);
  }
  if (site.organizationName) lines.push('', '## Publisher', '', `- ${site.organizationName}${site.organizationUrl ? ` — ${site.organizationUrl}` : ''}`);
  return `${lines.join('\n').trim()}\n`;
}

export function generateSecurityTxt(site: NilaSiteSeo): string {
  const settings = site.security;
  const lines: string[] = [];
  if (settings.contact.trim()) lines.push(`Contact: ${settings.contact.trim()}`);
  else lines.push('# Configure a Contact value before publishing this file.');
  if (settings.expires.trim()) lines.push(`Expires: ${securityDate(settings.expires)}`);
  if (settings.encryption.trim()) lines.push(`Encryption: ${settings.encryption.trim()}`);
  if (settings.acknowledgements.trim()) lines.push(`Acknowledgments: ${settings.acknowledgements.trim()}`);
  if (settings.policy.trim()) lines.push(`Policy: ${settings.policy.trim()}`);
  if (settings.hiring.trim()) lines.push(`Hiring: ${settings.hiring.trim()}`);
  if (settings.preferredLanguages.trim()) lines.push(`Preferred-Languages: ${settings.preferredLanguages.trim()}`);
  const base = normalizeBaseUrl(site.baseUrl);
  if (base) lines.push(`Canonical: ${base}/.well-known/security.txt`);
  return `${lines.join('\n')}\n`;
}

export function generateJsonLd(site: NilaSiteSeo, page: NilaPage, assets: NilaAsset[]): string {
  const graph: Record<string, unknown>[] = [];
  const base = normalizeBaseUrl(site.baseUrl);
  const pageUrl = absolutePageUrl(site, page);
  const orgLogo = assets.find((asset) => asset.id === site.organizationLogoAssetId);
  const ogImage = assets.find((asset) => asset.id === page.seo.ogImageAssetId);

  if (site.organizationName) {
    graph.push({
      '@type': 'Organization',
      '@id': base ? `${base}/#organization` : '#organization',
      name: site.organizationName,
      url: site.organizationUrl || base || undefined,
      logo: orgLogo ? assetPublicUrl(site, orgLogo) : undefined,
      sameAs: site.socialProfiles.filter(Boolean),
    });
  }

  graph.push({
    '@type': 'WebSite',
    '@id': base ? `${base}/#website` : '#website',
    url: base || '/',
    name: site.siteName,
    description: site.defaultDescription || undefined,
    inLanguage: site.language || undefined,
    publisher: site.organizationName ? { '@id': base ? `${base}/#organization` : '#organization' } : undefined,
  });

  const pageEntry: Record<string, unknown> = {
    '@type': page.seo.schemaType,
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: page.seo.title || page.name,
    description: page.seo.description || site.defaultDescription || undefined,
    inLanguage: site.language || undefined,
    isPartOf: { '@id': base ? `${base}/#website` : '#website' },
    about: page.seo.entityName || page.seo.primaryTopic ? { '@type': 'Thing', name: page.seo.entityName || page.seo.primaryTopic } : undefined,
    audience: page.seo.audience ? { '@type': 'Audience', audienceType: page.seo.audience } : undefined,
    keywords: page.seo.keywords.length ? page.seo.keywords.join(', ') : undefined,
    abstract: page.seo.answerSummary || undefined,
    primaryImageOfPage: ogImage ? { '@type': 'ImageObject', url: assetPublicUrl(site, ogImage) } : undefined,
    dateModified: page.seo.modifiedAt || undefined,
  };
  graph.push(pageEntry);

  if (page.seo.faqs.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      mainEntity: page.seo.faqs.filter((faq) => faq.question.trim() && faq.answer.trim()).map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    });
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, (_key, value) => value === undefined ? undefined : value, 2).replace(/</g, '\\u003c');
}

export function generateHeadMarkup(site: NilaSiteSeo, page: NilaPage, assets: NilaAsset[]): string {
  const title = page.seo.title || page.name;
  const description = page.seo.description || site.defaultDescription;
  const canonical = absolutePageUrl(site, page);
  const ogImage = assets.find((asset) => asset.id === page.seo.ogImageAssetId);
  const robots = `${page.seo.index && site.robots.allowIndexing ? 'index' : 'noindex'}, ${page.seo.follow ? 'follow' : 'nofollow'}`;
  const lines = [
    `<title>${htmlEscape(title)}</title>`,
    description ? `<meta name="description" content="${htmlEscape(description)}" />` : '',
    `<meta name="robots" content="${robots}" />`,
    normalizeBaseUrl(site.baseUrl) ? `<link rel="canonical" href="${htmlEscape(canonical)}" />` : '',
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${htmlEscape(page.seo.ogTitle || title)}" />`,
    description ? `<meta property="og:description" content="${htmlEscape(page.seo.ogDescription || description)}" />` : '',
    normalizeBaseUrl(site.baseUrl) ? `<meta property="og:url" content="${htmlEscape(canonical)}" />` : '',
    ogImage ? `<meta property="og:image" content="${htmlEscape(assetPublicUrl(site, ogImage))}" />` : '',
    `<meta name="twitter:card" content="${ogImage ? 'summary_large_image' : 'summary'}" />`,
    `<script type="application/ld+json">${generateJsonLd(site, page, assets)}</script>`,
  ];
  return `${lines.filter(Boolean).join('\n')}\n`;
}

export function generateSeoFiles(site: NilaSiteSeo, pages: NilaPage[]): GeneratedSeoFile[] {
  return [
    { path: 'public/robots.txt', label: 'robots.txt', content: generateRobotsTxt(site) },
    { path: 'public/sitemap.xml', label: 'sitemap.xml', content: generateSitemapXml(site, pages) },
    { path: 'public/llms.txt', label: 'llms.txt', content: generateLlmsTxt(site, pages) },
    { path: 'public/.well-known/security.txt', label: 'security.txt', content: generateSecurityTxt(site) },
  ];
}
