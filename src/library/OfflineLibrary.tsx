import { Check, Code2, Download, Library, PackageCheck, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { loadLastWorkspace } from '../workspace/storage';
import { getProjectMeta, saveProjectMeta } from '../projects/projectMeta';
import { LIBRARY_CHANGED_EVENT } from './ProjectUiLibrary';

type LibraryKind = 'component' | 'block' | 'animated' | 'theme';
interface VendorFile { path:string; target:string; type:string; url:string }
interface VendorItem { name:string; title:string; description:string; type:string; kind:LibraryKind; dependencies:string[]; registryDependencies:string[]; files:VendorFile[] }
interface VendorManifest { source:string; revision:string; license:string; itemCount:number; fileCount:number; items:VendorItem[] }

export function OfflineLibrary({ kinds, projectId: suppliedProjectId }: { kinds?: LibraryKind[]; projectId?: string }) {
  const [manifest,setManifest]=useState<VendorManifest|null>(null);
  const [error,setError]=useState('');
  const [query,setQuery]=useState('');
  const [kind,setKind]=useState<'all'|LibraryKind>('all');
  const [projectId,setProjectId]=useState(suppliedProjectId??'');
  const [installed,setInstalled]=useState<string[]>([]);
  const [source,setSource]=useState<{title:string;content:string}|null>(null);

  useEffect(()=>{void fetch('/vendor/shadcnspace/manifest.json',{cache:'no-store'}).then(async(res)=>{if(!res.ok)throw new Error('Offline library snapshot is not synced yet.');setManifest(await res.json() as VendorManifest);}).catch((reason)=>setError(reason instanceof Error?reason.message:'Offline library is unavailable.'));if(suppliedProjectId){setProjectId(suppliedProjectId);setInstalled(getProjectMeta(suppliedProjectId).installedLibraryIds);return;}void loadLastWorkspace().then((workspace)=>{if(!workspace)return;setProjectId(workspace.id);setInstalled(getProjectMeta(workspace.id).installedLibraryIds);});},[suppliedProjectId]);
  const allowedKinds=kinds?.length?kinds:['component','block','animated','theme'];
  const filtered=useMemo(()=>{const q=query.trim().toLowerCase();return (manifest?.items??[]).filter((item)=>allowedKinds.includes(item.kind)&&(kind==='all'||item.kind===kind)&&(!q||`${item.title} ${item.name} ${item.description} ${item.kind}`.toLowerCase().includes(q)));},[allowedKinds,kind,manifest,query]);
  const toggle=(name:string)=>{if(!projectId)return;const next=installed.includes(name)?installed.filter((item)=>item!==name):[...installed,name];setInstalled(next);saveProjectMeta(projectId,{installedLibraryIds:next});window.dispatchEvent(new Event(LIBRARY_CHANGED_EVENT));};
  const viewSource=async(item:VendorItem)=>{const file=item.files[0];if(!file){setSource({title:item.title,content:'No local source file is listed for this item.'});return;}try{const res=await fetch(file.url);if(!res.ok)throw new Error();setSource({title:`${item.title} · ${file.path}`,content:await res.text()});}catch{setSource({title:item.title,content:'Unable to read the local vendored source file.'});}};
  if(error)return <div className="offline-library-empty"><Library size={24}/><strong>Offline UI library is not synced</strong><p>{error}</p><code>npm run vendor:sync</code><span>Run once while online. After that the source works offline.</span></div>;
  if(!manifest)return <div className="offline-library-empty"><Download size={22}/><strong>Loading local UI library…</strong></div>;
  const kindsAvailable=(['component','block','animated','theme'] as LibraryKind[]).filter((item)=>allowedKinds.includes(item));
  return <div className="offline-library"><div className="offline-library-head"><div><span><PackageCheck size={14}/> OFFLINE · {manifest.license}</span><strong>{manifest.itemCount} public items</strong><small>{installed.length} added to this project · snapshot {manifest.revision.slice(0,7)}</small></div></div><div className="catalog-search"><Search size={14}/><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Search offline source library"/></div><div className="offline-kind-tabs"><button className={kind==='all'?'active':''} onClick={()=>setKind('all')} type="button">All</button>{kindsAvailable.map((item)=><button className={kind===item?'active':''} onClick={()=>setKind(item)} type="button" key={item}>{item}</button>)}</div><div className="offline-library-list">{filtered.map((item)=>{const isInstalled=installed.includes(item.name);return <article key={item.name} className={`offline-item${isInstalled?' installed-card':''}`}><div className="offline-item-title"><span>{item.kind}</span><strong>{item.title}</strong></div><p>{item.description||item.name}</p><small>{item.files.length} source files · {item.dependencies.length} package deps</small><div className="offline-item-actions"><button type="button" onClick={()=>void viewSource(item)}><Code2 size={13}/> Source</button><button type="button" className={isInstalled?'installed':''} onClick={()=>toggle(item.name)}>{isInstalled?<><Trash2 size={13}/> Remove</>:<><Check size={13}/> Add to project</>}</button></div>{isInstalled?<div className="offline-installed-note"><Check size={11}/> Visible under Elements → Project UI and included in export.</div>:null}</article>})}</div>{source?<div className="offline-source"><div><strong>{source.title}</strong><button type="button" onClick={()=>setSource(null)}>Close</button></div><pre>{source.content}</pre></div>:null}</div>;
}
