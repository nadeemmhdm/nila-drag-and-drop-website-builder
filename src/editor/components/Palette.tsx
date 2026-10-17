import { useDraggable } from '@dnd-kit/core';
import { Box, Heading1, Image, Minus, MousePointerClick, Pilcrow, Rows3, Space } from 'lucide-react';
import type { EditorNodeType } from '../types';

const palette: Array<{ type: EditorNodeType; label: string; icon: typeof Box }> = [
  { type: 'section', label: 'Section', icon: Rows3 },
  { type: 'container', label: 'Container', icon: Box },
  { type: 'heading', label: 'Heading', icon: Heading1 },
  { type: 'paragraph', label: 'Paragraph', icon: Pilcrow },
  { type: 'button', label: 'Button', icon: MousePointerClick },
  { type: 'image', label: 'Image', icon: Image },
  { type: 'divider', label: 'Divider', icon: Minus },
  { type: 'spacer', label: 'Spacer', icon: Space },
];

function PaletteItem({ type, label, icon: Icon }: (typeof palette)[number]) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette:${type}`,
    data: { source: 'palette', nodeType: type },
  });

  return (
    <button
      ref={setNodeRef}
      className={`palette-item${isDragging ? ' dragging' : ''}`}
      style={{ transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined }}
      {...listeners}
      {...attributes}
      type="button"
    >
      <Icon size={17} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

export function Palette() {
  return (
    <div className="palette-grid">
      {palette.map((item) => <PaletteItem key={item.type} {...item} />)}
    </div>
  );
}
