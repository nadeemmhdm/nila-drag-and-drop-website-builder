import type { NilaPageSeo, NilaSiteSeo } from '../core/project';

export function createDefaultPageSeo(name: string): NilaPageSeo {
  return {
    title: name,
    description: '',
    index: true,
    follow: true,
    ogTitle: '',
    ogDescription: '',
    schemaType: 'WebPage',
    primaryTopic: '',
    answerSummary: '',
    entityName: '',
    audience: '',
    keywords: [],
    faqs: [],
    modifiedAt: new Date().toISOString(),
  };
}

export function createDefaultSiteSeo(siteName = 'Untitled Site'): NilaSiteSeo {
  const cleanName = siteName.trim() || 'Untitled Site';
  return {
    siteName: cleanName,
    browserTitle: cleanName,
    baseUrl: '',
    language: 'en',
    defaultDescription: '',
    author: '',
    organizationName: '',
    organizationUrl: '',
    socialProfiles: [],
    llmsSummary: '',
    topics: [],
    robots: { allowIndexing: true, disallow: [] },
    security: {
      contact: '',
      expires: '',
      encryption: '',
      acknowledgements: '',
      policy: '',
      hiring: '',
      preferredLanguages: 'en',
    },
    copyrightText: `© ${new Date().getFullYear()} ${cleanName}. All rights reserved.`,
  };
}
