import type { ExportFile, GitHubExportOptions } from './types';

const API='https://api.github.com';
const MAX_EXPORT_FILES=1_000;
const MAX_EXPORT_BYTES=120*1024*1024;
class GitHubRequestError extends Error { constructor(public status:number,message:string){super(message);this.name='GitHubRequestError';} }
const clean=(value:string)=>value.trim().replace(/^\/+|\/+$/g,'');
const byteLength=(content:string|Uint8Array)=>typeof content==='string'?new TextEncoder().encode(content).byteLength:content.byteLength;

export function validateGitHubDestination(ownerValue:string,repoValue:string,branchValue:string,prefixValue:string){
  const owner=clean(ownerValue);const repo=clean(repoValue);const branch=clean(branchValue)||'main';const prefix=clean(prefixValue);
  if(!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(owner))throw new Error('GitHub owner is invalid.');
  if(!/^[A-Za-z0-9_.-]{1,100}$/.test(repo)||repo==='.'||repo==='..')throw new Error('GitHub repository name is invalid.');
  if(branch.length>255||branch.startsWith('.')||branch.endsWith('.')||branch.includes('..')||branch.includes('@{')||branch.includes('\\')||branch.includes('//')||/[\x00-\x20~^:?*\[]/.test(branch))throw new Error('Git branch name is invalid.');
  if(prefix){if(prefix.length>240||prefix.includes('\\')||/[\x00-\x1f]/.test(prefix)||prefix.split('/').some(segment=>!segment||segment==='.'||segment==='..'||!/^[A-Za-z0-9._-]+$/.test(segment)))throw new Error('GitHub subdirectory is invalid.');}
  return {owner,repo,branch,prefix};
}

export function validateExportFiles(files:ExportFile[]){
  if(!files.length||files.length>MAX_EXPORT_FILES)throw new Error('Generated file count is outside the supported range.');let total=0;const seen=new Set<string>();
  for(const file of files){const path=file.path;if(!path||path.length>900||path.startsWith('/')||path.includes('\\')||path.split('/').some(segment=>!segment||segment==='.'||segment==='..')||/[\x00-\x1f]/.test(path))throw new Error('Generated project contains an unsafe file path.');if(seen.has(path))throw new Error('Generated project contains duplicate file paths.');seen.add(path);total+=byteLength(file.content);if(total>MAX_EXPORT_BYTES)throw new Error('Generated project exceeds the GitHub export size limit.');}
}

function toBase64(content:string|Uint8Array):string{const bytes=typeof content==='string'?new TextEncoder().encode(content):content;let binary='';const chunk=0x8000;for(let i=0;i<bytes.length;i+=chunk)binary+=String.fromCharCode(...bytes.subarray(i,i+chunk));return btoa(binary);}
async function request<T>(path:string,token:string,init:RequestInit={}):Promise<T>{const response=await fetch(`${API}${path}`,{...init,headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json',...(init.headers||{})}});if(!response.ok){let message='GitHub request failed.';try{const body=await response.json() as {message?:string};if(body.message)message=body.message.slice(0,300);}catch{/* do not surface arbitrary response bodies */}throw new GitHubRequestError(response.status,`GitHub ${response.status}: ${message}`);}return response.json() as Promise<T>;}

export async function pushFilesToGitHub(files:ExportFile[],options:GitHubExportOptions):Promise<{sha:string;url:string}>{
  validateExportFiles(files);const {owner,repo,branch,prefix}=validateGitHubDestination(options.owner,options.repo,options.branch,options.pathPrefix);const token=options.token.trim();if(!token)throw new Error('GitHub token is required.');
  const repoInfo=await request<{default_branch:string}>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,token);let baseRef:{object:{sha:string}};
  try{baseRef=await request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/ref/heads/${encodeURIComponent(branch)}`,token);}catch(error){if(!(error instanceof GitHubRequestError)||error.status!==404)throw error;const source=await request<{object:{sha:string}}>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/ref/heads/${encodeURIComponent(repoInfo.default_branch)}`,token);await request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/refs`,token,{method:'POST',body:JSON.stringify({ref:`refs/heads/${branch}`,sha:source.object.sha})});baseRef={object:{sha:source.object.sha}};}
  const baseCommit=await request<{tree:{sha:string}}>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/commits/${baseRef.object.sha}`,token);const tree:Array<{path:string;mode:string;type:string;sha:string}>=[];
  for(const file of files){const blob=await request<{sha:string}>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/blobs`,token,{method:'POST',body:JSON.stringify({content:toBase64(file.content),encoding:'base64'})});tree.push({path:prefix?`${prefix}/${file.path}`:file.path,mode:'100644',type:'blob',sha:blob.sha});}
  const nextTree=await request<{sha:string}>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees`,token,{method:'POST',body:JSON.stringify({base_tree:baseCommit.tree.sha,tree})});const message=(options.commitMessage||'Export site from Nila Website Builder').trim().slice(0,500);
  const commit=await request<{sha:string;html_url:string}>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/commits`,token,{method:'POST',body:JSON.stringify({message,tree:nextTree.sha,parents:[baseRef.object.sha]})});await request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/refs/heads/${encodeURIComponent(branch)}`,token,{method:'PATCH',body:JSON.stringify({sha:commit.sha,force:false})});return{sha:commit.sha,url:commit.html_url};
}
