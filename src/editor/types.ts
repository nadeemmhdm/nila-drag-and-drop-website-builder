import type { DeviceViewport } from '../core/project';

export type EditorNodeType =
  | 'section'
  | 'container'
  | 'heading'
  | 'paragraph'
  | 'button'
  | 'image'
  | 'divider'
  | 'spacer';

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
