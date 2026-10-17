import { describe, expect, it } from 'vitest';
import { generateLlmsTxt, generateRobotsTxt, generateSecurityTxt, generateSitemapXml } from '../src/seo/generators';
import { makeWorkspace } from './fixture';

describe('SEO/AEO/GEO generators',()=>{
  it('emits sitemap and robots references with absolute URLs',()=>{const ws=makeWorkspace();ws.seo.baseUrl='https://example.com';expect(generateRobotsTxt(ws.seo)).toContain('Sitemap: https://example.com/sitemap.xml');expect(generateSitemapXml(ws.seo,ws.pages)).toContain('<loc>https://example.com/</loc>');});
  it('respects global indexing disable',()=>{const ws=makeWorkspace();ws.seo.robots.allowIndexing=false;expect(generateRobotsTxt(ws.seo)).toContain('Disallow: /');});
  it('generates standard security contact and canonical fields',()=>{const ws=makeWorkspace();ws.seo.baseUrl='https://example.com';ws.seo.security.contact='mailto:security@example.com';ws.seo.security.expires='2027-10-17';const value=generateSecurityTxt(ws.seo);expect(value).toContain('Contact: mailto:security@example.com');expect(value).toContain('Canonical: https://example.com/.well-known/security.txt');});
  it('provides an AI-readable page listing',()=>{const ws=makeWorkspace();ws.seo.baseUrl='https://example.com';ws.seo.siteName='Example';expect(generateLlmsTxt(ws.seo,ws.pages)).toContain('# Example');expect(generateLlmsTxt(ws.seo,ws.pages)).toContain('[Home](https://example.com/)');});
});
