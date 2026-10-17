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

export function createDefaultSiteSeo(): NilaSiteSeo {
  return {
    siteName: 'Untitled Site',
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
  };
}
