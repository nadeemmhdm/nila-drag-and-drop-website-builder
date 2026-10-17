import { CheckCircle2, Code2, Copy, PackageCheck, Search, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getProjectMeta, saveProjectMeta } from '../projects/projectMeta';

type LibraryKind = 'component' | 'block' | 'animated' | 'theme';
interface VendorFile { path:string; target:string; type:string; url:string }
interface VendorItem { name:string; title:string; description:string; type:string; kind:LibraryKind; dependencies:string[]; registryDependencies:string[]; files:VendorFile[] }
interface VendorManifest { source:string; revision:string; license:string; items:VendorItem[] }

export const LIBRARY_CHANGED_EVENT = 'nila:library-changed';

export function ProjectUiLibrary({ projectId }: { projectId: string }) {
  const [manifest,setManifest]=useState<VendorManifest|null>(null);
  const [installed,setInstalled]=useState<string[]>([]);
  const [query,setQuery]=useState('');
  const [error,setError]=useState('');
  const [source,setSource]=useState<{title:string;content:string;path:string}|null>(null);
  const refresh=useCallback(()=>setInstalled(projectId?getProjectMeta(projectId).installedLibraryIds:[]),[projectId]);

  useEffect(()=>{refresh();const listener=()=>refresh();window.addEventListener(LIBRARY_CHANGED_EVENT,listener);window.addEventListener('storage',listener);return()=>{window.removeEventListener(LIBRARY_CHANGED_EVENT,listener);window.removeEventListener('storage',listener);};},[refresh]);
  useEffect(()=>{let active=true;void fetch('/vendor/shadcnspace/manifest.json',{cache:'no-store'}).then(async(response)=>{if(!response.ok)throw new Error('Offline UI snapshot is not synced yet.');const value=await response.json() as VendorManifest;if(active)setManifest(value);}).catch((cause)=>active&&setError(cause instanceof Error?cause.message:'Project UI library unavailable.'));return()=>{active=false;};},[]);

  const items=useMemo(()=>{const q=query.trim().toLowerCase();const ids=new Set(installed);return (manifest?.items??[]).filter((item)=>ids.has(item.name)&&(!q||`${item.title} ${item.name} ${item.kind} ${item.description}`.toLowerCase().includes(q)));},[installed,manifest,query]);
  const remove=(name:string)=>{const next=installed.filter((item)=>item!==name);setInstalled(next);saveProjectMeta(projectId,{installedLibraryIds:next});window.dispatchEvent(new Event(LIBRARY_CHANGED_EVENT));};
  const viewSource=async(item:VendorItem)=>{const file=item.files[0];if(!file){setSource({title:item.title,content:'No source file is registered for this item.',path:'—'});return;}try{const response=await fetch(file.url,{cache:'no-store'});if(!response.ok)throw new Error();setSource({title:item.title,content:await response.text(),path:file.target||file.path});}catch{setSource({title:item.title,content:'Unable to read the local vendored source file.',path:file.target||file.path});}};
  const copyPath=async()=>{if(!source)return;try{await navigator.clipboard.writeText(source.path);}catch{/* Clipboard can be blocked by browser permissions. */}};

  if(error)return <div className="project-ui-empty"><PackageCheck size={22}/><strong>Project UI unavailable</strong><p>{error}</p><small>Run <code>npm run vendor:sync</code> once while online.</small></div>;
  if(!manifest)return <div className="project-ui-empty"><PackageCheck size={22}/><strong>Loading project UI…</strong></div>;
  if(!installed.length)return <div className="project-ui-empty"><PackageCheck size={22}/><strong>No Offline UI added yet</strong><p>Open Offline UI, choose a component or theme, then click Add to project. It will appear here and its source will be included in ZIP/GitHub export.</p></div>;

  return <div className="project-ui-library">
    <div className="project-ui-summary"><CheckCircle2 size={16}/><div><strong>{installed.length} item{installed.length===1?'':'s'} added</strong><span>Available in this project and included with export source.</span></div></div>
    <div className="catalog-search"><Search size={14}/><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Search project UI"/></div>
    <div className="project-ui-list">{items.map((item)=><article className="project-ui-card" key={item.name}><div className="project-ui-card-head"><span>{item.kind}</span><strong>{item.title}</strong></div><p>{item.description||item.name}</p><small>{item.files.length} source file{item.files.length===1?'':'s'} · {item.dependencies.length} package dep{item.dependencies.length===1?'':'s'}</small><div className="project-ui-actions"><button type="button" onClick={()=>void viewSource(item)}><Code2 size={13}/> Use / source</button><button type="button" className="danger" onClick={()=>remove(item.name)}><Trash2 size={13}/> Remove</button></div></article>)}</div>
    {source?<div className="offline-source project-ui-source"><div><strong>{source.title}</strong><button type="button" onClick={()=>setSource(null)}>Close</button></div><div className="project-ui-path"><code>{source.path}</code><button type="button" onClick={()=>void copyPath()} title="Copy integration path"><Copy size={12}/></button></div><p>This vendored source is included with generated project export. Integrate it intentionally in the generated React app; Nila does not execute arbitrary vendored TSX inside the visual editor.</p><pre>{source.content}</pre></div>:null}
  </div>;
}
