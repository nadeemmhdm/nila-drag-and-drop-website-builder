import type { DeviceViewport } from '../core/project';

export type EditorNodeType =
  | 'section'
  | 'container'
  | 'columns'
  | 'grid'
  | 'card'
  | 'heading'
  | 'paragraph'
  | 'link'
  | 'button'
  | 'badge'
  | 'image'
  | 'avatar'
  | 'video'
  | 'quote'
  | 'list'
  | 'divider'
  | 'spacer'
  | 'input'
  | 'textarea'
  | 'select'
  | 'checkbox';

export interface NodeStyle {
  [property: string]: string | number | undefined;
}

export interface ResponsiveStyles {
  desktop: NodeStyle;
  tablet: NodeStyle;
  mobile: NodeStyle;
}

export interface EditorNodeProps {
  text?: string;
  href?: string;
  src?: string;
  alt?: string;
  placeholder?: string;
  label?: string;
  items?: string[];
  options?: string[];
  checked?: boolean;
}

export interface EditorNode {
  id: string;
  type: EditorNodeType;
  name: string;
  props: EditorNodeProps;
  styles: ResponsiveStyles;
  children: EditorNode[];
  locked?: boolean;
  hidden?: boolean;
}

export interface EditorDocument {
  id: string;
  name: string;
  nodes: EditorNode[];
  selectedId: string | null;
  viewport: DeviceViewport;
  zoom: number;
}

export interface NodeLocation {
  node: EditorNode;
  parentId: string | null;
  index: number;
}
