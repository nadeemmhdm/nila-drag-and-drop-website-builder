import type { DeviceViewport, NilaPage } from '../core/project';
import { createNode } from './model';

export interface InitialEditorState {
  pages: NilaPage[];
  activePageId: string;
  selectedId: string | null;
  viewport: DeviceViewport;
  zoom: number;
}

export function createInitialEditorState(): InitialEditorState {
  const section = createNode('section');
  const container = createNode('container');
  const heading = createNode('heading');
  const paragraph = createNode('paragraph');
  const button = createNode('button');
  section.props.anchorId = 'home';
  button.props = { ...button.props, linkType: 'page', pageId: 'home' };
  container.children = [heading, paragraph, button];
  section.children = [container];

  const home: NilaPage = {
    id: 'home',
    name: 'Home',
    slug: 'home',
    isHome: true,
    nodes: [section],
  };

  return {
    pages: [home],
    activePageId: home.id,
    selectedId: heading.id,
    viewport: 'desktop',
    zoom: 100,
  };
}
