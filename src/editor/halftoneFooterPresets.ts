import type { CatalogPreset } from './catalog';
import { createNode } from './model';
import type { EditorNode } from './types';

export const HALFTONE_FOOTER_NODE_NAME = 'Halftone Wordmark Footer';

export function isHalftoneFooterNode(node?: EditorNode | null) {
  return Boolean(node && node.type === 'div' && node.name === HALFTONE_FOOTER_NODE_NAME);
}

function buildHalftoneWordmarkFooter(): EditorNode[] {
  const footer = createNode('div');
  footer.name = HALFTONE_FOOTER_NODE_NAME;
  footer.props = {
    ...footer.props,
    halftoneWordmark: 'halden',
    halftoneLabel: 'Halden Studio',
    halftoneMeta: `©${new Date().getFullYear()} · Oslo / Lisbon`,
    halftoneColumns: [
      'Work|Index|#|Archive|#|Journal|#',
      'Studio|About|#|Process|#|Careers|#',
      'Contact|hello@halden.co|mailto:hello@halden.co|+47 22 00 41 00|tel:+4722004100',
    ],
    halftonePreset: 'night',
    halftoneBackground: '#0c0c0b',
    halftoneInk: '#e9e4da',
    halftoneWarm: '#e9762b',
    halftoneDotGap: 6,
    halftoneRadius: 80,
    halftoneCrop: 0.2,
    halftoneGrain: 0.5,
    halftoneInteractive: true,
    halftoneBackToTop: true,
    halftoneFontFamily: 'Inter, "Helvetica Neue", Arial, system-ui, sans-serif',
    halftoneFontWeight: 800,
    halftoneMonoFamily: '"JetBrains Mono", "SF Mono", ui-monospace, Menlo, Consolas, monospace',
  };
  footer.styles = {
    desktop: { ...footer.styles.desktop, width: '100%', height: '560px', minWidth: 0, overflow: 'hidden', background: '#0c0c0b' },
    tablet: { ...footer.styles.tablet, width: '100%', height: '540px' },
    mobile: { ...footer.styles.mobile, width: '100%', height: '520px' },
  };

  const section = createNode('section');
  section.name = 'Halftone Footer Section';
  section.styles = {
    desktop: { ...section.styles.desktop, padding: 0, background: '#0c0c0b', overflow: 'hidden' },
    tablet: { ...section.styles.tablet, padding: 0 },
    mobile: { ...section.styles.mobile, padding: 0 },
  };
  section.children = [footer];
  return [section];
}

export const HALFTONE_FOOTER_PRESETS: CatalogPreset[] = [{
  id: 'halftone-wordmark-footer',
  kind: 'section',
  name: 'Halftone Wordmark Footer',
  category: 'Footer',
  description: 'Interactive canvas wordmark footer with editable label, link columns, presets, grain, pointer springs, shock-wave click response and back-to-top.',
  tags: ['footer', 'halftone', 'wordmark', 'interactive', 'canvas', 'animated'],
  build: buildHalftoneWordmarkFooter,
}];
