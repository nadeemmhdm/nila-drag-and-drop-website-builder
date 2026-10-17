import { useDraggable } from '@dnd-kit/core';
import { Badge, Box, CheckSquare, Columns3, Grid3X3, Heading1, Image, Link, List, Minus, MousePointerClick, Pilcrow, PlaySquare, Quote, RectangleHorizontal, Rows3, Space, Sparkles, TextCursorInput, TextQuote, UserRound } from 'lucide-react';
import type { EditorNodeType } from '../types';

const groups: Array<{ name: string; items: Array<{ type: EditorNodeType; label: string; icon: typeof Box }> }> = [
  { name: 'Layout', items: [{ type: 'section', label: 'Section', icon: Rows3 }, { type: 'container', label: 'Container', icon: Box }, { type: 'columns', label: 'Columns', icon: Columns3 }, { type: 'grid', label: 'Grid', icon: Grid3X3 }, { type: 'card', label: 'Card', icon: RectangleHorizontal }] },
  { name: 'Content', items: [{ type: 'heading', label: 'Heading', icon: Heading1 }, { type: 'paragraph', label: 'Paragraph', icon: Pilcrow }, { type: 'link', label: 'Link', icon: Link }, { type: 'button', label: 'Button', icon: MousePointerClick }, { type: 'badge', label: 'Badge', icon: Badge }, { type: 'icon', label: 'Icon', icon: Sparkles }, { type: 'quote', label: 'Quote', icon: Quote }, { type: 'list', label: 'List', icon: List }] },
  { name: 'Media', items: [{ type: 'image', label: 'Image', icon: Image }, { type: 'avatar', label: 'Avatar', icon: UserRound }, { type: 'video', label: 'Video', icon: PlaySquare }] },
  { name: 'Forms', items: [{ type: 'input', label: 'Input', icon: TextCursorInput }, { type: 'textarea', label: 'Textarea', icon: TextQuote }, { type: 'select', label: 'Select', icon: RectangleHorizontal }, { type: 'checkbox', label: 'Checkbox', icon: CheckSquare }] },
  { name: 'Utility', items: [{ type: 'divider', label: 'Divider', icon: Minus }, { type: 'spacer', label: 'Spacer', icon: Space }] },
];

function PaletteItem({ type, label, icon: Icon }: { type: EditorNodeType; label: string; icon: typeof Box }) { const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `palette:${type}`, data: { source: 'palette', nodeType: type } }); return <button ref={setNodeRef} className={`palette-item${isDragging ? ' dragging' : ''}`} style={{ transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined }} {...listeners} {...attributes} type="button"><Icon size={17} aria-hidden="true" /><span>{label}</span></button>; }
export function Palette() { return <div className="palette-groups">{groups.map((group) => <section className="palette-group" key={group.name}><div className="palette-group-title">{group.name}</div><div className="palette-grid">{group.items.map((item) => <PaletteItem key={item.type} {...item} />)}</div></section>)}</div>; }
