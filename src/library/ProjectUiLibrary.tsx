import { CheckCircle2, Code2, Copy, PackageCheck, Paintbrush, Plus, Search, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getProjectMeta, saveProjectMeta } from '../projects/projectMeta';
import { loadLastWorkspace } from '../workspace/storage';
import { buildNativeVendorNodes, createNativeVendorTheme } from './nativeAdapter';
import { dispatchProjectUiRuntime } from './projectUiRuntime';
import type { VendorItem, VendorManifest } from './vendorTypes';

export const LIBRARY_CHANGED_EVENT = 'nila:library-changed';

async function readPrimarySource(item: VendorItem) {
  const file = item.files.find((candidate) => /\.(css|tsx?|jsx?)$/i.test(candidate.path)) ?? item.files[0];
  if (!file) return { content: '', path: '—' };
  const response = await fetch(file.url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Unable to read ${item.title} from the local snapshot.`);
  const content = await response.text();
  if (content.length > 750_000) throw new Error('This vendored source file is too large for the visual adapter.');
  return { content, path: file.target || file.path };
}

export function ProjectUiLibrary({ projectId }: { projectId: string }) {
  const [manifest,setManifest]=useState<VendorManifest|null>(null);
  const [installed,setInstalled]=useState<string[]>([]);
  const [query,setQuery]=useState('');
  const [error,setError]=useState('');
  const [source,setSource]=useState<{title:string;content:string;path:string}|null>(null);
  const [busyId,setBusyId]=useState('');
  const [notice,setNotice]=useState('');
  const refresh=useCallback(()=>setInstalled(projectId?getProjectMeta(projectId).installedLibraryIds:[]),[projectId]);

  useEffect(()=>{refresh();const listener=()=>refresh();window.addEventListener(LIBRARY_CHANGED_EVENT,listener);window.addEventListener('storage',listener);return()=>{window.removeEventListener(LIBRARY_CHANGED_EVENT,listener);window.removeEventListener('storage',listener);};},[refresh]);
  useEffect(()=>{let active=true;void fetch('/vendor/shadcnspace/manifest.json',{cache:'no-store'}).then(async(response)=>{if(!response.ok)throw new Error('Offline UI snapshot is not synced yet.');const value=await response.json() as VendorManifest;if(active)setManifest(value);}).catch((cause)=>active&&setError(cause instanceof Error?cause.message:'Project UI library unavailable.'));return()=>{active=false;};},[]);

  const items=useMemo(()=>{const q=query.trim().toLowerCase();const ids=new Set(installed);return (manifest?.items??[]).filter((item)=>ids.has(item.name)&&(!q||`${item.title} ${item.name} ${item.kind} ${item.description}`.toLowerCase().includes(q)));},[installed,manifest,query]);
  const remove=(name:string)=>{const next=installed.filter((item)=>item!==name);setInstalled(next);saveProjectMeta(projectId,{installedLibraryIds:next});window.dispatchEvent(new Event(LIBRARY_CHANGED_EVENT));};
  const viewSource=async(item:VendorItem)=>{try{const value=await readPrimarySource(item);setSource({title:item.title,content:value.content||'No readable source file is registered for this item.',path:value.path});}catch(cause){setSource({title:item.title,content:cause instanceof Error?cause.message:'Unable to read the local vendored source file.',path:item.files[0]?.target||item.files[0]?.path||'—'});}};
  const copyPath=async()=>{if(!source)return;try{await navigator.clipboard.writeText(source.path);}catch{/* Clipboard can be blocked by browser permissions. */}};
  const useItem=async(item:VendorItem)=>{
    if(busyId)return;
    setBusyId(item.name);setNotice('');
    try{
      let sourceText='';
      if(item.kind==='theme'){
        try{sourceText=(await readPrimarySource(item)).content;}catch{/* Theme adapter falls back to neutral tokens if the local CSS cannot be read. */}
        const theme=createNativeVendorTheme(item,sourceText);
        dispatchProjectUiRuntime({action:'theme',theme});
        setNotice(`${item.title} applied to the current project. You can undo it from the editor toolbar.`);
      }else{
        const workspace=await loadLastWorkspace();
        const pageId=workspace?.id===projectId?workspace.activePageId:undefined;
        const nodes=buildNativeVendorNodes(item);
        dispatchProjectUiRuntime({action:'insert',pageId,nodes});
        setNotice(`${item.title} inserted as editable Nila UI. Switch back to the canvas to customize it.`);
      }
    }catch(cause){setNotice(cause instanceof Error?cause.message:'Unable to use this Project UI item.');}
    finally{setBusyId('');}
  };

  if(error)return <div className="project-ui-empty"><PackageCheck size={22}/><strong>Project UI unavailable</strong><p>{error}</p><small>Run <code>npm run vendor:sync</code> once while online.</small></div>;
  if(!manifest)return <div className="project-ui-empty"><PackageCheck size={22}/><strong>Loading project UI…</strong></div>;
  if(!installed.length)return <div className="project-ui-empty"><PackageCheck size={22}/><strong>No Offline UI added yet</strong><p>Open Offline UI, choose a component, block, animation, or theme, then click Add to project. It will appear here as usable Project UI.</p></div>;

  return <div className="project-ui-library">
    <div className="project-ui-summary"><CheckCircle2 size={16}/><div><strong>{installed.length} item{installed.length===1?'':'s'} ready</strong><span>Insert UI into the canvas or apply a theme directly to the project.</span></div></div>
    {notice?<div className="offline-installed-note"><CheckCircle2 size={12}/>{notice}</div>:null}
    <div className="catalog-search"><Search size={14}/><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Search project UI"/></div>
    <div className="project-ui-list">{items.map((item)=><article className="project-ui-card" key={item.name}><div className="project-ui-card-head"><span>{item.kind}</span><strong>{item.title}</strong></div><p>{item.description||item.name}</p><small>{item.files.length} source file{item.files.length===1?'':'s'} · {item.dependencies.length} package dep{item.dependencies.length===1?'':'s'}</small><div className="project-ui-actions"><button type="button" className="primary" disabled={Boolean(busyId)} onClick={()=>void useItem(item)}>{item.kind==='theme'?<><Paintbrush size={13}/>{busyId===item.name?'Applying…':'Apply theme'}</>:<><Plus size={13}/>{busyId===item.name?'Inserting…':'Insert'}</>}</button><button type="button" onClick={()=>void viewSource(item)}><Code2 size={13}/> Source</button><button type="button" className="danger" onClick={()=>remove(item.name)}><Trash2 size={13}/> Remove</button></div></article>)}</div>
    {source?<div className="offline-source project-ui-source"><div><strong>{source.title}</strong><button type="button" onClick={()=>setSource(null)}>Close</button></div><div className="project-ui-path"><code>{source.path}</code><button type="button" onClick={()=>void copyPath()} title="Copy source path"><Copy size={12}/></button></div><p>Source is kept for attribution, inspection, and export. Nila uses a safe native adapter for the visual editor instead of executing arbitrary vendored TSX.</p><pre>{source.content}</pre></div>:null}
  </div>;
}
