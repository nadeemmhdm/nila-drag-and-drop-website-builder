import { useCallback, useState } from 'react';
import type { NilaPage } from '../core/project';
import type { EditorNode } from './types';

interface HistoryState {
  past: NilaPage[][];
  present: NilaPage[];
  future: NilaPage[][];
}

export function useProjectHistory(initialPages: NilaPage[]) {
  const [history, setHistory] = useState<HistoryState>({ past: [], present: initialPages, future: [] });

  const commitPages = useCallback((next: NilaPage[] | ((current: NilaPage[]) => NilaPage[])) => {
    setHistory((current) => {
      const nextPresent = typeof next === 'function' ? next(current.present) : next;
      if (nextPresent === current.present) return current;
      return { past: [...current.past.slice(-49), current.present], present: nextPresent, future: [] };
    });
  }, []);

  const commitNodes = useCallback((pageId: string, next: EditorNode[] | ((current: EditorNode[]) => EditorNode[])) => {
    commitPages((pages) => {
      let changed = false;
      const result = pages.map((page) => {
        if (page.id !== pageId) return page;
        const nextNodes = typeof next === 'function' ? next(page.nodes) : next;
        if (nextNodes === page.nodes) return page;
        changed = true;
        return { ...page, nodes: nextNodes };
      });
      return changed ? result : pages;
    });
  }, [commitPages]);

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
    pages: history.present,
    commitPages,
    commitNodes,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
