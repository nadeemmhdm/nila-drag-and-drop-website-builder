import { describe, expect, it } from 'vitest';
import { PROJECT_SCHEMA_VERSION } from '../src/core/constants';
import { DISTINCT_TEMPLATE_PRESETS } from '../src/editor/templateCatalog';
import { createDefaultPageSeo, createDefaultSiteSeo } from '../src/seo/defaults';
import { validateWorkspaceSnapshot } from '../src/security/validation';
import type { WorkspaceSnapshot } from '../src/workspace/types';

const PROJECT_ID = '11111111-1111-4111-8111-111111111111';
const PAGE_ID = '22222222-2222-4222-8222-222222222222';

function snapshotFor(nodes: WorkspaceSnapshot['pages'][number]['nodes'], name: string): WorkspaceSnapshot {
  const now = new Date().toISOString();
  return {
    id: PROJECT_ID,
    ownerFolder: 'local-user',
    name,
    schemaVersion: PROJECT_SCHEMA_VERSION,
    pages: [{
      id: PAGE_ID,
      name: 'Home',
      slug: '/',
      isHome: true,
      nodes,
      seo: createDefaultPageSeo(name),
    }],
    assets: [],
    fonts: [],
    seo: createDefaultSiteSeo(name),
    activePageId: PAGE_ID,
    createdAt: now,
    savedAt: now,
  };
}

describe('project creation', () => {
  it('accepts a blank project snapshot', () => {
    expect(() => validateWorkspaceSnapshot(snapshotFor([], 'Blank Project'))).not.toThrow();
  });

  it('accepts every starting template as a persisted workspace', () => {
    for (const template of DISTINCT_TEMPLATE_PRESETS) {
      const snapshot = snapshotFor(template.build(), template.name);
      expect(() => validateWorkspaceSnapshot(snapshot), `${template.name} must be saveable`).not.toThrow();
    }
  });
});
