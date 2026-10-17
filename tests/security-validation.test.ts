import { describe, expect, it } from 'vitest';
import { MAX_TOTAL_ASSET_BYTES } from '../src/editor/assetPipeline';
import { validateWorkspaceSnapshot } from '../src/security/validation';
import { makeWorkspace } from './fixture';

const tinyPng='data:image/png;base64,'+btoa(String.fromCharCode(0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a));

describe('workspace validation',()=>{
  it('accepts a current valid workspace',()=>{const workspace=makeWorkspace();expect(validateWorkspaceSnapshot(workspace).id).toBe(workspace.id);});
  it('rejects workspaces without exactly one home page',()=>{const workspace=makeWorkspace();workspace.pages[0].isHome=false;expect(()=>validateWorkspaceSnapshot(workspace)).toThrow(/home page/i);});
  it('rejects future schema versions',()=>{const workspace=makeWorkspace();workspace.schemaVersion+=100;expect(()=>validateWorkspaceSnapshot(workspace)).toThrow(/schema version/i);});
  it('rejects traversal-style asset paths',()=>{const workspace=makeWorkspace();workspace.assets.push({id:crypto.randomUUID(),name:'image.png',fileName:'image.png',kind:'image',mimeType:'image/png',size:8,dataUrl:tinyPng,projectPath:'../../image.png',createdAt:new Date().toISOString()});expect(()=>validateWorkspaceSnapshot(workspace)).toThrow(/project path/i);});
  it('rejects projects over the total asset budget',()=>{const workspace=makeWorkspace();workspace.assets.push({id:crypto.randomUUID(),name:'image.png',fileName:'image.png',kind:'image',mimeType:'image/png',size:MAX_TOTAL_ASSET_BYTES+1,dataUrl:tinyPng,projectPath:'src/assets/media/image.png',createdAt:new Date().toISOString()});expect(()=>validateWorkspaceSnapshot(workspace)).toThrow();});
});
