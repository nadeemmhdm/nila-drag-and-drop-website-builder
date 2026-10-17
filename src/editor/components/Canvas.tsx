import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { CSSProperties, MouseEvent } from 'react';
import type { DeviceViewport } from '../../core/project';
import { VIEWPORTS } from '../../core/constants';
import type { EditorNode, NodeStyle } from '../types';
import { isContainerNode } from '../model';

interface CanvasProps { nodes: EditorNode[]; viewport: DeviceViewport; zoom: number; selectedId: string | null; onSelect: (id: string | null) => void; }

function stylesFor(node: EditorNode, viewport: DeviceViewport): CSSProperties {
  const merged: NodeStyle = { ...node.styles.desktop, ...(viewport === 'tablet' || viewport === 'mobile' ? node.styles.tablet : {}), ...(viewport === 'mobile' ? node.styles.mobile : {}) };
  return merged as CSSProperties;
}

function RenderContent({ node }: { node: EditorNode }) {
  switch (node.type) {
    case 'heading': return <h2 className="render-heading">{node.props.text}</h2>;
    case 'paragraph': return <p className="render-paragraph">{node.props.text}</p>;
    case 'link': return <a className="render-link" href={node.props.href ?? '#'} onClick={(event) => event.preventDefault()}>{node.props.text}</a>;
    case 'button': return <a className="render-button" href={node.props.href ?? '#'} onClick={(event) => event.preventDefault()}>{node.props.text}</a>;
    case 'badge': return <span className="render-badge">{node.props.text}</span>;
    case 'image': return node.props.src ? <img className="render-image" src={node.props.src} alt={node.props.alt ?? ''} /> : <div className="image-placeholder">Image placeholder</div>;
    case 'avatar': return node.props.src ? <img className="render-avatar" src={node.props.src} alt={node.props.alt ?? ''} /> : <div className="avatar-placeholder">Avatar</div>;
    case 'video': return node.props.src ? <video className="render-video" src={node.props.src} controls /> : <div className="video-placeholder">Video placeholder</div>;
    case 'quote': return <blockquote className="render-quote">{node.props.text}</blockquote>;
    case 'list': return <ul className="render-list">{(node.props.items ?? []).map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>;
    case 'input': return <label className="render-field"><span>{node.props.label}</span><input disabled placeholder={node.props.placeholder} /></label>;
    case 'textarea': return <label className="render-field"><span>{node.props.label}</span><textarea disabled placeholder={node.props.placeholder} /></label>;
    case 'select': return <label className="render-field"><span>{node.props.label}</span><select disabled>{(node.props.options ?? []).map((option) => <option key={option}>{option}</option>)}</select></label>;
    case 'checkbox': return <label className="render-checkbox"><input type="checkbox" checked={Boolean(node.props.checked)} readOnly /><span>{node.props.label}</span></label>;
    case 'divider': return <div className="render-divider" />;
    case 'spacer': return <div aria-hidden="true" />;
    default: return null;
  }
}

function ContainerChildren({ node, viewport, zoom, selectedId, onSelect }: CanvasProps & { node: EditorNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: `container:${node.id}`, data: { type: 'container', parentId: node.id } });
  return <div ref={setNodeRef} className={`node-children${isOver ? ' over' : ''}`}><SortableContext items={node.children.map((child) => child.id)} strategy={verticalListSortingStrategy}>{node.children.map((child) => <SortableNode key={child.id} node={child} parentId={node.id} viewport={viewport} zoom={zoom} selectedId={selectedId} onSelect={onSelect} nodes={[]} />)}</SortableContext>{node.children.length === 0 ? <div className="empty-container">Drop elements here</div> : null}</div>;
}

function SortableNode({ node, parentId, viewport, zoom, selectedId, onSelect }: CanvasProps & { node: EditorNode; parentId: string | null }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: node.id, data: { source: 'canvas', type: 'node', nodeId: node.id, parentId } });
  const select = (event: MouseEvent) => { event.stopPropagation(); onSelect(node.id); };
  if (node.hidden) return null;
  return <div ref={setNodeRef} className={`canvas-node node-${node.type}${selectedId === node.id ? ' selected' : ''}${isDragging ? ' dragging' : ''}`} style={{ transform: CSS.Transform.toString(transform), transition }} onClick={select} data-node-id={node.id}>
    {selectedId === node.id ? <div className="selection-label"><span>{node.name}</span><button type="button" className="drag-handle" aria-label={`Move ${node.name}`} {...attributes} {...listeners}><GripVertical size={13} /></button></div> : null}
    <div style={stylesFor(node, viewport)} className="render-surface"><RenderContent node={node} />{isContainerNode(node) ? <ContainerChildren node={node} viewport={viewport} zoom={zoom} selectedId={selectedId} onSelect={onSelect} nodes={[]} /> : null}</div>
  </div>;
}

export function Canvas({ nodes, viewport, zoom, selectedId, onSelect }: CanvasProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'container:root', data: { type: 'container', parentId: null } });
  const width = VIEWPORTS[viewport];
  return <div className="canvas-stage" onClick={() => onSelect(null)}><div className="canvas-ruler"><span>{viewport}</span><span>{width}px · {zoom}%</span></div><div className="canvas-viewport-wrap" style={{ width: `min(${width}px, 100%)` }}><div className="canvas-zoom" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}><div ref={setNodeRef} className={`canvas-document${isOver ? ' over' : ''}`}><SortableContext items={nodes.map((node) => node.id)} strategy={verticalListSortingStrategy}>{nodes.map((node) => <SortableNode key={node.id} node={node} parentId={null} viewport={viewport} zoom={zoom} selectedId={selectedId} onSelect={onSelect} nodes={nodes} />)}</SortableContext>{nodes.length === 0 ? <div className="empty-canvas">Drag an element here or insert a section/template.</div> : null}</div></div></div></div>;
}
