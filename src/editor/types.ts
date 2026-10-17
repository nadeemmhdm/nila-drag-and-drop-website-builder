import type { DeviceViewport } from '../core/project';

export type EditorNodeType =
  | 'section'
  | 'container'
  | 'div'
  | 'row'
  | 'columns'
  | 'grid'
  | 'card'
  | 'heading'
  | 'paragraph'
  | 'link'
  | 'button'
  | 'badge'
  | 'icon'
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

export type LinkType = 'page' | 'external' | 'anchor' | 'email' | 'phone';
export type ListStyle = 'bullet' | 'number' | 'lower-alpha' | 'upper-alpha' | 'roman' | 'mixed';
export type IconMode = 'lucide' | 'emoji';

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
  linkType?: LinkType;
  pageId?: string;
  anchor?: string;
  anchorId?: string;
  newTab?: boolean;
  assetId?: string;
  iconName?: string;
  iconMode?: IconMode;
  emoji?: string;
  src?: string;
  alt?: string;
  caption?: string;
  loading?: 'lazy' | 'eager';
  placeholder?: string;
  label?: string;
  fieldName?: string;
  inputType?: 'text' | 'email' | 'tel' | 'url' | 'number' | 'password' | 'search' | 'date' | 'time';
  required?: boolean;
  rows?: number;
  items?: string[];
  listStyle?: ListStyle;
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
