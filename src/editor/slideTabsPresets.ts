import { createNode } from './model';
import type { CatalogPreset } from './catalog';
import type { EditorNode, EditorNodeProps, EditorNodeType, NodeStyle } from './types';

type NodeConfig = { name?: string; props?: EditorNodeProps; style?: NodeStyle; tablet?: NodeStyle; mobile?: NodeStyle; children?: EditorNode[] };

const patch = (type: EditorNodeType, config: NodeConfig = {}): EditorNode => {
  const base = createNode(type);
  return {
    ...base,
    name: config.name ?? base.name,
    props: { ...base.props, ...config.props },
    styles: {
      desktop: { ...base.styles.desktop, ...config.style },
      tablet: { ...base.styles.tablet, ...config.tablet },
      mobile: { ...base.styles.mobile, ...config.mobile },
    },
    children: config.children ?? base.children,
  };
};

const tab = (label: string, index: number): EditorNode => patch('link', {
  name: `${label} tab`,
  props: { text: label, href: '#', anchorId: `slide-tab-${index}` },
  style: {
    position: 'relative',
    zIndex: 2,
    width: 'clamp(76px,9vw,116px)',
    minHeight: '42px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 14px',
    borderRadius: '999px',
    color: '#ffffff',
    mixBlendMode: 'difference',
    fontSize: '13px',
    fontWeight: 750,
    letterSpacing: '.04em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    transition: 'transform 220ms cubic-bezier(.2,.8,.2,1), box-shadow 260ms ease',
    '--nila-hover-transform': 'translateY(-1px) scale(1.02)',
    '--nila-hover-shadow': 'inset 0 0 0 999px #111111',
  },
  tablet: { width: '100px', minHeight: '40px', fontSize: '12px' },
  mobile: { width: '88px', minHeight: '38px', padding: '9px 11px', fontSize: '11px' },
});

function buildSlideTabs(): EditorNode[] {
  const labels = ['Home', 'Pricing', 'Features', 'Docs', 'Blog'];
  const cursor = patch('div', {
    name: 'Sliding cursor',
    props: { anchorId: 'slide-tabs-cursor' },
    style: {
      position: 'absolute',
      left: '4px',
      top: '4px',
      bottom: '4px',
      width: 'clamp(76px,9vw,116px)',
      borderRadius: '999px',
      background: '#111111',
      pointerEvents: 'none',
      zIndex: 1,
      transition: 'transform 280ms cubic-bezier(.2,.8,.2,1), width 220ms ease',
      boxShadow: '0 8px 20px rgba(15,23,42,.14)',
    },
    tablet: { width: '100px' },
    mobile: { width: '88px' },
  });

  const tabs = patch('div', {
    name: 'Slide Tabs navigation',
    props: { anchorId: 'slide-tabs' },
    style: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: 'fit-content',
      maxWidth: '100%',
      margin: '0 auto',
      padding: '4px',
      gap: 0,
      overflowX: 'auto',
      overflowY: 'hidden',
      border: '2px solid #111111',
      borderRadius: '999px',
      background: '#ffffff',
      boxShadow: '0 10px 30px rgba(15,23,42,.08)',
      scrollbarWidth: 'none',
    },
    mobile: { justifyContent: 'flex-start', width: '100%' },
    children: [cursor, ...labels.map(tab)],
  });

  const shell = patch('container', {
    name: 'Slide Tabs shell',
    style: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    children: [tabs],
  });

  return [patch('section', {
    name: 'Slide Tabs',
    props: { anchorId: 'slide-tabs-section' },
    style: { width: '100%', padding: '28px 24px', background: '#ffffff' },
    tablet: { padding: '22px 18px' },
    mobile: { padding: '18px 12px' },
    children: [shell],
  })];
}

export const SLIDE_TAB_PRESETS: CatalogPreset[] = [
  {
    id: 'slide-tabs',
    kind: 'section',
    name: 'Slide Tabs',
    category: 'Navigation',
    description: 'Responsive pill navigation with editable tab labels, links and animated hover feedback.',
    tags: ['navigation', 'tabs', 'animated', 'pill', 'responsive'],
    build: buildSlideTabs,
  },
];
