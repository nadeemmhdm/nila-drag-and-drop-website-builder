import type { NilaPage } from '../core/project';
import type { EditorNodeProps, LinkType } from './types';

export interface ResolvedLink {
  type: LinkType;
  href: string;
  pageId?: string;
  target?: '_blank';
  rel?: 'noopener noreferrer';
}

export function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'page';
}

export function uniqueSlug(value: string, pages: NilaPage[], excludePageId?: string) {
  const base = normalizeSlug(value);
  const used = new Set(pages.filter((page) => page.id !== excludePageId).map((page) => page.slug));
  if (!used.has(base)) return base;
  let index = 2;
  while (used.has(`${base}-${index}`)) index += 1;
  return `${base}-${index}`;
}

export function normalizeAnchor(value?: string) {
  if (!value) return '';
  return value.trim().replace(/^#/, '').toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

export function routeForPage(page: NilaPage) {
  return page.isHome ? '/' : `/${normalizeSlug(page.slug)}`;
}

export function inferLinkType(props: EditorNodeProps): LinkType {
  if (props.linkType) return props.linkType;
  const href = props.href?.trim() ?? '';
  if (href.startsWith('#')) return 'anchor';
  if (href.startsWith('mailto:')) return 'email';
  if (href.startsWith('tel:')) return 'phone';
  return 'external';
}

export function resolveLink(props: EditorNodeProps, pages: NilaPage[]): ResolvedLink {
  const type = inferLinkType(props);
  if (type === 'page') {
    const page = pages.find((candidate) => candidate.id === props.pageId) ?? pages.find((candidate) => candidate.isHome);
    return { type, href: page ? routeForPage(page) : '#', pageId: page?.id };
  }
  if (type === 'anchor') {
    const anchor = normalizeAnchor(props.anchor ?? props.href);
    return { type, href: anchor ? `#${anchor}` : '#' };
  }
  if (type === 'email') {
    const value = (props.href ?? '').replace(/^mailto:/i, '').trim();
    return { type, href: value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? `mailto:${value}` : '#' };
  }
  if (type === 'phone') {
    const value = (props.href ?? '').replace(/^tel:/i, '').replace(/[^+0-9]/g, '');
    return { type, href: value ? `tel:${value}` : '#' };
  }

  const href = safeExternalUrl(props.href ?? '');
  return {
    type,
    href,
    ...(props.newTab && href !== '#' ? { target: '_blank' as const, rel: 'noopener noreferrer' as const } : {}),
  };
}

export function safeExternalUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '#';
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) return '#';
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : '#';
  } catch {
    return '#';
  }
}
