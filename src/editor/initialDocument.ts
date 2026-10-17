import type { EditorDocument } from './types';
import { createNode } from './model';

export function createInitialDocument(): EditorDocument {
  const section = createNode('section');
  const container = createNode('container');
  const heading = createNode('heading');
  const paragraph = createNode('paragraph');
  const button = createNode('button');
  container.children = [heading, paragraph, button];
  section.children = [container];

  return {
    id: 'home',
    name: 'Home',
    nodes: [section],
    selectedId: heading.id,
    viewport: 'desktop',
    zoom: 100,
  };
}
