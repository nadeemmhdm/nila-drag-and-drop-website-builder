import type { ExportFile, GitHubExportOptions } from './types';

const API = 'https://api.github.com';
const clean = (value: string) => value.trim().replace(/^\/+|\/+$/g, '');

function toBase64(content: string | Uint8Array): string {
  const bytes = typeof content === 'string' ? new TextEncoder().encode(content) : content;
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(binary);
}

async function request<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API}${path}`, { ...init, headers:{ Accept:'application/vnd.github+json', Authorization:`Bearer ${token}`, 'X-GitHub-Api-Version':'2022-11-28', 'Content-Type':'application/json', ...(init.headers || {}) } });
  if (!response.ok) { const text = await response.text(); throw new Error(`GitHub ${response.status}: ${text.slice(0, 400)}`); }
  return response.json() as Promise<T>;
}

export async function pushFilesToGitHub(files: ExportFile[], options: GitHubExportOptions): Promise<{sha:string; url:string}> {
  const owner=clean(options.owner); const repo=clean(options.repo); const branch=clean(options.branch)||'main'; const prefix=clean(options.pathPrefix);
  if(!owner||!repo||!options.token.trim()) throw new Error('Owner, repository and token are required.');
  const repoInfo = await request<{default_branch:string}>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, options.token);
  let baseRef: {object:{sha:string}};
  try { baseRef=await request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/ref/heads/${encodeURIComponent(branch)}`, options.token); }
  catch { const source=await request<{object:{sha:string}}>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/ref/heads/${encodeURIComponent(repoInfo.default_branch)}`, options.token); await request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/refs`, options.token, {method:'POST',body:JSON.stringify({ref:`refs/heads/${branch}`,sha:source.object.sha})}); baseRef={object:{sha:source.object.sha}}; }
  const baseCommit=await request<{tree:{sha:string}}>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/commits/${baseRef.object.sha}`, options.token);
  const tree: Array<{path:string;mode:string;type:string;sha:string}> = [];
  for (const file of files) {
    const blob=await request<{sha:string}>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/blobs`, options.token, {method:'POST',body:JSON.stringify({content:toBase64(file.content),encoding:'base64'})});
    tree.push({path:prefix?`${prefix}/${file.path}`:file.path,mode:'100644',type:'blob',sha:blob.sha});
  }
  const nextTree=await request<{sha:string}>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees`, options.token, {method:'POST',body:JSON.stringify({base_tree:baseCommit.tree.sha,tree})});
  const commit=await request<{sha:string;html_url:string}>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/commits`, options.token, {method:'POST',body:JSON.stringify({message:options.commitMessage||'Export site from Nila Website Builder',tree:nextTree.sha,parents:[baseRef.object.sha]})});
  await request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/refs/heads/${encodeURIComponent(branch)}`, options.token, {method:'PATCH',body:JSON.stringify({sha:commit.sha,force:false})});
  return {sha:commit.sha,url:commit.html_url};
}
