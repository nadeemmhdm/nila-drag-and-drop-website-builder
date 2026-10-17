import * as ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { generateProjectFiles } from '../src/exporter/projectGenerator';
import { createDefaultPageSeo } from '../src/seo/defaults';
import { makeWorkspace } from './fixture';

function exportFixture() {
  const workspace = makeWorkspace();
  workspace.pages.push({ id:'about', name:'About', slug:'about', isHome:false, nodes:[], seo:createDefaultPageSeo('About') });
  return { projectName:workspace.name, pages:workspace.pages, assets:workspace.assets, fonts:workspace.fonts, seo:workspace.seo };
}
function generatedFiles(){return Object.fromEntries(generateProjectFiles(exportFixture()).map((file)=>[file.path,file]));}

describe('generated React project',()=>{
  it('exports one Vite HTML shell and React TypeScript pages',()=>{
    const files=generatedFiles();
    expect(files['index.html']).toBeTruthy();
    expect(files['about/index.html']).toBeUndefined();
    expect(files['src/App.tsx']).toBeTruthy();
    expect(files['src/components/PageView.tsx']).toBeTruthy();
    expect(files['src/pages/HomePage.tsx']).toBeTruthy();
    expect(files['src/pages/AboutPage.tsx']).toBeTruthy();
    expect(String(files['src/App.tsx'].content)).toContain('path:"/about"');
    expect(String(files['vite.config.ts'].content)).not.toContain('rollupOptions');
    expect(String(files['package.json'].content)).toContain('vite');
    expect(files['public/_redirects']).toBeTruthy();
  });
  it('keeps SEO, provenance and generated source metadata',()=>{
    const files=generatedFiles();
    expect(files['public/robots.txt']).toBeTruthy();
    expect(files['public/sitemap.xml']).toBeTruthy();
    expect(files['public/llms.txt']).toBeTruthy();
    expect(files['public/.well-known/security.txt']).toBeTruthy();
    expect(files['.nila/project.json']).toBeTruthy();
    expect(String(files['README.md'].content)).toContain('React + Vite + TypeScript');
  });
  it('emits syntactically valid generated TSX',()=>{
    const files=generatedFiles();
    const paths=Object.keys(files).filter((path)=>path.endsWith('.tsx'));
    const errors=paths.flatMap((path)=>{
      const result=ts.transpileModule(String(files[path].content),{fileName:path,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX}});
      return (result.diagnostics??[]).filter((diagnostic)=>diagnostic.category===ts.DiagnosticCategory.Error).map((diagnostic)=>`${path}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText,' ')}`);
    });
    expect(errors).toEqual([]);
  });
});
