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
  it('emits complete generated TSX modules without nested generator literals',()=>{
    const files=generatedFiles();
    const app=String(files['src/App.tsx'].content);
    const pageView=String(files['src/components/PageView.tsx'].content);
    const home=String(files['src/pages/HomePage.tsx'].content);
    const about=String(files['src/pages/AboutPage.tsx'].content);
    expect(app).toContain('export default function App()');
    expect(app).toContain("import HomePage from './pages/HomePage';");
    expect(app).toContain("import AboutPage from './pages/AboutPage';");
    expect(pageView).toContain('export function PageView');
    expect(pageView).not.toContain('`meta[name=');
    expect(pageView).not.toContain('${name}');
    expect(pageView).toContain('All rights reserved.');
    expect(pageView).toContain('Built with Nila Website Builder');
    expect(home).toContain('export default function HomePage()');
    expect(about).toContain('export default function AboutPage()');
  });
  it('exports uploaded media only through public assets and supports favicon',()=>{
    const input=exportFixture();
    input.assets.push({id:'logo-asset',name:'logo.png',fileName:'logo.png',kind:'image',mimeType:'image/png',size:8,dataUrl:'data:image/png;base64,iVBORw0KGgo=',projectPath:'public/assets/media/logo.png',createdAt:new Date().toISOString()});
    input.seo.faviconAssetId='logo-asset';
    input.seo.browserTitle='Custom Browser Title';
    const files=Object.fromEntries(generateProjectFiles(input).map((file)=>[file.path,file]));
    expect(files['public/assets/media/logo.png']).toBeTruthy();
    expect(files['src/assets/media/logo.png']).toBeUndefined();
    expect(String(files['src/assets.ts'].content)).toContain('/assets/media/logo.png');
    expect(String(files['index.html'].content)).toContain('rel="icon"');
    expect(String(files['index.html'].content)).toContain('/assets/media/logo.png');
  });
  it('preserves advanced list, emoji, media and form controls in generated renderer',()=>{
    const pageView=String(generatedFiles()['src/components/PageView.tsx'].content);
    expect(pageView).toContain("p.iconMode==='emoji'");
    expect(pageView).toContain("p.listStyle==='mixed'");
    expect(pageView).toContain('p.caption');
    expect(pageView).toContain("p.loading==='eager'");
    expect(pageView).toContain('p.inputType');
    expect(pageView).toContain('p.fieldName');
    expect(pageView).toContain('p.required');
    expect(pageView).toContain('p.rows');
  });
  it('exports responsive hamburger navigation and hover motion',()=>{
    const files=generatedFiles();
    const pageView=String(files['src/components/PageView.tsx'].content);
    const css=String(files['src/styles.css'].content);
    expect(pageView).toContain('function ResponsiveNav');
    expect(pageView).toContain('nila-site-nav-toggle');
    expect(pageView).toContain('aria-expanded={open}');
    expect(pageView).toContain('data-nila-internal="true"');
    expect(css).toContain('@media(max-width:900px)');
    expect(css).toContain('.nila-site-nav.open .nila-site-nav-links');
    expect(css).toContain('.nila-node:hover');
    expect(css).toContain('--nila-hover-transform');
    expect(css).toContain('prefers-reduced-motion');
  });
});
