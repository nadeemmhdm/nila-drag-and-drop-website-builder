import type { NilaAsset, NilaFont, NilaPage, NilaSiteSeo } from '../core/project';

export type WorkspaceId = ReturnType<Crypto['randomUUID']>;

export interface WorkspaceSnapshot {
  id: WorkspaceId;
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
