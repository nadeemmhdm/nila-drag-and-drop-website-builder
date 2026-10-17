import { Download, ExternalLink, Github, Maximize2, PackageCheck, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { generateProjectFiles } from '../../exporter/projectGenerator';
import { pushFilesToGitHub } from '../../exporter/githubExport';
import { generatePreviewDocument } from '../../exporter/preview';
import { downloadZip } from '../../exporter/zipExport';
import type { ExportFile, ExportProjectInput } from '../../exporter/types';
import { loadInstalledVendorFiles } from '../../library/vendorExport';
import './ExportPanel.css';

interface Props { input: ExportProjectInput; activePageId?: string; projectId: string; }
const safeZipName=(value:string)=>value.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'nila-site';

export function ExportPanel({input,activePageId,projectId}:Props){
  const baseFiles=useMemo(()=>generateProjectFiles(input),[input]);
  const [vendorFiles,setVendorFiles]=useState<ExportFile[]>([]);
  const [vendorLoading,setVendorLoading]=useState(true);
  const [vendorError,setVendorError]=useState('');
  const files=useMemo(()=>[...baseFiles,...vendorFiles],[baseFiles,vendorFiles]);
  const preview=useMemo(()=>generatePreviewDocument(input,activePageId),[input,activePageId]);
  const [fullPreview,setFullPreview]=useState(false);
  const [owner,setOwner]=useState(''); const [repo,setRepo]=useState(''); const [branch,setBranch]=useState('main'); const [pathPrefix,setPathPrefix]=useState(''); const [token,setToken]=useState(''); const [status,setStatus]=useState(''); const [busy,setBusy]=useState(false); const [commitUrl,setCommitUrl]=useState('');

  useEffect(()=>{
    let active=true;
    setVendorLoading(true);
    setVendorError('');
    void loadInstalledVendorFiles(projectId).then((next)=>{if(active)setVendorFiles(next);}).catch((error)=>{if(active){setVendorFiles([]);setVendorError(error instanceof Error?error.message:'Unable to prepare installed offline library source.');}}).finally(()=>{if(active)setVendorLoading(false);});
    return()=>{active=false;};
  },[projectId]);

  const download=()=>{if(vendorLoading||vendorError)return;downloadZip(files,`${safeZipName(input.projectName)}.zip`);};
  const push=async()=>{if(vendorLoading||vendorError)return;setBusy(true);setStatus('Pushing generated project…');setCommitUrl('');try{const result=await pushFilesToGitHub(files,{owner,repo,branch,pathPrefix,token,commitMessage:'Export website from Nila Website Builder'});setStatus(`Pushed commit ${result.sha.slice(0,7)}`);setCommitUrl(result.url);setToken('');}catch(error){setStatus(error instanceof Error?error.message:'GitHub export failed.');}finally{setBusy(false)}};
  return <div className="export-panel">
    <section className="export-card"><div className="export-card-title"><PackageCheck size={17}/><div><strong>Production project</strong><span>{vendorLoading?'Preparing files…':`${files.length} generated files`}</span></div></div><p>Standalone React + Vite + TypeScript SPA with pages under <code>src/pages</code>, local assets, SEO files, Nila provenance, and the public offline UI source packages added to this project.</p>{vendorFiles.length>0?<small>{vendorFiles.length} vendored ShadcnSpace source/license files will be included under <code>vendor/shadcnspace</code>. Remove a library item from Offline UI to exclude it.</small>:null}{vendorError?<div className="export-status">{vendorError}</div>:null}<button type="button" className="export-primary" disabled={vendorLoading||Boolean(vendorError)} onClick={download}><Download size={15}/> {vendorLoading?'Preparing…':'Download ZIP'}</button></section>
    <section className="export-card"><div className="export-card-title"><Maximize2 size={17}/><div><strong>Sandbox preview</strong><span>Isolated iframe</span></div></div><div className="mini-preview"><iframe title="Generated website preview" sandbox="allow-scripts allow-forms" srcDoc={preview}/></div><button type="button" onClick={()=>setFullPreview(true)}>Open full preview</button></section>
    <section className="export-card"><div className="export-card-title"><Github size={17}/><div><strong>GitHub export</strong><span>Atomic tree + commit</span></div></div><label>Owner<input value={owner} onChange={e=>setOwner(e.target.value)} autoComplete="off"/></label><label>Repository<input value={repo} onChange={e=>setRepo(e.target.value)} autoComplete="off"/></label><div className="export-pair"><label>Branch<input value={branch} onChange={e=>setBranch(e.target.value)} /></label><label>Subdirectory<input value={pathPrefix} placeholder="optional" onChange={e=>setPathPrefix(e.target.value)} /></label></div><label>GitHub token<input type="password" value={token} onChange={e=>setToken(e.target.value)} autoComplete="new-password" placeholder="Fine-grained token"/></label><small>Token stays in component memory only and is cleared after a successful push. It is never added to generated files.</small><button type="button" className="export-primary" disabled={busy||vendorLoading||Boolean(vendorError)||!token||!owner||!repo} onClick={push}><Github size={15}/>{busy?'Pushing…':'Push to GitHub'}</button>{status?<div className="export-status">{status}</div>:null}{commitUrl?<a className="export-commit" href={commitUrl} target="_blank" rel="noreferrer"><ExternalLink size={13}/> Open commit</a>:null}</section>
    {fullPreview?<div className="preview-modal"><div className="preview-modal-bar"><strong>Generated site preview</strong><button type="button" onClick={()=>setFullPreview(false)}><X size={18}/></button></div><iframe title="Full generated website preview" sandbox="allow-scripts allow-forms" srcDoc={preview}/></div>:null}
  </div>;
}
