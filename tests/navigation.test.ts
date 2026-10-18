import { describe, expect, it } from 'vitest';
import { SECTION_PRESETS } from '../src/editor/catalog';
import { isNavbarNode, navbarBrand, pageHasNavbar } from '../src/editor/navigation';

const navbar = () => SECTION_PRESETS.find((preset) => preset.id === 'navbar-clean')!.build()[0];

describe('navigation helpers', () => {
  it('recognizes catalog navbar sections and reads their brand', () => {
    const node = navbar();
    expect(isNavbarNode(node)).toBe(true);
    expect(pageHasNavbar([node])).toBe(true);
    expect(navbarBrand(node)).toBe('Nila');
  });

  it('does not classify ordinary sections as navigation', () => {
    const node = SECTION_PRESETS.find((preset) => preset.id === 'hero-split')!.build()[0];
    expect(isNavbarNode(node)).toBe(false);
    expect(pageHasNavbar([node])).toBe(false);
  });
});
