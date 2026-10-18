import { describe, expect, it } from 'vitest';
import { DISTINCT_TEMPLATE_PRESETS } from '../src/editor/templateCatalog';
import type { EditorNode } from '../src/editor/types';

function flatten(nodes: EditorNode[]): EditorNode[] {
  return nodes.flatMap((node) => [node, ...flatten(node.children)]);
}

describe('distinct animated templates', () => {
  it('ships unique template ids and unique top-level layout signatures', () => {
    expect(DISTINCT_TEMPLATE_PRESETS.length).toBeGreaterThanOrEqual(15);
    const ids = DISTINCT_TEMPLATE_PRESETS.map((preset) => preset.id);
    expect(new Set(ids).size).toBe(ids.length);
    const signatures = DISTINCT_TEMPLATE_PRESETS.map((preset) => preset.build().map((node) => node.name).join(' > '));
    expect(new Set(signatures).size).toBe(signatures.length);
  });

  it('marks every template as animated and applies scroll + hover motion', () => {
    for (const preset of DISTINCT_TEMPLATE_PRESETS) {
      expect(preset.tags).toContain('animated');
      const nodes = flatten(preset.build());
      expect(nodes.some((node) => String(node.styles.desktop.animationName ?? 'none') !== 'none')).toBe(true);
      expect(nodes.some((node) => node.styles.desktop.animationTimeline === 'view()')).toBe(true);
      expect(nodes.some((node) => typeof node.styles.desktop['--nila-hover-transform'] === 'string')).toBe(true);
    }
  });

  it('keeps Animated Studio visually distinct and motion-heavy', () => {
    const studio = DISTINCT_TEMPLATE_PRESETS.find((preset) => preset.id === 'animated-studio');
    expect(studio).toBeTruthy();
    const nodes = flatten(studio!.build());
    expect(nodes.some((node) => node.name === 'Studio marquee')).toBe(true);
    expect(nodes.some((node) => String(node.styles.desktop.fontSize) === '94px')).toBe(true);
    expect(nodes.some((node) => String(node.styles.desktop.background).includes('#09090b'))).toBe(true);
  });
});
