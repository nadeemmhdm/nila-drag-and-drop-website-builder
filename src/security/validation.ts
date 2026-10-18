import { PROJECT_SCHEMA_VERSION } from '../core/constants';
import { MAX_TOTAL_ASSET_BYTES } from '../editor/assetPipeline';
import type { WorkspaceSnapshot } from '../workspace/types';

export const MAX_WORKSPACE_IMPORT_BYTES = 120 * 1024 * 1024;
export const MAX_PAGES = 100;
export const MAX_NODES = 10_000;
export const MAX_NODE_DEPTH = 32;
export const MAX_ASSETS = 256;

const NODE_TYPES = new Set(['section','container','div','row','columns','grid','card','heading','paragraph','link','button','badge','icon','image','avatar','video','quote','list','divider','spacer','input','textarea','select','checkbox','halftone-footer']);
const ASSET_EXTENSIONS: Record<string, 'image'|'video'|'font'> = { png:'image',jpg:'image',jpeg:'image',webp:'image',gif:'image',mp4:'video',webm:'video',woff2:'font',woff:'font',ttf:'font',otf:'font' };
const DANGEROUS_KEYS = new Set(['__proto__','prototype','constructor']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object.`);
  return value as Record<string, unknown>;
}
function text(value: unknown, label: string, max = 100_000): string {
  if (typeof value !== 'string' || value.length > max) throw new Error(`${label} is invalid or too large.`);
  return value;
}
function optionalText(value: unknown, label: string, max = 100_000): string | undefined { return value === undefined ? undefined : text(value,label,max); }
function bool(value: unknown, label: string): boolean { if (typeof value !== 'boolean') throw new Error(`${label} must be boolean.`); return value; }
function safeKeys(value: Record<string, unknown>, label: string, maxKeys = 100) {
  const keys = Object.keys(value);
  if (keys.length > maxKeys) throw new Error(`${label} contains too many fields.`);
  if (keys.some((key) => DANGEROUS_KEYS.has(key))) throw new Error(`${label} contains a forbidden key.`);
}
function stringArray(value: unknown, label: string, maxItems = 500, maxText = 20_000): string[] {
  if (!Array.isArray(value) || value.length > maxItems) throw new Error(`${label} must be a bounded array.`);
  for (const item of value) text(item, label, maxText);
  return value as string[];
}
function extension(name: string) { return name.split('.').pop()?.toLowerCase() ?? ''; }
function validIso(value: unknown, label: string) { const v=text(value,label,64); if (Number.isNaN(Date.parse(v))) throw new Error(`${label} must be a valid date.`); }

function validateStyles(value: unknown, label: string) {
  const styles=record(value,label); safeKeys(styles,label,3);
  for (const viewport of ['desktop','tablet','mobile']) {
    const style=record(styles[viewport],`${label}.${viewport}`); safeKeys(style,`${label}.${viewport}`,120);
    for (const [key,val] of Object.entries(style)) {
      if (DANGEROUS_KEYS.has(key) || key.length > 80) throw new Error(`${label} contains an unsafe style key.`);
      if (typeof val !== 'string' && typeof val !== 'number') throw new Error(`${label}.${key} has an invalid value.`);
      if (typeof val === 'string' && val.length > 5_000) throw new Error(`${label}.${key} is too large.`);
    }
  }
}

function validateProps(value: unknown, label: string) {
  const props=record(value,label); safeKeys(props,label,64);
  for (const [key,val] of Object.entries(props)) {
    if (DANGEROUS_KEYS.has(key)) throw new Error(`${label} contains a forbidden key.`);
    if (val === null || val === undefined || typeof val === 'boolean' || typeof val === 'number') continue;
    if (typeof val === 'string') { if (val.length > 100_000) throw new Error(`${label}.${key} is too large.`); continue; }
    if (Array.isArray(val) && val.length <= 500 && val.every((item) => typeof item === 'string' && item.length <= 20_000)) continue;
    throw new Error(`${label}.${key} has an unsupported value.`);
  }
}

function validateNode(value: unknown, depth: number, state: { count: number }) {
  if (depth > MAX_NODE_DEPTH) throw new Error('Workspace node tree is too deeply nested.');
  const node=record(value,'node'); safeKeys(node,'node',12);
  text(node.id,'node.id',128); const type=text(node.type,'node.type',32); if(!NODE_TYPES.has(type)) throw new Error(`Unsupported node type: ${type}`);
  text(node.name,'node.name',500); validateProps(node.props,'node.props'); validateStyles(node.styles,'node.styles');
  if (node.locked !== undefined) bool(node.locked,'node.locked'); if (node.hidden !== undefined) bool(node.hidden,'node.hidden');
  if(!Array.isArray(node.children)||node.children.length>1_000) throw new Error('node.children is invalid.');
  state.count += 1; if(state.count>MAX_NODES) throw new Error('Workspace contains too many nodes.');
  for(const child of node.children) validateNode(child,depth+1,state);
}

function validatePageSeo(value: unknown) {
  const seo=record(value,'page.seo'); safeKeys(seo,'page.seo',24);
  for(const key of ['title','description','ogTitle','ogDescription','primaryTopic','answerSummary','entityName','audience','modifiedAt']) text(seo[key],`page.seo.${key}`,100_000);
  bool(seo.index,'page.seo.index'); bool(seo.follow,'page.seo.follow'); text(seo.schemaType,'page.seo.schemaType',40);
  stringArray(seo.keywords,'page.seo.keywords',100,500);
  if(!Array.isArray(seo.faqs)||seo.faqs.length>100) throw new Error('page.seo.faqs is invalid.');
  for(const faqValue of seo.faqs){const faq=record(faqValue,'FAQ');safeKeys(faq,'FAQ',2);text(faq.question,'FAQ question',10_000);text(faq.answer,'FAQ answer',50_000);}
  if(seo.ogImageAssetId!==undefined) text(seo.ogImageAssetId,'page.seo.ogImageAssetId',128);
  validIso(seo.modifiedAt,'page.seo.modifiedAt');
}

function validateSiteSeo(value: unknown) {
  const seo=record(value,'seo'); safeKeys(seo,'seo',24);
  for(const key of ['siteName','baseUrl','language','defaultDescription','author','organizationName','organizationUrl','llmsSummary']) text(seo[key],`seo.${key}`,100_000);
  optionalText(seo.browserTitle,'seo.browserTitle',1_000); optionalText(seo.copyrightText,'seo.copyrightText',4_000); optionalText(seo.faviconAssetId,'seo.faviconAssetId',128);
  stringArray(seo.socialProfiles,'seo.socialProfiles',100,2_000); stringArray(seo.topics,'seo.topics',100,2_000);
  if(seo.organizationLogoAssetId!==undefined) text(seo.organizationLogoAssetId,'seo.organizationLogoAssetId',128);
  const robots=record(seo.robots,'seo.robots'); bool(robots.allowIndexing,'seo.robots.allowIndexing'); stringArray(robots.disallow,'seo.robots.disallow',200,2_000);
  const security=record(seo.security,'seo.security');
  for(const key of ['contact','expires','encryption','acknowledgements','policy','hiring','preferredLanguages']) text(security[key],`seo.security.${key}`,10_000);
}

function signatureOk(dataUrl: string, ext: string): boolean {
  const comma=dataUrl.indexOf(','); if(comma<0||!dataUrl.slice(0,comma).toLowerCase().includes(';base64')) return false;
  try {
    const prefix=atob(dataUrl.slice(comma+1,comma+1+32));
    const bytes=Uint8Array.from(prefix,(char)=>char.charCodeAt(0));
    const ascii=(start:number,length:number)=>String.fromCharCode(...bytes.slice(start,start+length));
    if(ext==='png')return bytes[0]===0x89&&ascii(1,3)==='PNG';
    if(ext==='jpg'||ext==='jpeg')return bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff;
    if(ext==='gif')return ascii(0,4)==='GIF8';
    if(ext==='webp')return ascii(0,4)==='RIFF'&&ascii(8,4)==='WEBP';
    if(ext==='mp4')return ascii(4,4)==='ftyp';
    if(ext==='webm')return bytes[0]===0x1a&&bytes[1]===0x45&&bytes[2]===0xdf&&bytes[3]===0xa3;
    if(ext==='woff')return ascii(0,4)==='wOFF'; if(ext==='woff2')return ascii(0,4)==='wOF2'; if(ext==='otf')return ascii(0,4)==='OTTO';
    if(ext==='ttf')return (bytes[0]===0&&bytes[1]===1&&bytes[2]===0&&bytes[3]===0)||ascii(0,4)==='true';
    return false;
  } catch { return false; }
}

function validateAsset(value: unknown): { id: string; kind: string; size: number } {
  const asset=record(value,'asset'); safeKeys(asset,'asset',12);
  const id=text(asset.id,'asset.id',128); const fileName=text(asset.fileName,'asset.fileName',128); const kind=text(asset.kind,'asset.kind',16);
  if(!['image','video','font'].includes(kind)) throw new Error('Unsupported asset kind.');
  if(fileName.includes('/')||fileName.includes('\\')||fileName==='.'||fileName==='..'||/[^a-zA-Z0-9._-]/.test(fileName)) throw new Error('Asset filename is unsafe.');
  const ext=extension(fileName); if(ASSET_EXTENSIONS[ext]!==kind) throw new Error('Asset extension does not match its kind.');
  const size=asset.size; if(typeof size!=='number'||!Number.isSafeInteger(size)||size<=0) throw new Error('Asset size is invalid.');
  const mime=text(asset.mimeType,'asset.mimeType',120); if(/(?:svg|html|javascript)/i.test(mime)) throw new Error('Unsafe asset MIME type.');
  const dataUrl=text(asset.dataUrl,'asset.dataUrl',Math.ceil(size*1.5)+2_048); if(!dataUrl.startsWith(`data:${mime};base64,`)||!signatureOk(dataUrl,ext)) throw new Error('Asset data or signature is invalid.');
  const legacy=`src/assets/${kind==='font'?'fonts':'media'}/${fileName}`;
  const current=kind==='font'?`src/assets/fonts/${fileName}`:`public/assets/media/${fileName}`;
  if(asset.projectPath!==legacy&&asset.projectPath!==current) throw new Error('Asset project path is invalid.');
  text(asset.name,'asset.name',500); validIso(asset.createdAt,'asset.createdAt');
  return {id,kind,size};
}

export function validateWorkspaceSnapshot(value: unknown): WorkspaceSnapshot {
  const root=record(value,'workspace'); safeKeys(root,'workspace',16);
  const id=text(root.id,'workspace.id',128); if(!UUID_RE.test(id)) throw new Error('Workspace id is invalid.');
  text(root.ownerFolder,'workspace.ownerFolder',128); text(root.name,'workspace.name',256); text(root.activePageId,'workspace.activePageId',128);
  const schema=root.schemaVersion; if(typeof schema!=='number'||!Number.isInteger(schema)||schema<9||schema>PROJECT_SCHEMA_VERSION) throw new Error('Workspace schema version is unsupported.');
  validIso(root.createdAt,'workspace.createdAt'); validIso(root.savedAt,'workspace.savedAt'); validateSiteSeo(root.seo);
  if(!Array.isArray(root.pages)||root.pages.length<1||root.pages.length>MAX_PAGES) throw new Error('Workspace page count is invalid.');
  const nodeState={count:0}; let homeCount=0; const pageIds=new Set<string>();
  for(const pageValue of root.pages){const page=record(pageValue,'page');safeKeys(page,'page',10);const pageId=text(page.id,'page.id',128);if(pageIds.has(pageId))throw new Error('Duplicate page id.');pageIds.add(pageId);text(page.name,'page.name',500);text(page.slug,'page.slug',100);if(bool(page.isHome,'page.isHome'))homeCount+=1;validatePageSeo(page.seo);if(!Array.isArray(page.nodes)||page.nodes.length>2_000)throw new Error('page.nodes is invalid.');for(const node of page.nodes)validateNode(node,1,nodeState);}
  if(homeCount!==1) throw new Error('Workspace must contain exactly one home page.'); if(!pageIds.has(root.activePageId as string)) throw new Error('Active page does not exist.');
  if(!Array.isArray(root.assets)||root.assets.length>MAX_ASSETS) throw new Error('Workspace assets are invalid.');
  let total=0; const assetIds=new Set<string>(); const fontAssetIds=new Set<string>();
  for(const assetValue of root.assets){const asset=validateAsset(assetValue);if(assetIds.has(asset.id))throw new Error('Duplicate asset id.');assetIds.add(asset.id);if(asset.kind==='font')fontAssetIds.add(asset.id);total+=asset.size;if(total>MAX_TOTAL_ASSET_BYTES)throw new Error('Workspace assets exceed the allowed total size.');}
  if(!Array.isArray(root.fonts)||root.fonts.length>MAX_ASSETS) throw new Error('Workspace fonts are invalid.');
  for(const fontValue of root.fonts){const font=record(fontValue,'font');safeKeys(font,'font',8);text(font.id,'font.id',128);text(font.family,'font.family',256);const assetId=text(font.assetId,'font.assetId',128);if(!fontAssetIds.has(assetId))throw new Error('Font references a missing font asset.');text(font.weight,'font.weight',16);if(font.style!=='normal'&&font.style!=='italic')throw new Error('Font style is invalid.');if(!['woff2','woff','truetype','opentype'].includes(String(font.format)))throw new Error('Font format is invalid.');}
  return value as WorkspaceSnapshot;
}

export function tryValidateWorkspaceSnapshot(value: unknown): WorkspaceSnapshot | null { try { return validateWorkspaceSnapshot(value); } catch { return null; } }
