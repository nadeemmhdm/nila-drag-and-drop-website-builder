import type { EditorNode } from '../editor/types';

export type DeviceViewport = 'mobile' | 'tablet' | 'desktop';
export type AssetKind = 'image' | 'video' | 'font';
export type StructuredDataType = 'WebPage' | 'AboutPage' | 'ContactPage' | 'Article' | 'FAQPage' | 'Product' | 'Service' | 'LocalBusiness';

export interface NilaProjectMeta {
  id: string;
  name: string;
  ownerFolder: string;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface NilaFaq {
  question: string;
  answer: string;
}

export interface NilaPageSeo {
  title: string;
  description: string;
  index: boolean;
  follow: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImageAssetId?: string;
  schemaType: StructuredDataType;
  primaryTopic: string;
  answerSummary: string;
  entityName: string;
  audience: string;
  keywords: string[];
  faqs: NilaFaq[];
  modifiedAt: string;
}

export interface NilaPageMeta {
  id: string;
  name: string;
  slug: string;
  isHome: boolean;
}

export interface NilaPage extends NilaPageMeta {
  nodes: EditorNode[];
  seo: NilaPageSeo;
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

export interface NilaSecurityTxtSettings {
  contact: string;
  expires: string;
  encryption: string;
  acknowledgements: string;
  policy: string;
  hiring: string;
  preferredLanguages: string;
}

export interface NilaRobotsSettings {
  allowIndexing: boolean;
  disallow: string[];
}

export interface NilaSiteSeo {
  siteName: string;
  baseUrl: string;
  language: string;
  defaultDescription: string;
  author: string;
  organizationName: string;
  organizationUrl: string;
  organizationLogoAssetId?: string;
  socialProfiles: string[];
  llmsSummary: string;
  topics: string[];
  robots: NilaRobotsSettings;
  security: NilaSecurityTxtSettings;
}

export interface NilaProject {
  meta: NilaProjectMeta;
  pages: NilaPage[];
  assets: NilaAsset[];
  fonts: NilaFont[];
  seo: NilaSiteSeo;
}
