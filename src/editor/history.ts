import { useCallback, useState } from 'react';
import type { EditorNode } from './types';

interface HistoryState {
  past: EditorNode[][];
  present: EditorNode[];
  future: EditorNode[][];
}

export function useNodeHistory(initialNodes: EditorNode[]) {
  const [history, setHistory] = useState<HistoryState>({ past: [], present: initialNodes, future: [] });

  const commit = useCallback((next: EditorNode[] | ((current: EditorNode[]) => EditorNode[])) => {
    setHistory((current) => {
      const nextPresent = typeof next === 'function' ? next(current.present) : next;
      if (nextPresent === current.present) return current;
      return { past: [...current.past.slice(-49), current.present], present: nextPresent, future: [] };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((current) => {
      const previous = current.past.at(-1);
      if (!previous) return current;
      return { past: current.past.slice(0, -1), present: previous, future: [current.present, ...current.future] };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((current) => {
      const next = current.future[0];
      if (!next) return current;
      return { past: [...current.past, current.present], present: next, future: current.future.slice(1) };
    });
  }, []);

  return {
    nodes: history.present,
    commit,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
