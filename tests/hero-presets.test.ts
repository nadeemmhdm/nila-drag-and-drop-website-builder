import { describe, expect, it } from 'vitest';
import { HERO_SECTION_PRESETS } from '../src/editor/heroPresets';
import type { EditorNode } from '../src/editor/types';

function walk(nodes: EditorNode[]): EditorNode[] {
  return nodes.flatMap((node) => [node, ...walk(node.children)]);
}

function preset(name: string) {
  const item = HERO_SECTION_PRESETS.find((entry) => entry.name === name);
  if (!item) throw new Error(`Missing preset: ${name}`);
  return item;
}

describe('custom hero presets', () => {
  it('registers both requested hero blocks as movable sections', () => {
    expect(HERO_SECTION_PRESETS.map((item) => item.name)).toEqual([
      'Tilted Grid Hero',
      'Mascot Portfolio Hero',
    ]);
    for (const item of HERO_SECTION_PRESETS) {
      const roots = item.build();
      expect(roots).toHaveLength(1);
      expect(roots[0].type).toBe('section');
      expect(roots[0].name).toBe(item.name);
      expect(item.tags).toContain('animated');
    }
  });

  it('builds the tilted grid with seven perspective image frames and responsive edge fade', () => {
    const nodes = walk(preset('Tilted Grid Hero').build());
    const images = nodes.filter((node) => node.type === 'image');
    expect(images).toHaveLength(7);
    expect(images.every((node) => node.props.src?.startsWith('https://images.unsplash.com/'))).toBe(true);
    expect(images.every((node) => String(node.styles.desktop.transform ?? '').includes('rotateY'))).toBe(true);
    expect(images.every((node) => node.styles.desktop.animationName === 'nila-pulse')).toBe(true);
    const band = nodes.find((node) => node.name === 'Curved image band');
    expect(String(band?.styles.desktop.maskImage ?? '')).toContain('linear-gradient');
    expect(band?.styles.mobile.width).toBe('264%');
  });

  it('builds the mascot portfolio hero entirely from editable Nila nodes', () => {
    const nodes = walk(preset('Mascot Portfolio Hero').build());
    expect(nodes.some((node) => node.props.text === 'PORTFOLIO')).toBe(true);
    expect(nodes.some((node) => node.props.text === 'WORK S*')).toBe(true);
    expect(nodes.some((node) => node.name === 'Portfolio mascot')).toBe(true);
    expect(nodes.some((node) => node.name === 'Mascot face')).toBe(true);
    expect(nodes.some((node) => node.name === 'Mascot beanie')).toBe(true);
    expect(nodes.some((node) => node.name === 'Mascot smile')).toBe(true);
    expect(nodes.some((node) => node.type === 'image' || node.type === 'video')).toBe(false);
    const mascot = nodes.find((node) => node.name === 'Portfolio mascot');
    expect(mascot?.styles.desktop.animationName).toBe('nila-pulse');
    expect(mascot?.styles.mobile.position).toBe('relative');
  });
});
