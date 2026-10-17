import type { EditorNode } from '../editor/types';
import type { NativeVendorTheme } from './nativeAdapter';

export const PROJECT_UI_RUNTIME_EVENT = 'nila:project-ui-runtime';

export type ProjectUiRuntimeDetail =
  | { action: 'insert'; pageId?: string; nodes: EditorNode[] }
  | { action: 'theme'; theme: NativeVendorTheme };

export function dispatchProjectUiRuntime(detail: ProjectUiRuntimeDetail) {
  window.dispatchEvent(new CustomEvent<ProjectUiRuntimeDetail>(PROJECT_UI_RUNTIME_EVENT, { detail }));
}
