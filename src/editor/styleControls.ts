import type { EditorNodeType } from './types';

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
    id: 'layout', label: 'Size', controls: [
      { property: 'display', label: 'Display', type: 'select', options: ['', 'block', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid', 'none'] },
      { property: 'width', label: 'Width', placeholder: '100% / 320px / auto' },
      { property: 'maxWidth', label: 'Max width', placeholder: '1120px' },
      { property: 'minWidth', label: 'Min width', placeholder: '0 / 240px' },
      { property: 'height', label: 'Height', placeholder: 'auto / 320px' },
      { property: 'minHeight', label: 'Min height', placeholder: '220px' },
      { property: 'maxHeight', label: 'Max height', placeholder: 'none / 640px' },
      { property: 'aspectRatio', label: 'Aspect ratio', placeholder: '16 / 9' },
      { property: 'objectFit', label: 'Media fit', type: 'select', options: ['', 'cover', 'contain', 'fill', 'scale-down', 'none'] },
      { property: 'overflow', label: 'Overflow', type: 'select', options: ['', 'visible', 'hidden', 'auto', 'scroll', 'clip'] },
    ],
  },
  {
    id: 'flex-grid', label: 'Layout', controls: [
      { property: 'flexDirection', label: 'Direction', type: 'select', options: ['', 'row', 'row-reverse', 'column', 'column-reverse'] },
      { property: 'justifyContent', label: 'Justify children', type: 'select', options: ['', 'flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'] },
      { property: 'alignItems', label: 'Align children', type: 'select', options: ['', 'stretch', 'flex-start', 'center', 'flex-end', 'baseline'] },
      { property: 'flexWrap', label: 'Wrap', type: 'select', options: ['', 'nowrap', 'wrap', 'wrap-reverse'] },
      { property: 'justifySelf', label: 'Item horizontal', type: 'select', options: ['', 'auto', 'start', 'center', 'end', 'stretch'] },
      { property: 'alignSelf', label: 'Item vertical', type: 'select', options: ['', 'auto', 'start', 'center', 'end', 'stretch'] },
      { property: 'order', label: 'Order', placeholder: '0 / 1 / 2' },
      { property: 'gridTemplateColumns', label: 'Grid columns', placeholder: 'repeat(3, 1fr)' },
      { property: 'gridTemplateRows', label: 'Grid rows', placeholder: 'auto / repeat(2,1fr)' },
      { property: 'gridColumnStart', label: 'Item column', placeholder: '1' },
      { property: 'gridRowStart', label: 'Item row', placeholder: '1' },
      { property: 'gap', label: 'Gap', placeholder: '16px' },
      { property: 'rowGap', label: 'Row gap', placeholder: '16px' },
      { property: 'columnGap', label: 'Column gap', placeholder: '16px' },
    ],
  },
  {
    id: 'spacing', label: 'Spacing', controls: [
      { property: 'margin', label: 'Margin', placeholder: '0 auto / 16px' },
      { property: 'marginTop', label: 'Margin top', placeholder: '16px' },
      { property: 'marginRight', label: 'Margin right', placeholder: '16px' },
      { property: 'marginBottom', label: 'Margin bottom', placeholder: '16px' },
      { property: 'marginLeft', label: 'Margin left', placeholder: '16px' },
      { property: 'padding', label: 'Padding', placeholder: '12px 18px' },
      { property: 'paddingTop', label: 'Padding top', placeholder: '12px' },
      { property: 'paddingRight', label: 'Padding right', placeholder: '18px' },
      { property: 'paddingBottom', label: 'Padding bottom', placeholder: '12px' },
      { property: 'paddingLeft', label: 'Padding left', placeholder: '18px' },
    ],
  },
  {
    id: 'typography', label: 'Typography', controls: [
      { property: 'fontFamily', label: 'Font family', placeholder: 'Inter, sans-serif' },
      { property: 'fontSize', label: 'Text size', placeholder: '16px / 1rem' },
      { property: 'fontWeight', label: 'Weight', type: 'select', options: ['', '300', '400', '500', '600', '700', '800', '900'] },
      { property: 'lineHeight', label: 'Line height', placeholder: '1.5 / 24px' },
      { property: 'letterSpacing', label: 'Letter spacing', placeholder: '0 / .02em' },
      { property: 'textAlign', label: 'Text align', type: 'select', options: ['', 'left', 'center', 'right', 'justify'] },
      { property: 'textTransform', label: 'Case', type: 'select', options: ['', 'none', 'uppercase', 'lowercase', 'capitalize'] },
      { property: 'color', label: 'Text color', type: 'color', placeholder: '#111827' },
    ],
  },
  {
    id: 'appearance', label: 'Appearance', controls: [
      { property: 'backgroundColor', label: 'Background color', type: 'color', placeholder: '#ffffff' },
      { property: 'background', label: 'Background / gradient', placeholder: '#fff / linear-gradient(...)' },
      { property: 'border', label: 'Border', placeholder: '1px solid #e5e7eb' },
      { property: 'borderWidth', label: 'Border width', placeholder: '1px' },
      { property: 'borderStyle', label: 'Border style', type: 'select', options: ['', 'none', 'solid', 'dashed', 'dotted', 'double'] },
      { property: 'borderColor', label: 'Border color', type: 'color', placeholder: '#e5e7eb' },
      { property: 'borderRadius', label: 'Radius', placeholder: '12px / 999px' },
      { property: 'boxShadow', label: 'Shadow', placeholder: '0 12px 32px rgba(...)' },
      { property: 'opacity', label: 'Opacity', placeholder: '1 / .8' },
      { property: 'filter', label: 'Filter', placeholder: 'grayscale(1)' },
    ],
  },
  {
    id: 'position', label: 'Position', controls: [
      { property: 'position', label: 'Position', type: 'select', options: ['', 'static', 'relative', 'absolute', 'fixed', 'sticky'] },
      { property: 'top', label: 'Top', placeholder: '0 / 20px' },
      { property: 'right', label: 'Right', placeholder: '0 / 20px' },
      { property: 'bottom', label: 'Bottom', placeholder: '0 / 20px' },
      { property: 'left', label: 'Left', placeholder: '0 / 20px' },
      { property: 'zIndex', label: 'Z-index', placeholder: '10' },
    ],
  },
  {
    id: 'effects', label: 'Motion & effects', controls: [
      { property: 'transform', label: 'Transform', placeholder: 'translateY(-4px) scale(1.02)' },
      { property: 'transformOrigin', label: 'Origin', placeholder: 'center / top left' },
      { property: 'transition', label: 'Transition', placeholder: 'all 200ms ease' },
    ],
  },
];

const controlsByGroup = Object.fromEntries(STYLE_GROUPS.map((group) => [group.id, group])) as Record<string, StyleControlGroup>;
const pick = (groupId: string, properties: string[]) => ({ ...controlsByGroup[groupId], controls: controlsByGroup[groupId].controls.filter((control) => properties.includes(control.property)) });
const TEXT_TYPES: EditorNodeType[] = ['heading', 'paragraph', 'link', 'button', 'badge', 'quote', 'list'];
const CONTAINER_TYPES: EditorNodeType[] = ['section', 'container', 'div', 'row', 'columns', 'grid', 'card'];
const FORM_TYPES: EditorNodeType[] = ['input', 'textarea', 'select', 'checkbox'];
const MEDIA_TYPES: EditorNodeType[] = ['image', 'avatar', 'video'];

export function getStyleGroupsForNode(type: EditorNodeType): StyleControlGroup[] {
  if (CONTAINER_TYPES.includes(type)) return [
    pick('layout', ['display', 'width', 'maxWidth', 'minWidth', 'height', 'minHeight', 'maxHeight', 'overflow']),
    pick('flex-grid', ['flexDirection', 'justifyContent', 'alignItems', 'flexWrap', 'gridTemplateColumns', 'gridTemplateRows', 'gap', 'rowGap', 'columnGap']),
    controlsByGroup.spacing,
    pick('appearance', ['backgroundColor', 'background', 'border', 'borderWidth', 'borderStyle', 'borderColor', 'borderRadius', 'boxShadow', 'opacity']),
    controlsByGroup.position,
    controlsByGroup.effects,
  ];
  if (TEXT_TYPES.includes(type)) return [
    pick('typography', ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textAlign', 'textTransform', 'color']),
    pick('layout', ['width', 'maxWidth', 'minWidth', 'height', 'minHeight']),
    controlsByGroup.spacing,
    pick('appearance', ['backgroundColor', 'border', 'borderWidth', 'borderStyle', 'borderColor', 'borderRadius', 'boxShadow', 'opacity']),
    controlsByGroup.position,
    controlsByGroup.effects,
  ];
  if (MEDIA_TYPES.includes(type)) return [
    pick('layout', ['width', 'maxWidth', 'minWidth', 'height', 'minHeight', 'maxHeight', 'aspectRatio', 'objectFit', 'overflow']),
    controlsByGroup.spacing,
    pick('appearance', ['backgroundColor', 'border', 'borderWidth', 'borderStyle', 'borderColor', 'borderRadius', 'boxShadow', 'opacity', 'filter']),
    controlsByGroup.position,
    controlsByGroup.effects,
  ];
  if (FORM_TYPES.includes(type)) return [
    pick('layout', ['width', 'maxWidth', 'minWidth', 'height', 'minHeight']),
    pick('typography', ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'textAlign', 'color']),
    controlsByGroup.spacing,
    pick('appearance', ['backgroundColor', 'border', 'borderWidth', 'borderStyle', 'borderColor', 'borderRadius', 'boxShadow', 'opacity']),
    controlsByGroup.position,
  ];
  if (type === 'icon') return [
    pick('layout', ['width', 'height']),
    pick('typography', ['fontSize', 'color']),
    controlsByGroup.spacing,
    pick('appearance', ['backgroundColor', 'border', 'borderColor', 'borderRadius', 'boxShadow', 'opacity']),
    controlsByGroup.position,
    controlsByGroup.effects,
  ];
  if (type === 'divider') return [
    pick('layout', ['width', 'maxWidth', 'height']),
    controlsByGroup.spacing,
    pick('appearance', ['backgroundColor', 'background', 'opacity']),
  ];
  if (type === 'spacer') return [pick('layout', ['width', 'height', 'minHeight']), controlsByGroup.spacing];
  return STYLE_GROUPS;
}

export function supportsAnimation(type: EditorNodeType) {
  return !['spacer', 'divider'].includes(type);
}

export const ANIMATION_PRESETS = [
  { id: 'none', label: 'None', styles: { animationName: 'none' } },
  { id: 'fade-in', label: 'Fade in', styles: { animationName: 'nila-fade-in', animationDuration: '600ms', animationTimingFunction: 'ease-out', animationFillMode: 'both' } },
  { id: 'slide-up', label: 'Slide up', styles: { animationName: 'nila-slide-up', animationDuration: '650ms', animationTimingFunction: 'cubic-bezier(.2,.8,.2,1)', animationFillMode: 'both' } },
  { id: 'slide-left', label: 'Slide left', styles: { animationName: 'nila-slide-left', animationDuration: '650ms', animationTimingFunction: 'cubic-bezier(.2,.8,.2,1)', animationFillMode: 'both' } },
  { id: 'scale-in', label: 'Scale in', styles: { animationName: 'nila-scale-in', animationDuration: '500ms', animationTimingFunction: 'ease-out', animationFillMode: 'both' } },
  { id: 'pulse', label: 'Pulse', styles: { animationName: 'nila-pulse', animationDuration: '1800ms', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' } },
] as const;
