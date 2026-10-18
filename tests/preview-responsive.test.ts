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

  it('removes both editor sidebars and the reserved sidebar grid tracks in preview mode', () => {
    const css = readFileSync('src/styles/ai-inspector-preview.css', 'utf8');
    expect(css).toContain('.left-sidebar');
    expect(css).toContain('.right-sidebar');
    expect(css).toContain('.sidebar-collapse-toggle{display:none!important}');
    expect(css).toContain('grid-template-columns:minmax(0,1fr)!important');
    expect(css).toContain('.workspace-main{grid-column:1!important;min-width:0;width:100%');
    expect(css).not.toContain('grid-template-columns:280px minmax(0,1fr)');
    expect(css).not.toContain('grid-template-columns:250px minmax(0,1fr)');
    expect(css).not.toContain('grid-template-columns:220px minmax(360px,1fr)');
  });

  it('keeps configured navbar links in the editor preview instead of replacing them with the pages list', () => {
    const source = readFileSync('src/editor/components/Canvas.tsx', 'utf8');
    expect(source).toContain('const configured=navbarItems(node)');
    expect(source).toContain('configured.length');
    expect(source).toContain("label:item.props.text?.trim()||item.name");
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
