import type { NilaAsset, NilaFont, NilaPage, NilaSiteSeo } from '../core/project';

export interface WorkspaceSnapshot {
  id: string;
  ownerFolder: string;
  name: string;
  schemaVersion: number;
  pages: NilaPage[];
  assets: NilaAsset[];
  fonts: NilaFont[];
  seo: NilaSiteSeo;
  activePageId: string;
  createdAt: string;
  savedAt: string;
}

export interface WorkspaceBackup {
  id: string;
  workspaceId: string;
  savedAt: string;
  snapshot: WorkspaceSnapshot;
}
