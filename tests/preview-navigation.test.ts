import { describe, expect, it } from 'vitest';
import { SECTION_PRESETS } from '../src/editor/catalog';
import type { EditorNode } from '../src/editor/types';
import { generatePreviewDocument } from '../src/exporter/preview';
import { createDefaultPageSeo } from '../src/seo/defaults';
import { makeWorkspace } from './fixture';

function withoutNavLinks(node: EditorNode): EditorNode {
  return {
    ...node,
    children: node.children
      .filter((child) => child.type !== 'link' && child.type !== 'button')
      .map(withoutNavLinks),
  };
}

describe('sandbox preview navigation', () => {
  it('renders the navbar links configured in the section even when the project has one page', () => {
    const workspace = makeWorkspace();
    workspace.pages[0].nodes = SECTION_PRESETS.find((preset) => preset.id === 'navbar-clean')!.build();
    const html = generatePreviewDocument({ projectName:workspace.name, pages:workspace.pages, assets:[], fonts:[], seo:workspace.seo }, workspace.pages[0].id);
    expect(html).toContain('preview-nav-toggle');
    expect(html).toContain('preview-nav-links');
    expect(html).toContain('Features');
    expect(html).toContain('Pricing');
    expect(html).toContain('Contact');
    expect(html).toContain('Get started');
    expect(html).toContain('@media(max-width:900px)');
    expect(html).toContain("nav.classList.toggle('open')");
  });

  it('falls back to project pages when a semantic navbar has no configured links', () => {
    const workspace = makeWorkspace();
    const navbar = SECTION_PRESETS.find((preset) => preset.id === 'navbar-clean')!.build()[0];
    workspace.pages[0].nodes = [withoutNavLinks(navbar)];
    workspace.pages.push({ id:'about', name:'About', slug:'about', isHome:false, nodes:[], seo:createDefaultPageSeo('About') });
    const html = generatePreviewDocument({ projectName:workspace.name, pages:workspace.pages, assets:[], fonts:[], seo:workspace.seo }, workspace.pages[0].id);
    expect(html).toContain('About');
    expect(html).toContain('data-nav-page="about"');
  });
});
