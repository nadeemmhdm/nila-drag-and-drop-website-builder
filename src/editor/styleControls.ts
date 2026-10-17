export type StyleControlType = 'text' | 'select' | 'color';

export interface StyleControl {
  property: string;
  label: string;
  type?: StyleControlType;
  placeholder?: string;
  options?: string[];
}

export interface StyleControlGroup {
  id: string;
  label: string;
  controls: StyleControl[];
}

export const STYLE_GROUPS: StyleControlGroup[] = [
  {
    id: 'layout',
    label: 'Layout & size',
    controls: [
      { property: 'display', label: 'Display', type: 'select', options: ['', 'block', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid', 'none'] },
      { property: 'width', label: 'Width', placeholder: '100% / 320px / auto' },
      { property: 'maxWidth', label: 'Max width', placeholder: '1120px' },
      { property: 'minWidth', label: 'Min width', placeholder: '0 / 240px' },
      { property: 'height', label: 'Height', placeholder: 'auto / 320px' },
      { property: 'minHeight', label: 'Min height', placeholder: '220px' },
      { property: 'maxHeight', label: 'Max height', placeholder: 'none / 640px' },
      { property: 'overflow', label: 'Overflow', type: 'select', options: ['', 'visible', 'hidden', 'auto', 'scroll', 'clip'] },
    ],
  },
  {
    id: 'flex-grid',
    label: 'Flex & grid',
    controls: [
      { property: 'flexDirection', label: 'Direction', type: 'select', options: ['', 'row', 'row-reverse', 'column', 'column-reverse'] },
      { property: 'justifyContent', label: 'Justify', type: 'select', options: ['', 'flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'] },
      { property: 'alignItems', label: 'Align items', type: 'select', options: ['', 'stretch', 'flex-start', 'center', 'flex-end', 'baseline'] },
      { property: 'flexWrap', label: 'Wrap', type: 'select', options: ['', 'nowrap', 'wrap', 'wrap-reverse'] },
      { property: 'gridTemplateColumns', label: 'Grid columns', placeholder: 'repeat(3, 1fr)' },
      { property: 'gridTemplateRows', label: 'Grid rows', placeholder: 'auto / repeat(2,1fr)' },
      { property: 'gap', label: 'Gap', placeholder: '16px' },
      { property: 'rowGap', label: 'Row gap', placeholder: '16px' },
      { property: 'columnGap', label: 'Column gap', placeholder: '16px' },
    ],
  },
  {
    id: 'spacing',
    label: 'Spacing',
    controls: [
      { property: 'margin', label: 'Margin', placeholder: '0 auto / 16px' },
      { property: 'marginTop', label: 'Margin top', placeholder: '16px' },
      { property: 'marginRight', label: 'Margin right', placeholder: '16px' },
      { property: 'marginBottom', label: 'Margin bottom', placeholder: '16px' },
      { property: 'marginLeft', label: 'Margin left', placeholder: '16px' },
      { property: 'padding', label: 'Padding', placeholder: '24px / 24px 32px' },
      { property: 'paddingTop', label: 'Padding top', placeholder: '24px' },
      { property: 'paddingRight', label: 'Padding right', placeholder: '24px' },
      { property: 'paddingBottom', label: 'Padding bottom', placeholder: '24px' },
      { property: 'paddingLeft', label: 'Padding left', placeholder: '24px' },
    ],
  },
  {
    id: 'typography',
    label: 'Typography',
    controls: [
      { property: 'fontFamily', label: 'Font family', placeholder: 'Inter, sans-serif' },
      { property: 'fontSize', label: 'Font size', placeholder: '16px / 1rem' },
      { property: 'fontWeight', label: 'Weight', type: 'select', options: ['', '300', '400', '500', '600', '700', '800', '900'] },
      { property: 'lineHeight', label: 'Line height', placeholder: '1.5 / 24px' },
      { property: 'letterSpacing', label: 'Letter spacing', placeholder: '0 / .02em' },
      { property: 'textAlign', label: 'Text align', type: 'select', options: ['', 'left', 'center', 'right', 'justify'] },
      { property: 'textTransform', label: 'Transform', type: 'select', options: ['', 'none', 'uppercase', 'lowercase', 'capitalize'] },
      { property: 'color', label: 'Text color', type: 'color', placeholder: '#111827' },
    ],
  },
  {
    id: 'appearance',
    label: 'Background & border',
    controls: [
      { property: 'background', label: 'Background', placeholder: '#fff / linear-gradient(...)' },
      { property: 'border', label: 'Border', placeholder: '1px solid #e5e7eb' },
      { property: 'borderWidth', label: 'Border width', placeholder: '1px' },
      { property: 'borderStyle', label: 'Border style', type: 'select', options: ['', 'none', 'solid', 'dashed', 'dotted', 'double'] },
      { property: 'borderColor', label: 'Border color', type: 'color', placeholder: '#e5e7eb' },
      { property: 'borderRadius', label: 'Radius', placeholder: '12px / 999px' },
      { property: 'boxShadow', label: 'Shadow', placeholder: '0 12px 32px rgba(...)' },
      { property: 'opacity', label: 'Opacity', placeholder: '1 / .8' },
      { property: 'filter', label: 'Filter', placeholder: 'blur(2px) / grayscale(1)' },
    ],
  },
  {
    id: 'position',
    label: 'Position',
    controls: [
      { property: 'position', label: 'Position', type: 'select', options: ['', 'static', 'relative', 'absolute', 'fixed', 'sticky'] },
      { property: 'top', label: 'Top', placeholder: '0 / 20px' },
      { property: 'right', label: 'Right', placeholder: '0 / 20px' },
      { property: 'bottom', label: 'Bottom', placeholder: '0 / 20px' },
      { property: 'left', label: 'Left', placeholder: '0 / 20px' },
      { property: 'zIndex', label: 'Z-index', placeholder: '10' },
    ],
  },
  {
    id: 'effects',
    label: 'Transform & transition',
    controls: [
      { property: 'transform', label: 'Transform', placeholder: 'translateY(-4px) scale(1.02)' },
      { property: 'transformOrigin', label: 'Origin', placeholder: 'center / top left' },
      { property: 'transition', label: 'Transition', placeholder: 'all 200ms ease' },
    ],
  },
];

export const ANIMATION_PRESETS = [
  { id: 'none', label: 'None', styles: { animationName: 'none' } },
  { id: 'fade-in', label: 'Fade in', styles: { animationName: 'nila-fade-in', animationDuration: '600ms', animationTimingFunction: 'ease-out', animationFillMode: 'both' } },
  { id: 'slide-up', label: 'Slide up', styles: { animationName: 'nila-slide-up', animationDuration: '650ms', animationTimingFunction: 'cubic-bezier(.2,.8,.2,1)', animationFillMode: 'both' } },
  { id: 'slide-left', label: 'Slide left', styles: { animationName: 'nila-slide-left', animationDuration: '650ms', animationTimingFunction: 'cubic-bezier(.2,.8,.2,1)', animationFillMode: 'both' } },
  { id: 'scale-in', label: 'Scale in', styles: { animationName: 'nila-scale-in', animationDuration: '500ms', animationTimingFunction: 'ease-out', animationFillMode: 'both' } },
  { id: 'pulse', label: 'Pulse', styles: { animationName: 'nila-pulse', animationDuration: '1800ms', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' } },
] as const;
