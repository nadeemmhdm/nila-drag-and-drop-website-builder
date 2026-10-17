import { describe, expect, it } from 'vitest';
import { createNode, isContainerNode } from '../src/editor/model';
import { resolvedResponsiveStyles } from '../src/editor/responsive';
import { getStyleGroupsForNode } from '../src/editor/styleControls';
import type { EditorNodeType } from '../src/editor/types';

const allTypes: EditorNodeType[] = [
  'section','container','div','row','columns','grid','card','heading','paragraph','link','button','badge','icon','image','avatar','video','quote','list','divider','spacer','input','textarea','select','checkbox',
];

describe('responsive editor defaults', () => {
  it('keeps width and height controls available for every element type', () => {
    for (const type of allTypes) {
      const properties = getStyleGroupsForNode(type).flatMap((group) => group.controls.map((control) => control.property));
      expect(properties, `${type} is missing width`).toContain('width');
      expect(properties, `${type} is missing height`).toContain('height');
    }
  });

  it('supports nestable div containers', () => {
    const div = createNode('div');
    expect(isContainerNode(div)).toBe(true);
    expect(div.styles.desktop.width).toBe('100%');
  });

  it('prevents legacy small headings from growing on mobile', () => {
    const heading = createNode('heading');
    heading.styles.desktop.fontSize = '22px';
    const resolved = resolvedResponsiveStyles(heading);
    expect(resolved.tablet.fontSize).toBe('22px');
    expect(resolved.mobile.fontSize).toBe('22px');
  });

  it('makes navbar rows mobile friendly', () => {
    const navRow = createNode('container');
    navRow.name = 'Nav row';
    navRow.styles.desktop.flexDirection = 'row';
    const resolved = resolvedResponsiveStyles(navRow);
    expect(resolved.mobile.flexDirection).toBe('column');
    expect(resolved.mobile.alignItems).toBe('stretch');
    expect(resolved.mobile.width).toBe('100%');
  });

  it('stacks footer content on mobile', () => {
    const footer = createNode('container');
    footer.name = 'Footer content';
    footer.styles.desktop.display = 'grid';
    footer.styles.desktop.gridTemplateColumns = '2fr 1fr 1fr';
    const resolved = resolvedResponsiveStyles(footer);
    expect(resolved.mobile.gridTemplateColumns).toBe('minmax(0, 1fr)');
  });

  it('resets desktop grid spans on phones', () => {
    const card = createNode('card');
    card.styles.desktop.gridColumn = 'span 2';
    const resolved = resolvedResponsiveStyles(card);
    expect(resolved.mobile.gridColumn).toBe('auto');
  });
});
