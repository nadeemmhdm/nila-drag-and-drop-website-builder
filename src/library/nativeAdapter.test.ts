import { describe, expect, it } from 'vitest';
import { createDefaultPageSeo } from '../seo/defaults';
import { createNode } from '../editor/model';
import { SYSTEM_FONT_STACKS } from '../editor/styleControls';
import { applyNativeVendorTheme, buildNativeVendorNodes, createNativeVendorTheme } from './nativeAdapter';
import type { VendorItem } from './vendorTypes';

const item = (patch: Partial<VendorItem>): VendorItem => ({
  name: 'demo-button',
  title: 'Demo Button',
  description: 'A reusable button.',
  type: 'registry:ui',
  kind: 'component',
  dependencies: [],
  registryDependencies: [],
  files: [],
  ...patch,
});

describe('native offline UI adapter', () => {
  it('converts a component registry item into editable Nila nodes', () => {
    const nodes = buildNativeVendorNodes(item({ name: 'gradient-button', title: 'Gradient Button' }));
    expect(nodes).toHaveLength(1);
    expect(nodes[0].type).toBe('button');
    expect(nodes[0].props.text).toBe('Gradient Button');
  });

  it('wraps block items as responsive editor sections', () => {
    const nodes = buildNativeVendorNodes(item({ name: 'marketing-hero', title: 'Marketing Hero', kind: 'block', type: 'registry:block' }));
    expect(nodes[0].type).toBe('section');
    expect(nodes[0].children.length).toBeGreaterThan(0);
  });

  it('reads common shadcn theme variables and applies them to native nodes', () => {
    const themeItem = item({ name: 'theme-demo', title: 'Demo Theme', kind: 'theme', type: 'registry:theme' });
    const source = `:root{--background:0 0% 100%;--foreground:222.2 47.4% 11.2%;--primary:221.2 83.2% 53.3%;--primary-foreground:210 40% 98%;--card:0 0% 100%;--card-foreground:222.2 47.4% 11.2%;--border:214.3 31.8% 91.4%;--input:214.3 31.8% 91.4%;--radius:0.75rem;}`;
    const theme = createNativeVendorTheme(themeItem, source);
    expect(theme.primary).toBe('hsl(221.2 83.2% 53.3%)');
    expect(theme.radius).toBe('0.75rem');

    const button = createNode('button');
    const card = createNode('card');
    const pages = [{ id: 'home', name: 'Home', slug: '/', isHome: true, seo: createDefaultPageSeo('Home'), nodes: [button, card] }];
    const themed = applyNativeVendorTheme(pages, theme);
    expect(themed[0].nodes[0].styles.desktop.background).toBe(theme.primary);
    expect(themed[0].nodes[1].styles.desktop.borderRadius).toBe('0.75rem');
  });
});

describe('font selector', () => {
  it('contains offline-safe system font stacks', () => {
    expect(SYSTEM_FONT_STACKS.some((value) => value.includes('system-ui'))).toBe(true);
    expect(SYSTEM_FONT_STACKS.some((value) => value.includes('Arial'))).toBe(true);
    expect(SYSTEM_FONT_STACKS.some((value) => value.includes('Georgia'))).toBe(true);
  });
});
