import { PROJECT_SCHEMA_VERSION } from '../src/core/constants';
import { createInitialEditorState } from '../src/editor/initialDocument';
import { createDefaultSiteSeo } from '../src/seo/defaults';
import type { WorkspaceSnapshot } from '../src/workspace/types';

export function makeWorkspace(): WorkspaceSnapshot {
  const initial=createInitialEditorState(); const now=new Date().toISOString();
  return { id:crypto.randomUUID(),ownerFolder:'local-user',name:'Test Site',schemaVersion:PROJECT_SCHEMA_VERSION,pages:initial.pages,assets:[],fonts:[],seo:createDefaultSiteSeo(),activePageId:initial.activePageId,createdAt:now,savedAt:now };
}
