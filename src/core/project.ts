import type { EditorNode } from '../editor/types';

export type DeviceViewport = 'mobile' | 'tablet' | 'desktop';

export interface NilaProjectMeta {
  id: string;
  name: string;
  ownerFolder: string;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface NilaPageMeta {
  id: string;
  name: string;
  slug: string;
  isHome: boolean;
}

export interface NilaPage extends NilaPageMeta {
  nodes: EditorNode[];
}

export interface NilaProject {
  meta: NilaProjectMeta;
  pages: NilaPage[];
}
