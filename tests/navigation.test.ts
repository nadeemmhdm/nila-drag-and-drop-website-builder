import { describe, expect, it } from 'vitest';
import { SECTION_PRESETS } from '../src/editor/catalog';
import { isNavbarNode, navbarBrand, navbarItems, pageHasNavbar } from '../src/editor/navigation';

const navbar = () => SECTION_PRESETS.find((preset) => preset.id === 'navbar-clean')!.build()[0];

describe('navigation helpers', () => {
  it('recognizes catalog navbar sections, reads their brand and preserves configured links', () => {
    const node = navbar();
    expect(isNavbarNode(node)).toBe(true);
    expect(pageHasNavbar([node])).toBe(true);
    expect(navbarBrand(node)).toBe('Nila');
    expect(navbarItems(node).map((item) => item.props.text)).toEqual(['Features', 'Pricing', 'Contact', 'Get started']);
  });

  it('does not classify ordinary sections as navigation', () => {
    const node = SECTION_PRESETS.find((preset) => preset.id === 'hero-split')!.build()[0];
    expect(isNavbarNode(node)).toBe(false);
    expect(pageHasNavbar([node])).toBe(false);
  });
});
