import type { NodeStyle } from './types';

export type HorizontalPlacement = 'left' | 'center' | 'right' | 'stretch';

const ITEM_LAYOUT_KEYS = new Set([
  'alignSelf',
  'justifySelf',
  'placeSelf',
  'order',
  'flex',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'gridColumn',
  'gridColumnStart',
  'gridColumnEnd',
  'gridRow',
  'gridRowStart',
  'gridRowEnd',
  'position',
  'inset',
  'top',
  'right',
  'bottom',
  'left',
  'zIndex',
]);

const CHILD_LAYOUT_KEYS = new Set([
  'display',
  'flexDirection',
  'justifyContent',
  'alignItems',
  'alignContent',
  'flexWrap',
  'gridTemplateColumns',
  'gridTemplateRows',
  'gridAutoColumns',
  'gridAutoRows',
  'gridAutoFlow',
  'justifyItems',
  'placeItems',
  'gap',
  'rowGap',
  'columnGap',
]);

export function horizontalPlacementStyles(placement: HorizontalPlacement): NodeStyle {
  if (placement === 'center') return { marginLeft: 'auto', marginRight: 'auto' };
  if (placement === 'right') return { marginLeft: 'auto', marginRight: '0' };
  if (placement === 'stretch') return { marginLeft: '0', marginRight: '0', width: '100%' };
  return { marginLeft: '0', marginRight: 'auto' };
}

export function gridCellStyles(column: number, row: number): NodeStyle {
  const safeColumn = Math.max(1, Math.min(12, Math.round(column)));
  const safeRow = Math.max(1, Math.min(12, Math.round(row)));
  return { gridColumnStart: String(safeColumn), gridRowStart: String(safeRow) };
}

export function splitCanvasStyles(styles: NodeStyle, container = false): { item: NodeStyle; surface: NodeStyle; children: NodeStyle } {
  const item: NodeStyle = {};
  const surface: NodeStyle = {};
  const children: NodeStyle = {};
  for (const [key, value] of Object.entries(styles)) {
    if (ITEM_LAYOUT_KEYS.has(key)) item[key] = value;
    else if (container && CHILD_LAYOUT_KEYS.has(key)) children[key] = value;
    else surface[key] = value;
  }
  return { item, surface, children };
}
