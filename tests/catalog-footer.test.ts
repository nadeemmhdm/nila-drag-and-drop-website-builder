import { describe, expect, it } from 'vitest';
import { TEMPLATE_PRESETS } from '../src/editor/catalog';
import type { EditorNode } from '../src/editor/types';

function walk(nodes: EditorNode[]): EditorNode[] {
  return nodes.flatMap((node) => [node, ...walk(node.children)]);
}

describe('template catalog footer contract', () => {
  it('includes a footer and copyright message in every template', () => {
    for (const template of TEMPLATE_PRESETS) {
      const nodes = template.build();
      const all = walk(nodes);
      expect(all.some((node) => node.name === 'Footer'), `${template.name} is missing a Footer`).toBe(true);
      expect(all.some((node) => typeof node.props.text === 'string' && /all rights reserved/i.test(node.props.text)), `${template.name} is missing copyright copy`).toBe(true);
    }
  });

  it('keeps template sections as root-level blocks for reordering', () => {
    for (const template of TEMPLATE_PRESETS) {
      const nodes = template.build();
      expect(nodes.length, `${template.name} should have root sections`).toBeGreaterThan(1);
      expect(nodes.every((node) => node.type === 'section'), `${template.name} roots should remain movable sections`).toBe(true);
    }
  });
});
