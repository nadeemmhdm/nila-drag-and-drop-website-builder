import type { EditorNode } from '../editor/types';

export type DeviceViewport = 'mobile' | 'tablet' | 'desktop';
export type AssetKind = 'image' | 'video' | 'font';

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

export interface NilaAsset {
  id: string;
  name: string;
  fileName: string;
  kind: AssetKind;
  mimeType: string;
  size: number;
  dataUrl: string;
  projectPath: string;
  createdAt: string;
}

export interface NilaFont {
  id: string;
  family: string;
  assetId: string;
  weight: string;
  style: 'normal' | 'italic';
  format: 'woff2' | 'woff' | 'truetype' | 'opentype';
}

export interface NilaProject {
  meta: NilaProjectMeta;
  pages: NilaPage[];
  assets: NilaAsset[];
  fonts: NilaFont[];
}
