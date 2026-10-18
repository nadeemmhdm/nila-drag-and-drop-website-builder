import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState, type MouseEvent } from 'react';
import { initializeAiCredentials } from './ai/credentials';
import { EditorShell } from './editor/EditorShell';
import { ProjectDashboard } from './projects/ProjectDashboard';
import { saveWorkspace } from './workspace/storage';
import type { WorkspaceSnapshot } from './workspace/types';

export function App() {
  const [editing, setEditing] = useState(false);
  const [editorKey, setEditorKey] = useState('editor');
  const [leftHidden, setLeftHidden] = useState(false);
  const [rightHidden, setRightHidden] = useState(false);
  const [previewActive, setPreviewActive] = useState(false);
  const [credentialsReady, setCredentialsReady] = useState(false);

  useEffect(() => {
    let active = true;
    void initializeAiCredentials().finally(() => { if (active) setCredentialsReady(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !previewActive) return;
      setPreviewActive(false);
      setLeftHidden(false);
      setRightHidden(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [previewActive]);

  const openProject = async (snapshot: WorkspaceSnapshot) => {
    await saveWorkspace(snapshot, false);
    setEditorKey(`${snapshot.id}:${Date.now()}`);
    setPreviewActive(false);
    setLeftHidden(false);
    setRightHidden(false);
    setEditing(true);
  };

  const handleEditorClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    const previewButton = target?.closest<HTMLButtonElement>('.preview-button');
    if (!previewButton) return;
    const enteringPreview = !previewButton.classList.contains('active');
    setPreviewActive(enteringPreview);
    setLeftHidden(enteringPreview);
    setRightHidden(enteringPreview);
  };

  const backToProjects = () => {
    setPreviewActive(false);
    setLeftHidden(false);
    setRightHidden(false);
    setEditing(false);
  };

  if (!credentialsReady) return <div className="app-startup-screen" role="status" aria-live="polite"><strong>Nila Website Builder</strong><span>Preparing your local workspace…</span></div>;
  if (!editing) return <ProjectDashboard onOpen={openProject} />;

  return (
    <div
      className={`nila-editor-host${leftHidden ? ' hide-left' : ''}${rightHidden ? ' hide-right' : ''}${previewActive ? ' preview-active' : ''}`}
      onClickCapture={handleEditorClickCapture}
    >
      {!previewActive ? <>
        <button type="button" className="sidebar-collapse-toggle left" onClick={() => setLeftHidden((value) => !value)} aria-label={leftHidden ? 'Show left sidebar' : 'Hide left sidebar'} title={leftHidden ? 'Show left sidebar' : 'Hide left sidebar'}>{leftHidden ? <ChevronRight size={17}/> : <ChevronLeft size={17}/>}</button>
        <button type="button" className="sidebar-collapse-toggle right" onClick={() => setRightHidden((value) => !value)} aria-label={rightHidden ? 'Show right inspector' : 'Hide right inspector'} title={rightHidden ? 'Show right inspector' : 'Hide right inspector'}>{rightHidden ? <ChevronLeft size={17}/> : <ChevronRight size={17}/>}</button>
      </> : null}
      <EditorShell key={editorKey} onBackToProjects={backToProjects} />
    </div>
  );
}
