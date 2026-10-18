import { describe, expect, it } from 'vitest';
import { HALFTONE_FOOTER_PRESETS } from '../src/editor/halftoneFooterPresets';
import type { EditorNode } from '../src/editor/types';

function walk(nodes: EditorNode[]): EditorNode[] {
  return nodes.flatMap((node) => [node, ...walk(node.children)]);
}

describe('Halftone Wordmark Footer', () => {
  it('registers as an editable Footer block', () => {
    const preset = HALFTONE_FOOTER_PRESETS.find((item) => item.id === 'halftone-wordmark-footer');
    expect(preset).toBeTruthy();
    expect(preset?.category).toBe('Footer');
    const nodes = preset!.build();
    expect(nodes).toHaveLength(1);
    expect(nodes[0].type).toBe('section');
    expect(nodes[0].name).toBe('Halftone Wordmark Footer');
  });

  it('keeps studio copy, links and wordmark as normal editable Nila nodes', () => {
    const all = walk(HALFTONE_FOOTER_PRESETS[0].build());
    expect(all.some((node) => node.name === 'Studio label' && node.type === 'heading')).toBe(true);
    expect(all.some((node) => node.name === 'Studio meta' && node.type === 'paragraph')).toBe(true);
    expect(all.some((node) => node.name === 'Back to top' && node.type === 'link')).toBe(true);
    expect(all.some((node) => node.name === 'Halftone wordmark' && node.type === 'heading')).toBe(true);
  });

  it('uses a dot-print text treatment and responsive cropped stage', () => {
    const all = walk(HALFTONE_FOOTER_PRESETS[0].build());
    const wordmark = all.find((node) => node.name === 'Halftone wordmark');
    const stage = all.find((node) => node.name === 'Halftone wordmark stage');
    expect(String(wordmark?.styles.desktop.background)).toContain('radial-gradient');
    expect(wordmark?.styles.desktop.backgroundClip).toBe('text');
    expect(stage?.styles.desktop.overflow).toBe('hidden');
    expect(stage?.styles.mobile.minHeight).toBeTruthy();
  });
});
