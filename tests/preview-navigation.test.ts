import { describe, expect, it } from 'vitest';
import { SECTION_PRESETS } from '../src/editor/catalog';
import { generatePreviewDocument } from '../src/exporter/preview';
import { createDefaultPageSeo } from '../src/seo/defaults';
import { makeWorkspace } from './fixture';

describe('sandbox preview navigation', () => {
  it('renders page-aware hamburger navigation for semantic navbar sections', () => {
    const workspace = makeWorkspace();
    workspace.pages[0].nodes = SECTION_PRESETS.find((preset) => preset.id === 'navbar-clean')!.build();
    workspace.pages.push({ id:'about', name:'About', slug:'about', isHome:false, nodes:SECTION_PRESETS.find((preset)=>preset.id==='hero-split')!.build(), seo:createDefaultPageSeo('About') });
    const html = generatePreviewDocument({ projectName:workspace.name, pages:workspace.pages, assets:[], fonts:[], seo:workspace.seo }, workspace.pages[0].id);
    expect(html).toContain('preview-nav-toggle');
    expect(html).toContain('preview-nav-links');
    expect(html).toContain('About');
    expect(html).toContain('@media(max-width:900px)');
    expect(html).toContain("nav.classList.toggle('open')");
  });
});
