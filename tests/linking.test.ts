import { describe, expect, it } from 'vitest';
import { normalizeAnchor, normalizeSlug, resolveLink, safeExternalUrl, uniqueSlug } from '../src/editor/linking';
import { makeWorkspace } from './fixture';

describe('safe link handling',()=>{
  it('blocks executable and local URL schemes',()=>{for(const value of ['javascript:alert(1)','data:text/html,x','vbscript:msgbox(1)','file:///etc/passwd'])expect(safeExternalUrl(value)).toBe('#');});
  it('normalizes ordinary external links to HTTPS',()=>{expect(safeExternalUrl('example.com/path')).toBe('https://example.com/path');});
  it('normalizes route and anchor identifiers',()=>{expect(normalizeSlug(' About Us! ')).toBe('about-us');expect(normalizeAnchor('#Pricing & Plans')).toBe('pricing-plans');});
  it('generates unique slugs',()=>{const pages=makeWorkspace().pages;expect(uniqueSlug('home',pages)).toBe('home-2');});
  it('adds noopener noreferrer to new-tab links',()=>{const result=resolveLink({linkType:'external',href:'https://example.com',newTab:true},makeWorkspace().pages);expect(result.target).toBe('_blank');expect(result.rel).toBe('noopener noreferrer');});
});
