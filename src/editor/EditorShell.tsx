import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Copy, Eye, Layers3, Monitor, PanelLeft, Redo2, Smartphone, Tablet, Undo2, ZoomIn, ZoomOut } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DeviceViewport } from '../core/project';
import { APP_NAME, APP_VERSION } from '../core/constants';
import { Canvas } from './components/Canvas';
import { Inspector } from './components/Inspector';
import { Layers } from './components/Layers';
import { Palette } from './components/Palette';
import { useNodeHistory } from './history';
import { createInitialDocument } from './initialDocument';
import { cloneNode, createNode, findNode, getChildren, insertNode, isContainerNode, isDescendant, removeNode, replaceChildren, updateNode } from './model';
import type { EditorNode, EditorNodeProps, EditorNodeType, NodeStyle } from './types';

const viewportIcons = { desktop: Monitor, tablet: Tablet, mobile: Smartphone };

type LeftPanel = 'elements' | 'layers';

export function EditorShell() {
  const initial = useMemo(createInitialDocument, []);
  const { nodes, commit, undo, redo, canUndo, canRedo } = useNodeHistory(initial.nodes);
  const [selectedId, setSelectedId] = useState<string | null>(initial.selectedId);
  const [viewport, setViewport] = useState<DeviceViewport>(initial.viewport);
  const [zoom, setZoom] = useState(initial.zoom);
  const [leftPanel, setLeftPanel] = useState<LeftPanel>('elements');
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const selectedNode = selectedId ? findNode(nodes, selectedId)?.node ?? null : null;

  const deleteSelected = useCallback(() => {
    if (!selectedId || selectedNode?.locked) return;
    commit((current) => removeNode(current, selectedId).nodes);
    setSelectedId(null);
  }, [commit, selectedId, selectedNode?.locked]);

  const duplicateSelected = useCallback(() => {
    if (!selectedId) return;
    commit((current) => {
      const location = findNode(current, selectedId);
      if (!location) return current;
      const cloned = cloneNode(location.node);
      setSelectedId(cloned.id);
      return insertNode(current, location.parentId, location.index + 1, cloned);
    });
  }, [commit, selectedId]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, select, [contenteditable="true"]')) return;
      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); }
      else if (mod && event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); }
      else if (mod && event.key.toLowerCase() === 'd') { event.preventDefault(); duplicateSelected(); }
      else if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); deleteSelected(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [deleteSelected, duplicateSelected, redo, undo]);

  const onDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.source === 'palette') setActiveLabel(String(data.nodeType));
    else if (data?.source === 'canvas') setActiveLabel(findNode(nodes, String(data.nodeId))?.node.name ?? 'Element');
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveLabel(null);
    const { active, over } = event;
    if (!over) return;
    const activeData = active.data.current;
    const overData = over.data.current;
    const targetParentId = overData?.type === 'container'
      ? ((overData.parentId as string | null | undefined) ?? null)
      : ((overData?.parentId as string | null | undefined) ?? null);

    if (activeData?.source === 'palette') {
      const node = createNode(activeData.nodeType as EditorNodeType);
      commit((current) => {
        const overId = overData?.type === 'node' ? String(overData.nodeId) : null;
        const overNode = overId ? findNode(current, overId)?.node : null;
        const paletteParentId = overNode && isContainerNode(overNode) ? overNode.id : targetParentId;
        const targetChildren = getChildren(current, paletteParentId);
        const index = paletteParentId === targetParentId && overId
          ? Math.max(0, targetChildren.findIndex((item) => item.id === overId))
          : targetChildren.length;
        return insertNode(current, paletteParentId, index, node);
      });
      setSelectedId(node.id);
      return;
    }

    if (activeData?.source !== 'canvas') return;
    const activeId = String(activeData.nodeId);
    if (activeId === String(over.id)) return;

    commit((current) => {
      const source = findNode(current, activeId);
      if (!source || source.node.locked) return current;
      let destinationParentId = targetParentId;
      if (overData?.type === 'node') {
        const overNode = findNode(current, String(overData.nodeId))?.node;
        if (overNode && isContainerNode(overNode) && overNode.id !== activeId) destinationParentId = overNode.id;
      }
      if (destinationParentId === activeId || (destinationParentId && isDescendant(current, activeId, destinationParentId))) return current;

      const destinationChildrenBefore = getChildren(current, destinationParentId);
      const overNodeId = overData?.type === 'node' ? String(overData.nodeId) : null;
      let destinationIndex = overNodeId ? destinationChildrenBefore.findIndex((item) => item.id === overNodeId) : destinationChildrenBefore.length;
      if (destinationIndex < 0) destinationIndex = destinationChildrenBefore.length;

      if (source.parentId === destinationParentId) {
        const siblings = getChildren(current, source.parentId);
        return replaceChildren(current, source.parentId, arrayMove(siblings, source.index, destinationIndex));
      }

      const removed = removeNode(current, activeId);
      if (!removed.removed) return current;
      return insertNode(removed.nodes, destinationParentId, destinationIndex, removed.removed);
    });
  };

  const patchSelected = (patch: Partial<EditorNode>) => {
    if (!selectedId) return;
    commit((current) => updateNode(current, selectedId, (node) => ({ ...node, ...patch })));
  };

  const patchProps = (patch: EditorNodeProps) => {
    if (!selectedId) return;
    commit((current) => updateNode(current, selectedId, (node) => ({ ...node, props: { ...node.props, ...patch } })));
  };

  const patchStyle = (patch: NodeStyle) => {
    if (!selectedId) return;
    commit((current) => updateNode(current, selectedId, (node) => ({ ...node, styles: { ...node.styles, [viewport]: { ...node.styles[viewport], ...patch } } })));
  };

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="editor-app">
        <header className="editor-topbar">
          <div className="brand"><div className="brand-mark">N</div><div><strong>{APP_NAME}</strong><span>Phase 2 · v{APP_VERSION}</span></div></div>
          <div className="topbar-group history-controls"><button type="button" disabled={!canUndo} onClick={undo} title="Undo"><Undo2 size={16} /></button><button type="button" disabled={!canRedo} onClick={redo} title="Redo"><Redo2 size={16} /></button></div>
          <div className="viewport-switcher">{(['desktop','tablet','mobile'] as DeviceViewport[]).map((device) => { const Icon = viewportIcons[device]; return <button type="button" key={device} className={viewport === device ? 'active' : ''} onClick={() => setViewport(device)} title={device}><Icon size={16} /><span>{device}</span></button>; })}</div>
          <div className="topbar-group zoom-controls"><button type="button" onClick={() => setZoom((value) => Math.max(50, value - 10))}><ZoomOut size={16} /></button><span>{zoom}%</span><button type="button" onClick={() => setZoom((value) => Math.min(120, value + 10))}><ZoomIn size={16} /></button></div>
          <button type="button" className="preview-button"><Eye size={16} /> Preview</button>
        </header>

        <div className="editor-workspace">
          <aside className="left-sidebar">
            <div className="sidebar-tabs"><button type="button" className={leftPanel === 'elements' ? 'active' : ''} onClick={() => setLeftPanel('elements')}><PanelLeft size={15} /> Elements</button><button type="button" className={leftPanel === 'layers' ? 'active' : ''} onClick={() => setLeftPanel('layers')}><Layers3 size={15} /> Layers</button></div>
            <div className="sidebar-scroll">{leftPanel === 'elements' ? <><div className="panel-heading"><strong>Elements</strong><span>Drag to canvas</span></div><Palette /></> : <><div className="panel-heading"><strong>Layers</strong><span>{nodes.length} root nodes</span></div><Layers nodes={nodes} selectedId={selectedId} onSelect={setSelectedId} /></>}</div>
          </aside>

          <main className="workspace-main"><Canvas nodes={nodes} viewport={viewport} zoom={zoom} selectedId={selectedId} onSelect={setSelectedId} /></main>

          <aside className="right-sidebar"><Inspector node={selectedNode} viewport={viewport} onPatch={patchSelected} onPatchProps={patchProps} onPatchStyle={patchStyle} onDelete={deleteSelected} onDuplicate={duplicateSelected} /></aside>
        </div>
        <footer className="editor-statusbar"><span>Home</span><span>{selectedNode ? `Selected: ${selectedNode.name}` : 'No selection'}</span><span>Local-first editor · autosave arrives in Phase 6</span></footer>
      </div>
      <DragOverlay>{activeLabel ? <div className="drag-overlay"><Copy size={14} /> {activeLabel}</div> : null}</DragOverlay>
    </DndContext>
  );
}
