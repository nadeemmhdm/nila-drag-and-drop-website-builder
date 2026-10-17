import type { NilaAsset, NilaFont, NilaPage, NilaSiteSeo } from '../core/project';

export interface ExportFile {
  path: string;
  content: string | Uint8Array;
  binary?: boolean;
}

export interface ExportProjectInput {
  projectName: string;
  pages: NilaPage[];
  assets: NilaAsset[];
  fonts: NilaFont[];
  seo: NilaSiteSeo;
}

export interface GitHubExportOptions {
  owner: string;
  repo: string;
  branch: string;
  pathPrefix: string;
  token: string;
  commitMessage: string;
}
