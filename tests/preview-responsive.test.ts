import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { EXTRA_SECTION_PRESETS } from '../src/editor/catalogExtras';
import type { EditorNode } from '../src/editor/types';

function walk(nodes: EditorNode[]): EditorNode[] {
  return nodes.flatMap((node) => [node, ...walk(node.children)]);
}

describe('responsive editor preview', () => {
  it('keeps explicit desktop, tablet and mobile preview viewport classes', () => {
    const source = readFileSync('src/editor/components/Canvas.tsx', 'utf8');
    expect(source).toContain('preview-${viewport}');
    expect(source).toContain("viewport==='desktop'?'100%':`${width}px`");
    expect(source).toContain("maxWidth:'100%'");
  });

  it('keeps Glass Motion Hero content editable as native Nila nodes', () => {
    const preset = EXTRA_SECTION_PRESETS.find((item) => item.id === 'animated-glass-hero');
    expect(preset).toBeTruthy();
    const nodes = walk(preset!.build());
    expect(nodes.some((node) => node.type === 'heading' && /polished hero/i.test(node.props.text ?? ''))).toBe(true);
    expect(nodes.filter((node) => node.type === 'button').length).toBeGreaterThanOrEqual(2);
    expect(nodes.every((node) => node.locked !== true)).toBe(true);
  });
});
