import type { CatalogPreset } from './catalog';
import { createNode } from './model';
import type { EditorNode, NodeStyle } from './types';

export const HALFTONE_CANVAS_NODE_NAME = 'Halftone Canvas Wordmark';

export function isHalftoneFooterNode(node?: EditorNode | null) {
  return Boolean(node && node.type === 'heading' && node.name === HALFTONE_CANVAS_NODE_NAME);
}

function patch(type: EditorNode['type'], config: { name?: string; text?: string; href?: string; style?: NodeStyle; tablet?: NodeStyle; mobile?: NodeStyle; children?: EditorNode[] } = {}): EditorNode {
  const node = createNode(type);
  return {
    ...node,
    name: config.name ?? node.name,
    props: {
      ...node.props,
      ...(config.text !== undefined ? { text: config.text } : {}),
      ...(config.href !== undefined ? { href: config.href, linkType: config.href.startsWith('#') ? 'anchor' : config.href.startsWith('mailto:') ? 'email' : config.href.startsWith('tel:') ? 'phone' : 'external' } : {}),
    },
    styles: {
      desktop: { ...node.styles.desktop, ...config.style },
      tablet: { ...node.styles.tablet, ...config.tablet },
      mobile: { ...node.styles.mobile, ...config.mobile },
    },
    children: config.children ?? node.children,
  };
}

const heading = (name: string, text: string, style: NodeStyle = {}) => patch('heading', { name, text, style });
const paragraph = (name: string, text: string, style: NodeStyle = {}) => patch('paragraph', { name, text, style });
const link = (text: string, href = '#') => patch('link', { name: `${text} link`, text, href, style: { color: 'inherit', opacity: .78, textDecoration: 'none', fontSize: '11px', letterSpacing: '.16em', textTransform: 'uppercase', width: 'fit-content', transition: 'opacity 220ms ease, transform 220ms ease', '--nila-hover-transform': 'translateX(4px)' } });
const container = (name: string, children: EditorNode[], style: NodeStyle = {}, tablet: NodeStyle = {}, mobile: NodeStyle = {}) => patch('container', { name, children, style, tablet, mobile });
const div = (name: string, children: EditorNode[] = [], style: NodeStyle = {}, tablet: NodeStyle = {}, mobile: NodeStyle = {}) => patch('div', { name, children, style, tablet, mobile });

function linkColumn(title: string, items: Array<{ label: string; href?: string }>): EditorNode {
  return container(`${title} links`, [
    heading(`${title} title`, title, { fontSize: '11px', fontWeight: 500, letterSpacing: '.18em', textTransform: 'uppercase', opacity: .4, color: 'inherit' }),
    ...items.map((item) => link(item.label, item.href ?? '#')),
  ], { width: '100%', gap: '8px', color: 'inherit' });
}

function buildHalftoneWordmarkFooter(): EditorNode[] {
  const canvas = patch('heading', {
    name: HALFTONE_CANVAS_NODE_NAME,
    text: 'halden',
    style: {
      position: 'absolute', inset: 0, width: '100%', height: '100%', margin: 0,
      backgroundColor: '#0c0c0b', color: '#e9e4da', borderColor: '#e9762b',
      fontFamily: 'Inter, "Helvetica Neue", Arial, system-ui, sans-serif', fontWeight: 800,
      zIndex: 0,
    },
  });

  const top = div('Halftone footer top', [
    container('Studio identity', [
      heading('Studio label', 'Halden Studio', { fontSize: '12px', fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: 'inherit' }),
      paragraph('Studio meta', `©${new Date().getFullYear()} · Oslo / Lisbon`, { fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'inherit', opacity: .45 }),
    ], { gap: '5px', color: 'inherit' }),
    linkColumn('Work', [{ label: 'Index' }, { label: 'Archive' }, { label: 'Journal' }]),
    linkColumn('Studio', [{ label: 'About' }, { label: 'Process' }, { label: 'Careers' }]),
    linkColumn('Contact', [{ label: 'hello@halden.co', href: 'mailto:hello@halden.co' }, { label: '+47 22 00 41 00', href: 'tel:+4722004100' }]),
  ], {
    width: '100%', display: 'grid', gridTemplateColumns: 'minmax(0,1.25fr) repeat(3,minmax(0,1fr))', gap: '24px', padding: '34px 40px 0', position: 'relative', zIndex: 3, color: '#e9e4da', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  }, { gridTemplateColumns: 'repeat(2,minmax(0,1fr))', padding: '28px 28px 0' }, { gridTemplateColumns: 'repeat(2,minmax(0,1fr))', padding: '24px 20px 0', gap: '18px' });

  const rule = div('Footer hairline', [
    patch('divider', { name: 'Footer rule line', style: { background: 'rgba(233,228,218,.18)', height: '1px' } }),
    link('Back to top ↑', '#top'),
  ], { display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '16px', margin: '28px 40px 0', position: 'relative', zIndex: 3, color: '#e9e4da' }, { margin: '24px 28px 0' }, { margin: '22px 20px 0' });

  const hint = paragraph('Interaction hint', 'Move across the wordmark · click for a shock wave', {
    position: 'absolute', left: '40px', bottom: '24px', zIndex: 3, width: 'fit-content', color: '#e9e4da', opacity: .42, fontSize: '10px', letterSpacing: '.14em', textTransform: 'uppercase',
  });

  const section = patch('section', {
    name: 'Halftone Wordmark Footer',
    style: { width: '100%', minHeight: '560px', padding: 0, position: 'relative', overflow: 'hidden', color: '#e9e4da', backgroundColor: '#0c0c0b', isolation: 'isolate' },
    tablet: { minHeight: '540px' }, mobile: { minHeight: '520px' }, children: [canvas, top, rule, hint],
  });

  return [section];
}

export const HALFTONE_FOOTER_PRESETS: CatalogPreset[] = [{
  id: 'halftone-wordmark-footer',
  kind: 'section',
  name: 'Halftone Wordmark Footer',
  category: 'Footer',
  description: 'Interactive canvas wordmark footer with editable studio copy, links, wordmark text, colors, sizing and responsive layout.',
  tags: ['footer', 'halftone', 'wordmark', 'interactive', 'canvas', 'animated'],
  build: buildHalftoneWordmarkFooter,
}];
