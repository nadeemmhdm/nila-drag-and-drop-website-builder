import { describe, expect, it } from 'vitest';
import { generateProjectFiles } from '../src/exporter/projectGenerator';
import { validateExportFiles, validateGitHubDestination } from '../src/exporter/githubExport';
import { buildZip } from '../src/exporter/zipExport';
import { makeWorkspace } from './fixture';

describe('project export',()=>{
  const input=()=>{const ws=makeWorkspace();ws.seo.baseUrl='https://example.com';return{projectName:ws.name,pages:ws.pages,assets:ws.assets,fonts:ws.fonts,seo:ws.seo};};
  it('generates standalone source, metadata and web discovery files',()=>{const files=generateProjectFiles(input());const paths=new Set(files.map(file=>file.path));for(const path of ['package.json','index.html','src/App.tsx','.nila/project.json','public/robots.txt','public/sitemap.xml','public/llms.txt','public/.well-known/security.txt'])expect(paths.has(path)).toBe(true);});
  it('creates a real ZIP archive',()=>{const zip=buildZip(generateProjectFiles(input()));expect(zip[0]).toBe(0x50);expect(zip[1]).toBe(0x4b);});
  it('rejects traversal paths before GitHub export',()=>{expect(()=>validateExportFiles([{path:'../secret',content:'x'}])).toThrow(/unsafe file path/i);});
  it('rejects invalid repository destinations and safe-normalizes valid ones',()=>{expect(()=>validateGitHubDestination('owner','repo','main','../outside')).toThrow(/subdirectory/i);expect(validateGitHubDestination('openai','example-repo','main','web')).toEqual({owner:'openai',repo:'example-repo',branch:'main',prefix:'web'});});
  it('does not place a GitHub credential in generated files',()=>{const joined=generateProjectFiles(input()).filter(file=>typeof file.content==='string').map(file=>file.content).join('\n');expect(joined).not.toMatch(/gh[pousr]_[A-Za-z0-9]{20,}/);expect(joined).not.toContain('Authorization: Bearer');});
});
