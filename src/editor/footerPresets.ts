import { createNode } from './model';
import type { CatalogPreset } from './catalog';

export const HALFTONE_FOOTER_PRESET: CatalogPreset = {
  id: 'footer-halftone-wordmark',
  kind: 'section',
  name: 'Halftone Wordmark Footer',
  category: 'Footer',
  description: 'Interactive canvas halftone wordmark footer with spring pointer response, link columns, grain and back-to-top.',
  tags: ['footer', 'halftone', 'interactive', 'canvas', 'wordmark', 'animated'],
  build: () => {
    const section = createNode('section');
    const footer = createNode('halftone-footer');
    section.name = 'Halftone Wordmark Footer Section';
    section.styles.desktop = { width: '100%', padding: 0, background: '#0c0c0b', overflow: 'hidden' };
    section.styles.tablet = { padding: 0 };
    section.styles.mobile = { padding: 0 };
    section.children = [footer];
    return [section];
  },
};
