import type { NilaPage } from '../core/project';
import { createDefaultPageSeo } from '../seo/defaults';
import { cloneNode, createNode } from './model';
import { uniqueSlug } from './linking';

export function createPage(name: string, pages: NilaPage[]): NilaPage {
  const id = crypto.randomUUID();
  const section = createNode('section');
  const container = createNode('container');
  const heading = createNode('heading');
  const paragraph = createNode('paragraph');
  heading.props.text = `${name} page`;
  paragraph.props.text = 'Start building this page by editing these elements or inserting a section.';
  container.children = [heading, paragraph];
  section.children = [container];
  return { id, name, slug: uniqueSlug(name, pages), isHome: false, nodes: [section], seo: createDefaultPageSeo(name) };
}

export function duplicatePage(page: NilaPage, pages: NilaPage[]): NilaPage {
  const id = crypto.randomUUID();
  const name = `${page.name} Copy`;
  return {
    ...page,
    id,
    name,
    slug: uniqueSlug(`${page.slug}-copy`, pages),
    isHome: false,
    nodes: page.nodes.map(cloneNode),
    seo: { ...structuredClone(page.seo), title: page.seo.title ? `${page.seo.title} Copy` : name, modifiedAt: new Date().toISOString() },
  };
}
