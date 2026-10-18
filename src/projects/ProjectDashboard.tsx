import { Clock3, FilePlus2, FolderOpen, LayoutTemplate, Plus, Search, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PROJECT_SCHEMA_VERSION } from '../core/constants';
import type { CatalogPreset } from '../editor/catalog';
import { DISTINCT_TEMPLATE_PRESETS } from '../editor/templateCatalog';
import { createDefaultPageSeo, createDefaultSiteSeo } from '../seo/defaults';
import { deleteBackups, deleteWorkspace, listWorkspaces, saveWorkspace } from '../workspace/storage';
import type { WorkspaceSnapshot } from '../workspace/types';
import { deleteProjectMeta, getProjectMeta, saveProjectMeta } from './projectMeta';

interface Props { onOpen: (snapshot: WorkspaceSnapshot) => void | Promise<void>; }
type TemplateChoice = { id: string; name: string; description: string; preset?: CatalogPreset };

const templateChoices: TemplateChoice[] = [
  { id: 'blank', name: 'Blank', description: 'Start with a clean empty canvas.' },
  ...DISTINCT_TEMPLATE_PRESETS.map((preset) => ({ id: preset.id, name: preset.name, description: preset.description, preset })),
];

export function ProjectDashboard({ onOpen }: Props) {
  const [projects, setProjects] = useState<WorkspaceSnapshot[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [templateId, setTemplateId] = useState('blank');
  const [templateQuery, setTemplateQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const next = await listWorkspaces();
      setProjects(next);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load local projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onFocus = () => void refresh();
    const onVisibility = () => { if (document.visibilityState === 'visible') void refresh(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => { window.removeEventListener('focus', onFocus); document.removeEventListener('visibilitychange', onVisibility); };
  }, [refresh]);

  const visibleProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = projects.filter((project) => !q || `${project.name} ${getProjectMeta(project.id).description} ${project.pages.map((page) => page.name).join(' ')}`.toLowerCase().includes(q));
    return showAll ? filtered : filtered.slice(0, 6);
  }, [projects, query, showAll]);
  const visibleTemplates = useMemo(() => {
    const q = templateQuery.trim().toLowerCase();
    return templateChoices.filter((item) => !q || `${item.name} ${item.description}`.toLowerCase().includes(q));
  }, [templateQuery]);

  const createProject = async () => {
    const cleanName = name.trim();
    if (!cleanName || busy) return;
    setBusy(true);
    setError('');
    try {
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      const pageId = crypto.randomUUID();
      const choice = templateChoices.find((item) => item.id === templateId) ?? templateChoices[0];
      const nodes = choice.preset ? choice.preset.build() : [];
      const snapshot: WorkspaceSnapshot = {
        id,
        ownerFolder: 'local-user',
        name: cleanName,
        schemaVersion: PROJECT_SCHEMA_VERSION,
        pages: [{ id: pageId, name: 'Home', slug: '/', isHome: true, nodes, seo: createDefaultPageSeo(cleanName) }],
        assets: [],
        fonts: [],
        seo: createDefaultSiteSeo(cleanName),
        activePageId: pageId,
        createdAt: now,
        savedAt: now,
      };
      saveProjectMeta(id, { description: description.trim(), templateId: choice.id, installedLibraryIds: [] });
      await saveWorkspace(snapshot, true);
      setProjects((current) => [snapshot, ...current.filter((item) => item.id !== snapshot.id)]);
      setName(''); setDescription(''); setTemplateId('blank'); setTemplateQuery(''); setCreating(false);
      await onOpen(snapshot);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to create the project.');
    } finally {
      setBusy(false);
    }
  };

  const removeProject = async (project: WorkspaceSnapshot) => {
    if (!window.confirm(`Delete “${project.name}” and its local backups?`)) return;
    await deleteWorkspace(project.id);
    await deleteBackups(project.id);
    deleteProjectMeta(project.id);
    setProjects((current) => current.filter((item) => item.id !== project.id));
  };

  return (
    <main className="projects-screen">
      <header className="projects-topbar"><div className="projects-brand"><span>N</span><div><strong>Nila Website Builder</strong><small>Local-first React website projects</small></div></div><button type="button" className="projects-new compact" onClick={() => setCreating(true)}><Plus size={16}/> New project</button></header>
      <section className="projects-hero"><div><span className="projects-kicker">YOUR WORKSPACE</span><h1>Build websites inside projects.</h1><p>Create a project first, choose a distinct animated starter or Blank, then design pages with autosave enabled.</p></div><button type="button" className="projects-new" onClick={() => setCreating(true)}><FilePlus2 size={18}/> New Project</button></section>
      <section className="projects-section">
        <div className="projects-section-head"><div><h2>Recent projects</h2><p>Everything is saved locally while you work.</p></div><button type="button" className="text-button" onClick={() => setShowAll((value) => !value)}>{showAll ? 'Show recent' : 'View all'}</button></div>
        <div className="projects-search"><Search size={16}/><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Search projects" /></div>
        {error ? <div className="projects-storage-error">{error}</div> : null}
        {loading ? <div className="projects-empty"><strong>Loading projects…</strong></div> : visibleProjects.length ? <div className="project-grid">{visibleProjects.map((project) => { const meta=getProjectMeta(project.id); const template=templateChoices.find((item)=>item.id===meta.templateId); return <article className="project-card" key={project.id}><button type="button" className="project-card-open" onClick={() => void onOpen(project)}><div className="project-thumb"><LayoutTemplate size={28}/><span>{template?.name??'Project'} · {project.pages.length} {project.pages.length===1?'page':'pages'}</span></div><div className="project-card-copy"><strong>{project.name}</strong><p>{meta.description || project.pages.map((page)=>page.name).join(' · ') || 'No description'}</p><small><Clock3 size={13}/> {new Date(project.savedAt).toLocaleString()}</small></div></button><button type="button" className="project-delete" onClick={()=>void removeProject(project)} aria-label={`Delete ${project.name}`}><Trash2 size={15}/></button></article>; })}</div> : <div className="projects-empty"><FolderOpen size={30}/><strong>{query.trim() ? 'No matching projects' : 'No projects yet'}</strong><p>{query.trim() ? 'Try a different search.' : 'Create your first project to start building.'}</p>{!query.trim()?<button type="button" onClick={()=>setCreating(true)}>Create project</button>:null}</div>}
      </section>
      {creating ? <div className="project-modal-backdrop" role="presentation"><section className="project-modal" role="dialog" aria-modal="true" aria-labelledby="new-project-title"><div className="project-modal-head"><div><span>NEW PROJECT</span><h2 id="new-project-title">Create a website project</h2></div><button type="button" onClick={()=>setCreating(false)} aria-label="Close"><X size={18}/></button></div><label>Project name<input autoFocus value={name} onChange={(event)=>setName(event.target.value)} placeholder="My website" maxLength={120}/></label><label>Description <small>Optional</small><textarea value={description} onChange={(event)=>setDescription(event.target.value)} placeholder="What are you building?" maxLength={600}/></label><div className="template-picker-head"><div><strong>Starting template</strong><span>Blank is selected by default. Templates have distinct layouts and motion profiles.</span></div><div className="template-search"><Search size={14}/><input value={templateQuery} onChange={(event)=>setTemplateQuery(event.target.value)} placeholder="Search all templates"/></div></div><div className="template-choice-grid">{visibleTemplates.map((choice)=><button type="button" key={choice.id} className={templateId===choice.id?'selected':''} onClick={()=>setTemplateId(choice.id)}><div className="template-choice-preview"><LayoutTemplate size={20}/></div><strong>{choice.name}</strong><span>{choice.description}</span></button>)}</div><div className="project-modal-actions"><button type="button" className="secondary" onClick={()=>setCreating(false)}>Cancel</button><button type="button" className="primary" disabled={!name.trim()||busy} onClick={()=>void createProject()}>{busy?'Creating…':'Create project'}</button></div></section></div> : null}
    </main>
  );
}
