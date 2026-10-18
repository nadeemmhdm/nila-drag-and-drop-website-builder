import type { CatalogPreset } from './catalog';
import { createNode } from './model';
import type { EditorNode, NodeStyle } from './types';

function patch(type: EditorNode['type'], config: { name?: string; text?: string; href?: string; style?: NodeStyle; tablet?: NodeStyle; mobile?: NodeStyle; children?: EditorNode[] } = {}): EditorNode {
  const node = createNode(type);
  return {
    ...node,
    name: config.name ?? node.name,
    props: {
      ...node.props,
      ...(config.text !== undefined ? { text: config.text } : {}),
      ...(config.href !== undefined ? { href: config.href, linkType: config.href.startsWith('#') ? 'anchor' : config.href.startsWith('mailto:') ? 'email' : 'external' } : {}),
    },
    styles: {
      desktop: { ...node.styles.desktop, ...config.style },
      tablet: { ...node.styles.tablet, ...config.tablet },
      mobile: { ...node.styles.mobile, ...config.mobile },
    },
    children: config.children ?? node.children,
  };
}

const heading = (name: string, text: string, style: NodeStyle = {}, tablet: NodeStyle = {}, mobile: NodeStyle = {}) => patch('heading', { name, text, style, tablet, mobile });
const paragraph = (name: string, text: string, style: NodeStyle = {}) => patch('paragraph', { name, text, style });
const link = (text: string, href = '#') => patch('link', { name: `${text} link`, text, href, style: { color: 'inherit', opacity: .78, textDecoration: 'none', fontSize: '11px', letterSpacing: '.16em', textTransform: 'uppercase', width: 'fit-content', transition: 'opacity 220ms ease, transform 220ms ease', '--nila-hover-transform': 'translateX(4px)', '--nila-hover-filter': 'brightness(1.18)' } });
const container = (name: string, children: EditorNode[], style: NodeStyle = {}, tablet: NodeStyle = {}, mobile: NodeStyle = {}) => patch('container', { name, children, style, tablet, mobile });
const div = (name: string, children: EditorNode[] = [], style: NodeStyle = {}, tablet: NodeStyle = {}, mobile: NodeStyle = {}) => patch('div', { name, children, style, tablet, mobile });

function linkColumn(title: string, items: string[]): EditorNode {
  return container(`${title} links`, [
    heading(`${title} title`, title, { fontSize: '11px', fontWeight: 500, letterSpacing: '.18em', textTransform: 'uppercase', opacity: .4, color: 'inherit' }),
    ...items.map((item) => link(item, item.includes('@') ? `mailto:${item}` : '#')),
  ], { width: '100%', gap: '8px', color: 'inherit' });
}

function buildHalftoneWordmarkFooter(): EditorNode[] {
  const top = div('Halftone footer top', [
    container('Studio identity', [
      heading('Studio label', 'Halden Studio', { fontSize: '12px', fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: 'inherit' }),
      paragraph('Studio meta', '©2026 · Oslo / Lisbon', { fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'inherit', opacity: .45 }),
    ], { gap: '5px', color: 'inherit' }),
    linkColumn('Work', ['Index', 'Archive', 'Journal']),
    linkColumn('Studio', ['About', 'Process', 'Careers']),
    linkColumn('Contact', ['hello@halden.co', '+47 22 00 41 00']),
  ], {
    width: '100%', display: 'grid', gridTemplateColumns: 'minmax(0,1.25fr) repeat(3,minmax(0,1fr))', gap: '24px', padding: '34px 40px 0', position: 'relative', zIndex: 4, color: '#e9e4da', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  }, { gridTemplateColumns: 'repeat(2,minmax(0,1fr))', padding: '28px 28px 0' }, { gridTemplateColumns: 'repeat(2,minmax(0,1fr))', padding: '24px 20px 0', gap: '18px' });

  const rule = div('Footer hairline', [
    patch('divider', { name: 'Footer rule line', style: { background: 'rgba(233,228,218,.18)', height: '1px' } }),
    patch('link', { name: 'Back to top', text: 'Back to top ↑', href: '#top', style: { marginLeft: 'auto', color: '#e9e4da', opacity: .8, fontSize: '11px', letterSpacing: '.18em', textTransform: 'uppercase', width: 'fit-content', textDecoration: 'none' } }),
  ], { display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '16px', margin: '28px 40px 0', position: 'relative', zIndex: 4 }, { margin: '24px 28px 0' }, { margin: '22px 20px 0' });

  const warmEcho = heading('Warm halftone echo', 'halden', {
    position: 'absolute', left: '50%', bottom: '-.22em', width: '103%', transform: 'translateX(-50%) translate(10px,-4px)', fontSize: 'clamp(170px,31vw,480px)', lineHeight: .68, letterSpacing: '-.085em', fontWeight: 900, textTransform: 'lowercase', textAlign: 'center', color: 'transparent', background: 'radial-gradient(circle,#e9762b 0 38%,transparent 42%) 0 0/8px 8px', backgroundClip: 'text', WebkitBackgroundClip: 'text', opacity: .11, pointerEvents: 'none', filter: 'blur(.15px)', zIndex: 1,
  }, { fontSize: 'clamp(150px,34vw,360px)' }, { fontSize: 'clamp(112px,39vw,230px)' });

  const wordmark = heading('Halftone wordmark', 'halden', {
    position: 'relative', zIndex: 2, width: '103%', marginLeft: '-1.5%', marginTop: '40px', marginBottom: '-.20em', fontSize: 'clamp(170px,31vw,480px)', lineHeight: .68, letterSpacing: '-.085em', fontWeight: 900, textTransform: 'lowercase', textAlign: 'center', color: 'transparent', background: 'radial-gradient(circle,#e9e4da 0 38%,transparent 42%) 0 0/8px 8px', backgroundClip: 'text', WebkitBackgroundClip: 'text', transition: 'transform 420ms cubic-bezier(.2,.8,.2,1),filter 420ms ease,background-position 700ms ease', '--nila-hover-transform': 'translateY(-8px) scale(1.012)', '--nila-hover-filter': 'drop-shadow(0 18px 28px rgba(233,118,43,.24))',
  }, { fontSize: 'clamp(150px,34vw,360px)' }, { fontSize: 'clamp(112px,39vw,230px)', marginTop: '54px' });

  const shock = div('Halftone shock ring', [], { position: 'absolute', left: '50%', bottom: '18%', width: '180px', height: '180px', borderRadius: '50%', border: '1px solid rgba(233,118,43,.34)', transform: 'translateX(-50%)', boxShadow: '0 0 0 38px rgba(233,118,43,.035),0 0 0 78px rgba(233,118,43,.018)', animationName: 'nila-pulse', animationDuration: '3.4s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite', pointerEvents: 'none', zIndex: 0 }, {}, { width: '120px', height: '120px' });

  const stage = div('Halftone wordmark stage', [shock, warmEcho, wordmark], { width: '100%', minHeight: '360px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }, { minHeight: '320px' }, { minHeight: '250px' });

  const section = patch('section', {
    name: 'Halftone Wordmark Footer',
    style: { width: '100%', minHeight: '560px', padding: 0, position: 'relative', overflow: 'hidden', color: '#e9e4da', backgroundColor: '#0c0c0b', backgroundImage: 'radial-gradient(circle at 20% 20%,rgba(255,255,255,.035) 0 1px,transparent 1px),radial-gradient(circle at 70% 62%,rgba(255,255,255,.025) 0 1px,transparent 1px)', backgroundSize: '5px 5px,7px 7px', isolation: 'isolate' },
    tablet: { minHeight: '530px' }, mobile: { minHeight: '500px' }, children: [top, rule, stage],
  });

  return [section];
}

export const HALFTONE_FOOTER_PRESETS: CatalogPreset[] = [{
  id: 'halftone-wordmark-footer', kind: 'section', name: 'Halftone Wordmark Footer', category: 'Footer', description: 'Large cropped dot-print wordmark footer with editable studio copy, link columns, grain, warm motion and back-to-top link.', tags: ['footer', 'halftone', 'wordmark', 'interactive', 'animated', 'studio'], build: buildHalftoneWordmarkFooter,
}];
