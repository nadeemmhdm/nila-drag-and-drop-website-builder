export type LibraryKind = 'component' | 'block' | 'animated' | 'theme';

export interface VendorFile {
  path: string;
  target: string;
  type: string;
  url: string;
}

export interface VendorItem {
  name: string;
  title: string;
  description: string;
  type: string;
  kind: LibraryKind;
  dependencies: string[];
  registryDependencies: string[];
  files: VendorFile[];
}

export interface VendorManifest {
  source: string;
  revision: string;
  license: string;
  itemCount?: number;
  fileCount?: number;
  items: VendorItem[];
}
