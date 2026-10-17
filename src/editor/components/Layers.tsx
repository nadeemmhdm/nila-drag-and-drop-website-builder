import { ChevronRight, Eye, EyeOff, Lock } from 'lucide-react';
import type { EditorNode } from '../types';

interface LayersProps {
  nodes: EditorNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function LayerRow({ node, depth, selectedId, onSelect }: { node: EditorNode; depth: number; selectedId: string | null; onSelect: (id: string) => void }) {
  return (
    <>
      <button
        type="button"
        className={`layer-row${selectedId === node.id ? ' selected' : ''}`}
        style={{ paddingLeft: `${10 + depth * 16}px` }}
        onClick={() => onSelect(node.id)}
      >
        {node.children.length > 0 ? <ChevronRight size={13} /> : <span className="layer-spacer" />}
        <span className="layer-name">{node.name}</span>
        {node.locked ? <Lock size={12} /> : null}
        {node.hidden ? <EyeOff size={12} /> : <Eye size={12} className="layer-muted" />}
      </button>
      {node.children.map((child) => (
        <LayerRow key={child.id} node={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </>
  );
}

export function Layers({ nodes, selectedId, onSelect }: LayersProps) {
  return <div className="layers-list">{nodes.map((node) => <LayerRow key={node.id} node={node} depth={0} selectedId={selectedId} onSelect={onSelect} />)}</div>;
}
