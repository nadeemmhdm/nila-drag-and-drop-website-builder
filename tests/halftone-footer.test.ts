import { describe, expect, it } from 'vitest';
import { HALFTONE_FOOTER_PRESETS, HALFTONE_CANVAS_NODE_NAME } from '../src/editor/halftoneFooterPresets';
import { generateProjectFiles } from '../src/exporter/projectGenerator';
import type { EditorNode } from '../src/editor/types';
import { makeWorkspace } from './fixture';

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
    expect(all.some((node) => node.name === 'Back to top ↑ link' && node.type === 'link')).toBe(true);
    const wordmark = all.find((node) => node.name === HALFTONE_CANVAS_NODE_NAME);
    expect(wordmark?.type).toBe('heading');
    expect(wordmark?.props.text).toBe('halden');
    expect(wordmark?.styles.desktop.backgroundColor).toBe('#0c0c0b');
    expect(wordmark?.styles.desktop.color).toBe('#e9e4da');
    expect(wordmark?.styles.desktop.borderColor).toBe('#e9762b');
  });

  it('exports a standalone interactive React canvas component', () => {
    const workspace = makeWorkspace();
    workspace.pages[0].nodes.push(...HALFTONE_FOOTER_PRESETS[0].build());
    const files = generateProjectFiles({ projectName: workspace.name, pages: workspace.pages, assets: workspace.assets, fonts: workspace.fonts, seo: workspace.seo });
    const canvas = files.find((file) => file.path === 'src/components/HalftoneWordmarkCanvas.tsx');
    const pageView = files.find((file) => file.path === 'src/components/PageView.tsx');
    expect(String(canvas?.content)).toContain('ResizeObserver');
    expect(String(canvas?.content)).toContain('pointermove');
    expect(String(pageView?.content)).toContain('Halftone Canvas Wordmark');
    expect(String(pageView?.content)).toContain('HalftoneWordmarkCanvas');
  });
});
