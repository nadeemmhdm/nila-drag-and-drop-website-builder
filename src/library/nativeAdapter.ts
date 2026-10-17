import type { NilaPage } from '../core/project';
import { createNode } from '../editor/model';
import type { EditorNode, EditorNodeProps, EditorNodeType, NodeStyle } from '../editor/types';
import type { VendorItem } from './vendorTypes';

type NodeConfig = {
  name?: string;
  props?: EditorNodeProps;
  style?: NodeStyle;
  tablet?: NodeStyle;
  mobile?: NodeStyle;
  children?: EditorNode[];
};

export interface NativeVendorTheme {
  id: string;
  name: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  card: string;
  cardForeground: string;
  border: string;
  input: string;
  radius: string;
}

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

const heading = (text: string, style: NodeStyle = {}) => patch('heading', { props: { text }, style });
const paragraph = (text: string, style: NodeStyle = {}) => patch('paragraph', { props: { text }, style });
const button = (text: string, style: NodeStyle = {}) => patch('button', { props: { text }, style });
const badge = (text: string, style: NodeStyle = {}) => patch('badge', { props: { text }, style });
const card = (children: EditorNode[], style: NodeStyle = {}) => patch('card', { children, style });
const row = (children: EditorNode[], style: NodeStyle = {}) => patch('row', { children, style });
const container = (children: EditorNode[], style: NodeStyle = {}) => patch('container', { children, style });
const grid = (children: EditorNode[], columns = 3) => patch('grid', { children, style: { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }, tablet: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }, mobile: { gridTemplateColumns: 'minmax(0, 1fr)' } });
const section = (name: string, children: EditorNode[], style: NodeStyle = {}) => patch('section', { name, children: [container(children)], style });

function animate(nodes: EditorNode[], enabled: boolean): EditorNode[] {
  if (!enabled) return nodes;
  return nodes.map((node, index) => ({
    ...node,
    styles: {
      ...node.styles,
      desktop: {
        ...node.styles.desktop,
        animationName: node.styles.desktop.animationName ?? 'nila-slide-up',
        animationDuration: node.styles.desktop.animationDuration ?? '600ms',
        animationDelay: node.styles.desktop.animationDelay ?? `${Math.min(index * 70, 280)}ms`,
        animationFillMode: node.styles.desktop.animationFillMode ?? 'both',
      },
    },
  }));
}

function description(item: VendorItem) {
  return item.description?.trim() || `Editable ${item.title} imported from the offline UI library.`;
}

function semanticText(item: VendorItem, source: string) {
  return `${item.name} ${item.title} ${item.description} ${source.slice(0, 12000)}`.toLowerCase();
}

function wrapForLibraryKind(item: VendorItem, nodes: EditorNode[]): EditorNode[] {
  const animated = item.kind === 'animated';
  const prepared = animate(nodes, animated);
  if ((item.kind === 'block' || item.kind === 'animated') && prepared.length === 1 && prepared[0].type !== 'section') {
    return [section(item.title, prepared, animated ? { overflow: 'hidden' } : {})];
  }
  return prepared;
}

export function buildNativeVendorNodes(item: VendorItem, source = ''): EditorNode[] {
  const key = semanticText(item, source);
  const title = item.title || item.name;
  const desc = description(item);
  let nodes: EditorNode[];

  if (/navbar|navigation|menubar|header\b/.test(key)) {
    nodes = [section(title, [row([
      heading(title, { fontSize: '22px', width: 'fit-content' }),
      row([
        patch('link', { props: { text: 'Home', href: '#' } }),
        patch('link', { props: { text: 'Features', href: '#' } }),
        patch('link', { props: { text: 'Contact', href: '#' } }),
      ], { width: 'auto', gap: '18px', justifyContent: 'center' }),
      button('Get started'),
    ], { justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' })], { padding: '18px 24px', borderBottom: '1px solid #e5e7eb' })];
  } else if (/footer/.test(key)) {
    nodes = [section(title, [grid([
      container([heading(title, { fontSize: '24px' }), paragraph(desc)]),
      container([heading('Product', { fontSize: '16px' }), patch('link', { props: { text: 'Features', href: '#' } }), patch('link', { props: { text: 'Pricing', href: '#' } })]),
      container([heading('Company', { fontSize: '16px' }), patch('link', { props: { text: 'About', href: '#' } }), patch('link', { props: { text: 'Contact', href: '#' } })]),
    ])], { padding: '48px 28px', borderTop: '1px solid #e5e7eb' })];
  } else if (/hero/.test(key)) {
    nodes = [section(title, [
      badge('Offline UI'),
      heading(title, { maxWidth: '780px', fontSize: '56px' }),
      paragraph(desc, { maxWidth: '680px', fontSize: '18px' }),
      row([button('Primary action'), button('Secondary action', { background: '#ffffff', color: '#111827', border: '1px solid #d1d5db' })], { width: 'auto' }),
    ], { padding: '88px 32px' })];
  } else if (/pricing|price-card/.test(key)) {
    nodes = [section(title, [badge('Pricing'), heading(title, { fontSize: '40px' }), grid([
      card([heading('Starter', { fontSize: '22px' }), heading('$0', { fontSize: '36px' }), paragraph('A simple starting plan.'), button('Choose Starter')]),
      card([badge('Popular'), heading('Pro', { fontSize: '22px' }), heading('$19', { fontSize: '36px' }), paragraph('For growing projects and teams.'), button('Choose Pro')], { border: '2px solid #6366f1' }),
      card([heading('Team', { fontSize: '22px' }), heading('$49', { fontSize: '36px' }), paragraph('For shared workflows and larger teams.'), button('Contact sales')]),
    ])])];
  } else if (/testimonial|review/.test(key)) {
    nodes = [section(title, [badge('Reviews'), heading(title, { fontSize: '40px' }), grid([
      card([patch('quote', { props: { text: 'A clear, polished experience from start to finish.' } }), paragraph('— Customer one')]),
      card([patch('quote', { props: { text: 'Easy to customize and responsive by default.' } }), paragraph('— Customer two')]),
      card([patch('quote', { props: { text: 'A strong reusable block for a modern website.' } }), paragraph('— Customer three')]),
    ])])];
  } else if (/accordion|faq/.test(key)) {
    nodes = [container([
      card([heading('Question one', { fontSize: '18px' }), paragraph(desc)]),
      card([heading('Question two', { fontSize: '18px' }), paragraph('Edit this answer directly in the Nila inspector.')]),
      card([heading('Question three', { fontSize: '18px' }), paragraph('Duplicate, reorder, restyle, or remove any item.')]),
    ], { gap: '12px' })];
  } else if (/tabs?\b/.test(key)) {
    nodes = [container([
      row([button('Overview'), button('Details', { background: '#f3f4f6', color: '#111827' }), button('Settings', { background: '#f3f4f6', color: '#111827' })], { width: 'auto' }),
      card([heading(title, { fontSize: '22px' }), paragraph(desc)]),
    ])];
  } else if (/login|sign-in|signin|contact-form|form\b/.test(key)) {
    nodes = [card([
      heading(title, { fontSize: '28px' }),
      paragraph(desc),
      patch('input', { props: { label: 'Email', fieldName: 'email', inputType: 'email', placeholder: 'you@example.com' } }),
      patch('input', { props: { label: 'Password', fieldName: 'password', inputType: 'password', placeholder: 'Enter password' } }),
      button('Continue', { width: '100%' }),
    ], { maxWidth: '460px' })];
  } else if (/select|combobox|dropdown/.test(key)) {
    nodes = [patch('select', { name: title, props: { label: title, fieldName: item.name.replace(/[^a-z0-9_-]/gi, '_'), options: ['Option one', 'Option two', 'Option three'] } })];
  } else if (/textarea/.test(key)) {
    nodes = [patch('textarea', { name: title, props: { label: title, fieldName: item.name.replace(/[^a-z0-9_-]/gi, '_'), placeholder: desc } })];
  } else if (/checkbox|switch|toggle/.test(key)) {
    nodes = [patch('checkbox', { name: title, props: { label: title, fieldName: item.name.replace(/[^a-z0-9_-]/gi, '_') } })];
  } else if (/input|field/.test(key)) {
    nodes = [patch('input', { name: title, props: { label: title, fieldName: item.name.replace(/[^a-z0-9_-]/gi, '_'), placeholder: desc } })];
  } else if (/avatar/.test(key)) {
    nodes = [row([patch('avatar', { name: `${title} image` }), container([heading(title, { fontSize: '18px' }), paragraph(desc, { fontSize: '14px' })], { width: 'auto' })], { width: 'auto' })];
  } else if (/badge|chip/.test(key)) {
    nodes = [badge(title)];
  } else if (/button|cta/.test(key)) {
    nodes = [button(title)];
  } else if (/alert|callout|toast/.test(key)) {
    nodes = [card([badge('Notice'), heading(title, { fontSize: '20px' }), paragraph(desc)], { borderLeft: '4px solid #6366f1' })];
  } else if (/card/.test(key)) {
    nodes = [card([badge(item.kind), heading(title, { fontSize: '22px' }), paragraph(desc), button('Action')])];
  } else if (/table|data-grid/.test(key)) {
    nodes = [card([
      heading(title, { fontSize: '22px' }),
      grid([badge('Name'), badge('Status'), badge('Action')], 3),
      grid([paragraph('Example item'), paragraph('Active'), patch('link', { props: { text: 'View', href: '#' } })], 3),
      grid([paragraph('Second item'), paragraph('Pending'), patch('link', { props: { text: 'View', href: '#' } })], 3),
    ])];
  } else {
    nodes = [card([
      badge(item.kind),
      heading(title, { fontSize: '22px' }),
      paragraph(desc),
      button('Action'),
    ], { minHeight: item.kind === 'component' ? '140px' : '180px' })];
  }

  return wrapForLibraryKind(item, nodes);
}

function normalizeColor(value: string | undefined, fallback: string) {
  if (!value) return fallback;
  const clean = value.trim();
  if (/^(#|rgb\(|rgba\(|hsl\(|hsla\(|oklch\(|oklab\(|lab\(|lch\(|color\(|var\()/i.test(clean)) return clean;
  if (/^-?\d+(?:\.\d+)?\s+-?\d+(?:\.\d+)?%\s+-?\d+(?:\.\d+)?%/.test(clean)) return `hsl(${clean})`;
  return fallback;
}

function cssVariables(source: string) {
  const variables = new Map<string, string>();
  const matcher = /--([a-z0-9-]+)\s*:\s*([^;{}]+);/gi;
  for (const match of source.matchAll(matcher)) {
    const name = match[1]?.toLowerCase();
    const value = match[2]?.trim();
    if (name && value && !variables.has(name)) variables.set(name, value);
  }
  return variables;
}

export function createNativeVendorTheme(item: VendorItem, source = ''): NativeVendorTheme {
  const vars = cssVariables(source);
  const get = (name: string, fallback: string) => normalizeColor(vars.get(name), fallback);
  const radius = vars.get('radius')?.trim() || '12px';
  return {
    id: item.name,
    name: item.title,
    background: get('background', '#ffffff'),
    foreground: get('foreground', '#111827'),
    muted: get('muted', '#f3f4f6'),
    mutedForeground: get('muted-foreground', '#6b7280'),
    primary: get('primary', '#111827'),
    primaryForeground: get('primary-foreground', '#ffffff'),
    secondary: get('secondary', '#f3f4f6'),
    secondaryForeground: get('secondary-foreground', '#111827'),
    card: get('card', '#ffffff'),
    cardForeground: get('card-foreground', '#111827'),
    border: get('border', '#e5e7eb'),
    input: get('input', '#d1d5db'),
    radius,
  };
}

function applyThemeNode(node: EditorNode, theme: NativeVendorTheme): EditorNode {
  let patchStyle: NodeStyle = {};
  switch (node.type) {
    case 'section': patchStyle = { background: theme.background, color: theme.foreground }; break;
    case 'card': patchStyle = { background: theme.card, color: theme.cardForeground, borderColor: theme.border, borderRadius: theme.radius }; break;
    case 'heading': patchStyle = { color: theme.foreground }; break;
    case 'paragraph':
    case 'quote':
    case 'list': patchStyle = { color: theme.mutedForeground }; break;
    case 'link':
    case 'icon': patchStyle = { color: theme.primary }; break;
    case 'button': patchStyle = { background: theme.primary, color: theme.primaryForeground, borderColor: theme.primary, borderRadius: theme.radius }; break;
    case 'badge': patchStyle = { background: theme.secondary, color: theme.secondaryForeground, borderRadius: theme.radius }; break;
    case 'input':
    case 'textarea':
    case 'select': patchStyle = { background: theme.background, color: theme.foreground, borderColor: theme.input, borderRadius: theme.radius }; break;
    case 'checkbox': patchStyle = { color: theme.foreground }; break;
    case 'divider': patchStyle = { background: theme.border }; break;
    default: break;
  }
  return {
    ...node,
    styles: { ...node.styles, desktop: { ...node.styles.desktop, ...patchStyle } },
    children: node.children.map((child) => applyThemeNode(child, theme)),
  };
}

export function applyNativeVendorTheme(pages: NilaPage[], theme: NativeVendorTheme): NilaPage[] {
  return pages.map((page) => ({ ...page, nodes: page.nodes.map((node) => applyThemeNode(node, theme)) }));
}
