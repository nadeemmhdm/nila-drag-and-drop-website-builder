import { describe, expect, it } from 'vitest';
import { gridCellStyles, horizontalPlacementStyles, splitCanvasStyles } from '../src/editor/placement';

describe('editor placement helpers', () => {
  it('builds simple horizontal placement styles', () => {
    expect(horizontalPlacementStyles('left')).toEqual({ marginLeft: '0', marginRight: 'auto' });
    expect(horizontalPlacementStyles('center')).toEqual({ marginLeft: 'auto', marginRight: 'auto' });
    expect(horizontalPlacementStyles('right')).toEqual({ marginLeft: 'auto', marginRight: '0' });
    expect(horizontalPlacementStyles('stretch')).toEqual({ marginLeft: '0', marginRight: '0', width: '100%' });
  });

  it('maps and clamps grid cells', () => {
    expect(gridCellStyles(3, 2)).toEqual({ gridColumnStart: '3', gridRowStart: '2' });
    expect(gridCellStyles(99, -4)).toEqual({ gridColumnStart: '12', gridRowStart: '1' });
  });

  it('separates item, container-child and visual surface styles', () => {
    expect(splitCanvasStyles({
      position: 'absolute',
      gridColumnStart: '2',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
      padding: '24px',
      background: '#fff',
    }, true)).toEqual({
      item: { position: 'absolute', gridColumnStart: '2' },
      children: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' },
      surface: { padding: '24px', background: '#fff' },
    });
  });

  it('keeps display on the surface for non-container elements', () => {
    expect(splitCanvasStyles({ display: 'inline-flex', color: '#111827' }, false)).toEqual({
      item: {},
      children: {},
      surface: { display: 'inline-flex', color: '#111827' },
    });
  });
});
