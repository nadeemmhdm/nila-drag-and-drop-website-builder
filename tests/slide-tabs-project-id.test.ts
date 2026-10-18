import { describe, expect, it } from 'vitest';
import { SLIDE_TAB_PRESETS } from '../src/editor/slideTabsPresets';
import type { EditorNode } from '../src/editor/types';
import { projectDisplayId } from '../src/projects/projectId';

function walk(nodes: EditorNode[]): EditorNode[] {
  return nodes.flatMap((node) => [node, ...walk(node.children)]);
}

describe('Slide Tabs section', () => {
  it('builds an editable responsive navigation section', () => {
    const preset = SLIDE_TAB_PRESETS.find((item) => item.id === 'slide-tabs');
    expect(preset).toBeTruthy();
    const nodes = preset!.build();
    expect(nodes).toHaveLength(1);
    expect(nodes[0].type).toBe('section');
    expect(nodes[0].name).toBe('Slide Tabs');
    const all = walk(nodes);
    expect(all.some((node) => node.props.anchorId === 'slide-tabs')).toBe(true);
    expect(all.some((node) => node.props.anchorId === 'slide-tabs-cursor')).toBe(true);
    const tabs = all.filter((node) => /^slide-tab-\d+$/.test(node.props.anchorId ?? ''));
    expect(tabs).toHaveLength(5);
    expect(tabs.every((node) => node.type === 'link')).toBe(true);
    expect(tabs.map((node) => node.props.text)).toEqual(['Home', 'Pricing', 'Features', 'Docs', 'Blog']);
  });
});

describe('project display IDs', () => {
  it('creates a stable letters-and-numbers code from the persisted workspace id', () => {
    const workspaceId = '123e4567-e89b-12d3-a456-426614174000';
    const first = projectDisplayId(workspaceId);
    const second = projectDisplayId(workspaceId);
    expect(first).toBe(second);
    expect(first).toMatch(/^NILA-[A-Z0-9]{10}$/);
    expect(projectDisplayId('987e6543-e21b-12d3-a456-426614174111')).not.toBe(first);
  });
});
