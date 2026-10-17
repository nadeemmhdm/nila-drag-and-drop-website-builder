import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Eye, EyeOff, IndentDecrease, IndentIncrease, Lock, Unlock } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { EditorNode } from '../types';

interface LayersProps {
  nodes: EditorNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onMoveIn: (id: string) => void;
  onMoveOut: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onToggleLocked: (id: string) => void;
}

interface FlatMeta { parentId: string | null; index: number; siblingCount: number; previousSibling?: EditorNode; }

export function Layers(props: LayersProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const meta = useMemo(() => buildMeta(props.nodes), [props.nodes]);
  const toggleCollapsed = (id: string) => setCollapsed((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  return <div className="layers-panel-v2">
    <div className="layers-help">Select a layer, then move it up/down, nest it inside the previous container, or move it one level out.</div>
    <div className="layers-list-v2">{props.nodes.map((node) => <LayerRow key={node.id} node={node} depth={0} collapsed={collapsed} meta={meta} toggleCollapsed={toggleCollapsed} {...props} />)}</div>
  </div>;
}

function LayerRow({ node, depth, collapsed, meta, toggleCollapsed, selectedId, onSelect, onMoveUp, onMoveDown, onMoveIn, onMoveOut, onToggleHidden, onToggleLocked }: LayersProps & { node: EditorNode; depth: number; collapsed: Set<string>; meta: Map<string, FlatMeta>; toggleCollapsed: (id: string) => void }) {
  const info = meta.get(node.id);
  const hasChildren = node.children.length > 0;
  const isCollapsed = collapsed.has(node.id);
  const canMoveIn = Boolean(info?.previousSibling && ['section','container','row','columns','grid','card'].includes(info.previousSibling.type));
  const canMoveOut = Boolean(info?.parentId);
  return <div className={`layer-tree-item depth-${Math.min(depth, 6)}`}>
    <div className={`layer-row-v2${selectedId === node.id ? ' selected' : ''}`} style={{ '--layer-depth': depth } as React.CSSProperties}>
      <button type="button" className="layer-collapse" disabled={!hasChildren} onClick={() => hasChildren && toggleCollapsed(node.id)} aria-label={isCollapsed ? 'Expand layer' : 'Collapse layer'}>{hasChildren ? isCollapsed ? <ChevronRight size={13}/> : <ChevronDown size={13}/> : <span/>}</button>
      <button type="button" className="layer-main" onClick={() => onSelect(node.id)} title={node.name}>
        <span className={`layer-type-dot type-${node.type}`}/><span className="layer-copy"><strong>{node.name}</strong><small>{node.type}{depth === 0 ? ' · root' : ` · level ${depth + 1}`}</small></span>
      </button>
      <div className="layer-quick-actions">
        <button type="button" disabled={!info || info.index === 0} onClick={() => onMoveUp(node.id)} title="Move up"><ArrowUp size={12}/></button>
        <button type="button" disabled={!info || info.index >= info.siblingCount - 1} onClick={() => onMoveDown(node.id)} title="Move down"><ArrowDown size={12}/></button>
        <button type="button" disabled={!canMoveIn} onClick={() => onMoveIn(node.id)} title="Move inside previous container"><IndentIncrease size={12}/></button>
        <button type="button" disabled={!canMoveOut} onClick={() => onMoveOut(node.id)} title="Move one level out"><IndentDecrease size={12}/></button>
      </div>
      <div className="layer-state-actions">
        <button type="button" className={node.hidden ? 'active warning' : ''} onClick={() => onToggleHidden(node.id)} title={node.hidden ? 'Show layer' : 'Hide layer'}>{node.hidden ? <EyeOff size={12}/> : <Eye size={12}/>}</button>
        <button type="button" className={node.locked ? 'active' : ''} onClick={() => onToggleLocked(node.id)} title={node.locked ? 'Unlock layer' : 'Lock layer'}>{node.locked ? <Lock size={12}/> : <Unlock size={12}/>}</button>
      </div>
    </div>
    {hasChildren && !isCollapsed ? <div className="layer-children-v2">{node.children.map((child) => <LayerRow key={child.id} node={child} depth={depth + 1} collapsed={collapsed} meta={meta} toggleCollapsed={toggleCollapsed} selectedId={selectedId} onSelect={onSelect} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onMoveIn={onMoveIn} onMoveOut={onMoveOut} onToggleHidden={onToggleHidden} onToggleLocked={onToggleLocked} nodes={[]} />)}</div> : null}
  </div>;
}

function buildMeta(nodes: EditorNode[]) {
  const map = new Map<string, FlatMeta>();
  const walk = (items: EditorNode[], parentId: string | null) => items.forEach((node, index) => {
    map.set(node.id, { parentId, index, siblingCount: items.length, previousSibling: items[index - 1] });
    walk(node.children, node.id);
  });
  walk(nodes, null);
  return map;
}
