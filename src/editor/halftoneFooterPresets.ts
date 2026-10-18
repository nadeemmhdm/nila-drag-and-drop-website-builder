import type { CatalogPreset } from './catalog';
import { createNode } from './model';

function buildHalftoneWordmarkFooter() {
  const section = createNode('section');
  const footer = createNode('halftone-footer');
  section.name = 'Halftone Wordmark Footer Section';
  section.styles.desktop = { width: '100%', padding: 0, background: '#0c0c0b', overflow: 'hidden' };
  section.styles.tablet = { padding: 0 };
  section.styles.mobile = { padding: 0 };
  section.children = [footer];
  return [section];
}

export const HALFTONE_FOOTER_PRESETS: CatalogPreset[] = [
  {
    id: 'halftone-wordmark-footer',
    kind: 'section',
    name: 'Halftone Wordmark Footer',
    category: 'Footer',
    description: 'Interactive canvas halftone wordmark footer with spring pointer response, shock ring, print grain, tracked link columns and back-to-top.',
    tags: ['footer', 'halftone', 'wordmark', 'interactive', 'canvas', 'animated'],
    build: buildHalftoneWordmarkFooter,
  },
];
