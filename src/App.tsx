import { useState } from 'react';
import { EditorShell } from './editor/EditorShell';
import { ProjectDashboard } from './projects/ProjectDashboard';
import { saveWorkspace } from './workspace/storage';
import type { WorkspaceSnapshot } from './workspace/types';

export function App() {
  const [editing, setEditing] = useState(false);
  const [editorKey, setEditorKey] = useState('editor');
  const [leftHidden, setLeftHidden] = useState(false);
  const [rightHidden, setRightHidden] = useState(false);

  const openProject = async (snapshot: WorkspaceSnapshot) => {
    await saveWorkspace(snapshot, false);
    setEditorKey(`${snapshot.id}:${Date.now()}`);
    setEditing(true);
  };

  if (!editing) return <ProjectDashboard onOpen={openProject} />;

  return (
    <div className={`nila-editor-host${leftHidden ? ' hide-left' : ''}${rightHidden ? ' hide-right' : ''}`}>
      <button type="button" className="project-switch-button" onClick={() => setEditing(false)} aria-label="Back to projects"><span aria-hidden="true">←</span> Projects</button>
      <button type="button" className="sidebar-collapse-toggle left" onClick={() => setLeftHidden((value) => !value)} aria-label={leftHidden ? 'Show left sidebar' : 'Hide left sidebar'} title={leftHidden ? 'Show left sidebar' : 'Hide left sidebar'}>{leftHidden ? '›' : '‹'}</button>
      <button type="button" className="sidebar-collapse-toggle right" onClick={() => setRightHidden((value) => !value)} aria-label={rightHidden ? 'Show right inspector' : 'Hide right inspector'} title={rightHidden ? 'Show right inspector' : 'Hide right inspector'}>{rightHidden ? '‹' : '›'}</button>
      <EditorShell key={editorKey} />
    </div>
  );
}
