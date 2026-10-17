import { useState } from 'react';
import { EditorShell } from './editor/EditorShell';
import { ProjectDashboard } from './projects/ProjectDashboard';
import { saveWorkspace } from './workspace/storage';
import type { WorkspaceSnapshot } from './workspace/types';

export function App() {
  const [editing, setEditing] = useState(false);
  const [editorKey, setEditorKey] = useState('editor');

  const openProject = async (snapshot: WorkspaceSnapshot) => {
    await saveWorkspace(snapshot, false);
    setEditorKey(`${snapshot.id}:${Date.now()}`);
    setEditing(true);
  };

  if (!editing) return <ProjectDashboard onOpen={openProject} />;

  return (
    <div className="nila-editor-host">
      <button type="button" className="project-switch-button" onClick={() => setEditing(false)} aria-label="Back to projects">
        <span aria-hidden="true">←</span> Projects
      </button>
      <EditorShell key={editorKey} />
    </div>
  );
}
