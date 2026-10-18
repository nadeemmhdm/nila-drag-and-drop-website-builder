import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { ArrowLeft, Bot, Copy, Eye, EyeOff, FileStack, FolderOpen, HardDrive, Layers3, LayoutGrid, LayoutTemplate, Monitor, PackageOpen, PanelLeft, Redo2, SearchCheck, Smartphone, Tablet, Undo2, ZoomIn, ZoomOut } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DeviceViewport, NilaAsset, NilaFont, NilaPageSeo, NilaSiteSeo } from '../core/project';
import { APP_NAME, APP_VERSION, PROJECT_SCHEMA_VERSION } from '../core/constants';
import { auditSeo } from '../seo/audit';
import { createDefaultSiteSeo } from '../seo/defaults';
import { loadLastWorkspace, saveWorkspace } from '../workspace/storage';
import type { WorkspaceSnapshot } from '../workspace/types';
import { clearAssetReference, createAssetFromFile, MAX_TOTAL_ASSET_BYTES } from './assetPipeline';
import { AiPanel } from './components/AiPanel';
import { AssetManager } from './components/AssetManager';
import { Canvas } from './components/Canvas';
import { CatalogBrowser, type PresetInsertMode } from './components/CatalogBrowser';
import { ExportPanel } from './components/ExportPanel';
import { Inspector } from './components/Inspector';
import { Layers } from './components/Layers';
import { PagePanel } from './components/PagePanel';
import { Palette } from './components/Palette';
import { ProjectFontFaces } from './components/ProjectFontFaces';
import { SeoPanel } from './components/SeoPanel';
import { WorkspacePanel } from './components/WorkspacePanel';
import type { CatalogPreset } from './catalog';
import { createInitialEditorState } from './initialDocument';
import { routeForPage, uniqueSlug } from './linking';
import { cloneNode, createNode, findNode, getChildren, insertNode, isContainerNode, isDescendant, removeNode, replaceChildren, updateNode } from './model';
import { createPage, duplicatePage } from './pages';
import { useProjectHistory } from './projectHistory';
import type { EditorNode, EditorNodeProps, EditorNodeType, NodeStyle } from './types';

const viewportIcons = { desktop: Monitor, tablet: Tablet, mobile: Smartphone };
type LeftPanel = 'pages' | 'elements' | 'sections' | 'templates' | 'ai' | 'assets' | 'seo' | 'export' | 'workspace' | 'layers';
interface EditorShellProps { onBackToProjects?: () => void; }

function normalizeSiteSeo(value: NilaSiteSeo | undefined, projectName: string): NilaSiteSeo {
  const defaults = createDefaultSiteSeo(projectName || 'Untitled Site');
  const legacy = (value ?? {}) as Partial<NilaSiteSeo>;
  const legacyName = legacy.siteName?.trim();
  const siteName = !legacyName || legacyName === 'Untitled Site' ? projectName || defaults.siteName : legacyName;
  return {...defaults,...legacy,siteName,browserTitle:legacy.browserTitle?.trim()||siteName,copyrightText:legacy.copyrightText?.trim()||`© ${new Date().getFullYear()} ${siteName}. All rights reserved.`,socialProfiles:Array.isArray(legacy.socialProfiles)?legacy.socialProfiles:[],topics:Array.isArray(legacy.topics)?legacy.topics:[],robots:{...defaults.robots,...(legacy.robots??{})},security:{...defaults.security,...(legacy.security??{})}};
}

function rootAncestorId(nodes: EditorNode[], nodeId: string): string | null {
  let currentId=nodeId;
  let location=findNode(nodes,currentId);
  if(!location)return null;
  while(location.parentId){currentId=location.parentId;location=findNode(nodes,currentId);if(!location)break;}
  return currentId;
}

export function EditorShell({ onBackToProjects }: EditorShellProps = {}) {
  const initial = useMemo(createInitialEditorState, []);
  const { pages, commitPages, commitNodes, undo, redo, canUndo, canRedo } = useProjectHistory(initial.pages);
  const [assets, setAssets] = useState<NilaAsset[]>([]);
  const [fonts, setFonts] = useState<NilaFont[]>([]);
  const [siteSeo, setSiteSeo] = useState<NilaSiteSeo>(() => createDefaultSiteSeo());
  const [activePageId, setActivePageId] = useState(initial.activePageId);
  const [selectedId, setSelectedId] = useState<string | null>(initial.selectedId);
  const [viewport, setViewport] = useState<DeviceViewport>(initial.viewport);
  const [zoom, setZoom] = useState(initial.zoom);
  const [leftPanel, setLeftPanel] = useState<LeftPanel>('pages');
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [workspaceId, setWorkspaceId] = useState(() => crypto.randomUUID());
  const [workspaceOwner, setWorkspaceOwner] = useState('local-user');
  const [workspaceName, setWorkspaceName] = useState('Nila Site');
  const [workspaceCreatedAt, setWorkspaceCreatedAt] = useState(() => new Date().toISOString());
  const [storageStatus, setStorageStatus] = useState('Loading local workspace…');
  const hydratedRef = useRef(false);
  const latestSnapshotRef = useRef<WorkspaceSnapshot | null>(null);
  const autosaveTimerRef = useRef<number | null>(null);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const activePage = pages.find((page) => page.id === activePageId) ?? pages.find((page) => page.isHome) ?? pages[0];
  const nodes = activePage?.nodes ?? [];
  const selectedLocation = selectedId ? findNode(nodes, selectedId) : null;
  const selectedNode = selectedLocation?.node ?? null;
  const selectedParent = selectedLocation?.parentId ? findNode(nodes, selectedLocation.parentId)?.node ?? null : null;
  const seoAudit = useMemo(() => auditSeo(siteSeo, pages), [siteSeo, pages]);
  const exportInput = useMemo(() => ({ projectName: workspaceName || siteSeo.siteName || 'Nila Site', pages, assets, fonts, seo: siteSeo }), [assets, fonts, pages, siteSeo, workspaceName]);
  const workspaceSnapshot = useMemo<WorkspaceSnapshot>(() => ({ id:workspaceId, ownerFolder:workspaceOwner, name:workspaceName, schemaVersion:PROJECT_SCHEMA_VERSION, pages, assets, fonts, seo:siteSeo, activePageId, createdAt:workspaceCreatedAt, savedAt:new Date().toISOString() }), [activePageId, assets, fonts, pages, siteSeo, workspaceCreatedAt, workspaceId, workspaceName, workspaceOwner]);

  const persistWorkspace = useCallback((source: WorkspaceSnapshot) => {
    const snapshot = { ...source, savedAt: new Date().toISOString() };
    latestSnapshotRef.current = snapshot;
    saveQueueRef.current = saveQueueRef.current.catch(() => undefined).then(async () => {
      await saveWorkspace(snapshot, false);
      setStorageStatus(`Autosaved ${new Date().toLocaleTimeString()}`);
    }).catch(() => { setStorageStatus('Autosave failed'); });
    return saveQueueRef.current;
  }, []);

  useEffect(() => {let alive=true;void loadLastWorkspace().then((snapshot)=>{if(!alive||!snapshot)return;commitPages(snapshot.pages);setAssets(snapshot.assets);setFonts(snapshot.fonts);setSiteSeo(normalizeSiteSeo(snapshot.seo,snapshot.name));setActivePageId(snapshot.activePageId||snapshot.pages.find((page)=>page.isHome)?.id||snapshot.pages[0]?.id||'');setWorkspaceId(snapshot.id);setWorkspaceOwner(snapshot.ownerFolder);setWorkspaceName(snapshot.name);setWorkspaceCreatedAt(snapshot.createdAt);setStorageStatus('Loaded from local workspace');}).catch(()=>setStorageStatus('Local storage ready')).finally(()=>{hydratedRef.current=true;});return()=>{alive=false;};},[commitPages]);
  useEffect(() => {
    latestSnapshotRef.current = workspaceSnapshot;
    if(!hydratedRef.current)return;
    setStorageStatus('Saving…');
    if(autosaveTimerRef.current!==null)window.clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current=window.setTimeout(()=>{autosaveTimerRef.current=null;const latest=latestSnapshotRef.current;if(latest)void persistWorkspace(latest);},120);
    return()=>{if(autosaveTimerRef.current!==null){window.clearTimeout(autosaveTimerRef.current);autosaveTimerRef.current=null;}};
  },[persistWorkspace,workspaceSnapshot]);
  useEffect(() => {
    const flush=()=>{if(!hydratedRef.current)return;if(autosaveTimerRef.current!==null){window.clearTimeout(autosaveTimerRef.current);autosaveTimerRef.current=null;}const latest=latestSnapshotRef.current;if(latest)void persistWorkspace(latest);};
    const onVisibility=()=>{if(document.visibilityState==='hidden')flush();};
    window.addEventListener('pagehide',flush);document.addEventListener('visibilitychange',onVisibility);
    return()=>{window.removeEventListener('pagehide',flush);document.removeEventListener('visibilitychange',onVisibility);flush();};
  },[persistWorkspace]);
  useEffect(() => {if(!activePage&&pages[0])setActivePageId(pages[0].id);if(selectedId&&!findNode(nodes,selectedId))setSelectedId(null);},[activePage,nodes,pages,selectedId]);

  const applyWorkspace = useCallback((snapshot:WorkspaceSnapshot) => {hydratedRef.current=false;commitPages(snapshot.pages);setAssets(snapshot.assets);setFonts(snapshot.fonts);setSiteSeo(normalizeSiteSeo(snapshot.seo,snapshot.name));setActivePageId(snapshot.activePageId||snapshot.pages.find((page)=>page.isHome)?.id||snapshot.pages[0]?.id||'');setSelectedId(null);setWorkspaceId(snapshot.id);setWorkspaceOwner(snapshot.ownerFolder);setWorkspaceName(snapshot.name);setWorkspaceCreatedAt(snapshot.createdAt);setStorageStatus('Workspace loaded');window.setTimeout(()=>{hydratedRef.current=true;latestSnapshotRef.current=snapshot;},0);},[commitPages]);
  const createNewWorkspace = () => {const next=createInitialEditorState();const now=new Date().toISOString();const seo=createDefaultSiteSeo('Untitled Site');applyWorkspace({id:crypto.randomUUID(),ownerFolder:workspaceOwner||'local-user',name:'Untitled Site',schemaVersion:PROJECT_SCHEMA_VERSION,pages:next.pages,assets:[],fonts:[],seo,activePageId:next.activePageId,createdAt:now,savedAt:now});};
  const commitActiveNodes = useCallback((next: EditorNode[] | ((current: EditorNode[]) => EditorNode[])) => {if(activePageId)commitNodes(activePageId,next);},[activePageId,commitNodes]);

  const deleteSelected = useCallback(() => {if(!selectedId||selectedNode?.locked)return;commitActiveNodes((current)=>removeNode(current,selectedId).nodes);setSelectedId(null);},[commitActiveNodes,selectedId,selectedNode?.locked]);
  const duplicateSelected = useCallback(() => {if(!selectedId)return;commitActiveNodes((current)=>{const location=findNode(current,selectedId);if(!location)return current;const cloned=cloneNode(location.node);setSelectedId(cloned.id);return insertNode(current,location.parentId,location.index+1,cloned);});},[commitActiveNodes,selectedId]);

  useEffect(() => {const onKeyDown=(event:KeyboardEvent)=>{const target=event.target as HTMLElement|null;if(target?.matches('input, textarea, select, [contenteditable="true"]'))return;const mod=event.metaKey||event.ctrlKey;if(mod&&event.key.toLowerCase()==='z'){event.preventDefault();event.shiftKey?redo():undo();}else if(mod&&event.key.toLowerCase()==='y'){event.preventDefault();redo();}else if(mod&&event.key.toLowerCase()==='d'){event.preventDefault();duplicateSelected();}else if((event.key==='Delete'||event.key==='Backspace')&&!preview){event.preventDefault();deleteSelected();}else if(event.key==='Escape'){setSelectedId(null);setPreview(false);}};window.addEventListener('keydown',onKeyDown);return()=>window.removeEventListener('keydown',onKeyDown);},[deleteSelected,duplicateSelected,preview,redo,undo]);

  const onDragStart = (event: DragStartEvent) => {if(preview)return;const data=event.active.data.current;if(data?.source==='palette')setActiveLabel(String(data.nodeType));else if(data?.source==='canvas')setActiveLabel(findNode(nodes,String(data.nodeId))?.node.name??'Element');};
  const onDragEnd = (event: DragEndEvent) => {
    setActiveLabel(null);if(preview)return;const{active,over}=event;if(!over)return;const activeData=active.data.current;const overData=over.data.current;const targetParentId=(overData?.parentId as string|null|undefined)??null;
    if(activeData?.source==='palette'){const node=createNode(activeData.nodeType as EditorNodeType);commitActiveNodes((current)=>{const overId=overData?.type==='node'?String(overData.nodeId):null;const overNode=overId?findNode(current,overId)?.node:null;const paletteParentId=overNode&&isContainerNode(overNode)?overNode.id:targetParentId;const targetChildren=getChildren(current,paletteParentId);const index=paletteParentId===targetParentId&&overId?Math.max(0,targetChildren.findIndex((item)=>item.id===overId)):targetChildren.length;return insertNode(current,paletteParentId,index,node);});setSelectedId(node.id);return;}
    if(activeData?.source!=='canvas')return;const activeId=String(activeData.nodeId);if(activeId===String(over.id))return;
    commitActiveNodes((current)=>{const source=findNode(current,activeId);if(!source||source.node.locked)return current;const overNodeId=overData?.type==='node'?String(overData.nodeId):null;let destinationParentId=targetParentId;let effectiveOverId=overNodeId;
      if(source.parentId===null&&overNodeId){const rootTarget=rootAncestorId(current,overNodeId);destinationParentId=null;effectiveOverId=rootTarget;}
      else if(overData?.type==='node'){const overNode=overNodeId?findNode(current,overNodeId)?.node:null;if(overNode&&isContainerNode(overNode)&&overNode.id!==activeId)destinationParentId=overNode.id;}
      if(destinationParentId===activeId||(destinationParentId&&isDescendant(current,activeId,destinationParentId)))return current;const destinationChildrenBefore=getChildren(current,destinationParentId);let destinationIndex=effectiveOverId?destinationChildrenBefore.findIndex((item)=>item.id===effectiveOverId):destinationChildrenBefore.length;if(destinationIndex<0)destinationIndex=destinationChildrenBefore.length;
      if(source.parentId===destinationParentId)return replaceChildren(current,source.parentId,arrayMove(getChildren(current,source.parentId),source.index,destinationIndex));const removed=removeNode(current,activeId);if(!removed.removed)return current;return insertNode(removed.nodes,destinationParentId,destinationIndex,removed.removed);});
  };

  const patchSelected=(patchValue:Partial<EditorNode>)=>{if(selectedId)commitActiveNodes((current)=>updateNode(current,selectedId,(node)=>({...node,...patchValue})));};
  const patchProps=(patchValue:EditorNodeProps)=>{if(selectedId)commitActiveNodes((current)=>updateNode(current,selectedId,(node)=>({...node,props:{...node.props,...patchValue}})));};
  const patchStyle=(patchValue:NodeStyle)=>{if(selectedId)commitActiveNodes((current)=>updateNode(current,selectedId,(node)=>({...node,styles:{...node.styles,[viewport]:{...node.styles[viewport],...patchValue}}})));};
  const patchParentStyle=(patchValue:NodeStyle)=>{const parentId=selectedLocation?.parentId;if(parentId)commitActiveNodes((current)=>updateNode(current,parentId,(node)=>({...node,styles:{...node.styles,[viewport]:{...node.styles[viewport],...patchValue}}})));};
  const removeStyle=(property:string)=>{if(selectedId)commitActiveNodes((current)=>updateNode(current,selectedId,(node)=>{const next={...node.styles[viewport]};delete next[property];return{...node,styles:{...node.styles,[viewport]:next}};}));};
  const resetViewportStyles=()=>{if(selectedId&&viewport!=='desktop')commitActiveNodes((current)=>updateNode(current,selectedId,(node)=>({...node,styles:{...node.styles,[viewport]:{}}})));};
  const insertPreset=(preset:CatalogPreset,mode:PresetInsertMode='append')=>{const built=preset.build();if(preset.kind==='template'&&mode==='replace')commitActiveNodes(built);else commitActiveNodes((current)=>[...current,...built]);setSelectedId(built[0]?.id??null);};

  const moveLayerUp=(nodeId:string)=>commitActiveNodes((current)=>{const location=findNode(current,nodeId);if(!location||location.index<=0)return current;return replaceChildren(current,location.parentId,arrayMove(getChildren(current,location.parentId),location.index,location.index-1));});
  const moveLayerDown=(nodeId:string)=>commitActiveNodes((current)=>{const location=findNode(current,nodeId);if(!location)return current;const siblings=getChildren(current,location.parentId);if(location.index>=siblings.length-1)return current;return replaceChildren(current,location.parentId,arrayMove(siblings,location.index,location.index+1));});
  const moveLayerIn=(nodeId:string)=>commitActiveNodes((current)=>{const location=findNode(current,nodeId);if(!location||location.index<=0)return current;const siblings=getChildren(current,location.parentId);const previous=siblings[location.index-1];if(!isContainerNode(previous)||previous.id===nodeId)return current;const removed=removeNode(current,nodeId);if(!removed.removed)return current;return insertNode(removed.nodes,previous.id,getChildren(removed.nodes,previous.id).length,removed.removed);});
  const moveLayerOut=(nodeId:string)=>commitActiveNodes((current)=>{const location=findNode(current,nodeId);if(!location?.parentId)return current;const parentLocation=findNode(current,location.parentId);if(!parentLocation)return current;const removed=removeNode(current,nodeId);if(!removed.removed)return current;return insertNode(removed.nodes,parentLocation.parentId,parentLocation.index+1,removed.removed);});
  const toggleLayerHidden=(nodeId:string)=>commitActiveNodes((current)=>updateNode(current,nodeId,(node)=>({...node,hidden:!node.hidden})));
  const toggleLayerLocked=(nodeId:string)=>commitActiveNodes((current)=>updateNode(current,nodeId,(node)=>({...node,locked:!node.locked})));

  const activatePage=(pageId:string)=>{setActivePageId(pageId);setSelectedId(null);};
  const addPage=()=>{const next=createPage(`Page ${pages.length+1}`,pages);commitPages((current)=>[...current,next]);activatePage(next.id);};
  const renamePage=(pageId:string,name:string)=>commitPages((current)=>current.map((page)=>page.id===pageId?{...page,name}:page));
  const changeSlug=(pageId:string,slug:string)=>commitPages((current)=>current.map((page)=>page.id===pageId?{...page,slug:uniqueSlug(slug,current,pageId)}:page));
  const setHome=(pageId:string)=>commitPages((current)=>current.map((page)=>({...page,isHome:page.id===pageId})));
  const copyPage=(pageId:string)=>{const source=pages.find((page)=>page.id===pageId);if(!source)return;const next=duplicatePage(source,pages);commitPages((current)=>[...current,next]);activatePage(next.id);};
  const deletePage=(pageId:string)=>{if(pages.length<=1)return;const deleting=pages.find((page)=>page.id===pageId);const remaining=pages.filter((page)=>page.id!==pageId);if(deleting?.isHome&&remaining.length)remaining[0]={...remaining[0],isHome:true};commitPages(remaining);if(activePageId===pageId)activatePage((remaining.find((page)=>page.isHome)??remaining[0]).id);};
  const patchPageSeo=(patch:Partial<NilaPageSeo>)=>{if(!activePageId)return;commitPages((current)=>current.map((page)=>page.id===activePageId?{...page,seo:{...page.seo,...patch,modifiedAt:new Date().toISOString()}}:page));};

  const addAssets=(nextAssets:NilaAsset[],nextFonts:NilaFont[])=>{setAssets((current)=>[...current,...nextAssets]);setFonts((current)=>[...current,...nextFonts]);};
  const uploadMedia=async(file:File,expectedKind:'image'|'video')=>{const total=assets.reduce((sum,asset)=>sum+asset.size,0);if(total+file.size>MAX_TOTAL_ASSET_BYTES)throw new Error('Project asset limit is 80 MB for the current browser session.');const asset=await createAssetFromFile(file,assets);if(asset.kind!==expectedKind)throw new Error(`Please select a ${expectedKind} file.`);setAssets((current)=>[...current,asset]);return asset;};
  const deleteAsset=(assetId:string)=>{setAssets((current)=>current.filter((asset)=>asset.id!==assetId));setFonts((current)=>current.filter((font)=>font.assetId!==assetId));setSiteSeo((current)=>({...current,organizationLogoAssetId:current.organizationLogoAssetId===assetId?undefined:current.organizationLogoAssetId,faviconAssetId:current.faviconAssetId===assetId?undefined:current.faviconAssetId}));commitPages((current)=>current.map((page)=>({...page,nodes:clearAssetReference(page.nodes,assetId),seo:page.seo.ogImageAssetId===assetId?{...page.seo,ogImageAssetId:undefined}:page.seo})));};
  const insertAsset=(asset:NilaAsset)=>{if(asset.kind==='font')return;const node=createNode(asset.kind==='video'?'video':'image');node.props={...node.props,assetId:asset.id,src:undefined,alt:asset.name.replace(/\.[^.]+$/,'').replace(/[-_]+/g,' ')};commitActiveNodes((current)=>[...current,node]);setSelectedId(node.id);};
  const insertIcon=(value:string,mode:'lucide'|'emoji'='lucide')=>{const node=createNode('icon');node.props={...node.props,iconMode:mode,iconName:mode==='lucide'?value:node.props.iconName,emoji:mode==='emoji'?value:node.props.emoji};commitActiveNodes((current)=>[...current,node]);setSelectedId(node.id);};
  const updateFont=(fontId:string,patch:Partial<NilaFont>)=>setFonts((current)=>current.map((font)=>font.id===fontId?{...font,...patch}:font));
  const applyFont=(font:NilaFont)=>{if(selectedNode)patchStyle({fontFamily:`"${font.family}", sans-serif`,fontWeight:font.weight,fontStyle:font.style});};
  const replaceWebsiteFromAi=(nextPages:typeof pages,nextSeo:NilaSiteSeo)=>{commitPages(nextPages);setSiteSeo(nextSeo);setActivePageId(nextPages.find((page)=>page.isHome)?.id??nextPages[0]?.id??'');setSelectedId(null);};
  const replaceSeoFromAi=(nextPages:typeof pages,nextSeo:NilaSiteSeo)=>{commitPages(nextPages);setSiteSeo(nextSeo);};
  const enhanceSelected=(text:string)=>{if(selectedNode?.props.text!==undefined)patchProps({text});};

  const leftContent=leftPanel==='pages'?<><div className="panel-heading"><strong>Pages</strong><span>{pages.length} total</span></div><PagePanel pages={pages} activePageId={activePageId} onActivate={activatePage} onAdd={addPage} onRename={renamePage} onSlugChange={changeSlug} onSetHome={setHome} onDuplicate={copyPage} onDelete={deletePage}/></>
    :leftPanel==='elements'?<><div className="panel-heading"><strong>Elements</strong><span>Drag to canvas</span></div><Palette projectId={workspaceId}/></>
    :leftPanel==='sections'?<><div className="panel-heading"><strong>Sections</strong><span>Reusable blocks</span></div><CatalogBrowser kind="section" onInsert={insertPreset}/></>
    :leftPanel==='templates'?<><div className="panel-heading"><strong>Templates</strong><span>Starter pages</span></div><CatalogBrowser kind="template" onInsert={insertPreset}/></>
    :leftPanel==='ai'?<><div className="panel-heading"><strong>Nila AI</strong><span>Build & optimize</span></div><AiPanel projectName={workspaceName} pages={pages} siteSeo={siteSeo} selectedNode={selectedNode} onReplaceWebsite={replaceWebsiteFromAi} onReplaceSeo={replaceSeoFromAi} onEnhanceSelected={enhanceSelected}/></>
    :leftPanel==='assets'?<><div className="panel-heading"><strong>Assets</strong><span>Local project files</span></div><AssetManager assets={assets} fonts={fonts} canApplyFont={Boolean(selectedNode)} onAdd={addAssets} onDelete={deleteAsset} onInsertAsset={insertAsset} onUpdateFont={updateFont} onApplyFont={applyFont} onInsertIcon={insertIcon}/></>
    :leftPanel==='seo'?<><div className="panel-heading"><strong>SEO / AEO / GEO</strong><span>{seoAudit.score}/100</span></div><SeoPanel siteSeo={siteSeo} page={activePage} pages={pages} assets={assets} onSiteSeoChange={setSiteSeo} onPatchPageSeo={patchPageSeo}/></>
    :leftPanel==='export'?<><div className="panel-heading"><strong>Preview & Export</strong><span>Production output</span></div><ExportPanel input={exportInput} activePageId={activePageId}/></>
    :leftPanel==='workspace'?<><div className="panel-heading"><strong>Workspace</strong><span>{storageStatus}</span></div><WorkspacePanel current={workspaceSnapshot} status={storageStatus} onMeta={(patch)=>{if(patch.ownerFolder!==undefined)setWorkspaceOwner(patch.ownerFolder);if(patch.name!==undefined)setWorkspaceName(patch.name);}} onLoad={applyWorkspace} onNew={createNewWorkspace}/></>
    :<><div className="panel-heading"><strong>Layers</strong><span>{nodes.length} root nodes</span></div><Layers nodes={nodes} selectedId={selectedId} onSelect={setSelectedId} onMoveUp={moveLayerUp} onMoveDown={moveLayerDown} onMoveIn={moveLayerIn} onMoveOut={moveLayerOut} onToggleHidden={toggleLayerHidden} onToggleLocked={toggleLayerLocked}/></>;

  const backToProjects=()=>{const latest=latestSnapshotRef.current??workspaceSnapshot;void persistWorkspace(latest).finally(()=>onBackToProjects?.());};

  return <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}><ProjectFontFaces assets={assets} fonts={fonts}/><div className="editor-app"><header className="editor-topbar"><div className="editor-brand-cluster">{onBackToProjects?<button type="button" className="topbar-back-button" onClick={backToProjects} title="Back to projects"><ArrowLeft size={15}/><span>Projects</span></button>:null}<div className="brand"><div className="brand-mark">N</div><div><strong>{APP_NAME}</strong><span>v{APP_VERSION} · {activePage?routeForPage(activePage):'/'}</span></div></div></div><div className="topbar-group history-controls"><button type="button" disabled={!canUndo} onClick={undo}><Undo2 size={16}/></button><button type="button" disabled={!canRedo} onClick={redo}><Redo2 size={16}/></button></div><div className="viewport-switcher">{(['desktop','tablet','mobile'] as DeviceViewport[]).map((device)=>{const Icon=viewportIcons[device];return <button type="button" key={device} className={viewport===device?'active':''} onClick={()=>setViewport(device)}><Icon size={16}/><span>{device}</span></button>;})}</div><div className="topbar-group zoom-controls"><button type="button" onClick={()=>setZoom((value)=>Math.max(50,value-10))}><ZoomOut size={16}/></button><span>{zoom}%</span><button type="button" onClick={()=>setZoom((value)=>Math.min(120,value+10))}><ZoomIn size={16}/></button></div><button type="button" className={`preview-button${preview?' active':''}`} onClick={()=>{setPreview((value)=>!value);setSelectedId(null);}}>{preview?<EyeOff size={16}/>:<Eye size={16}/>} {preview?'Edit':'Preview'}</button></header><div className="editor-workspace"><aside className="left-sidebar"><div className="sidebar-tabs ten"><button type="button" className={leftPanel==='pages'?'active':''} onClick={()=>setLeftPanel('pages')}><FileStack size={15}/><span>Pages</span></button><button type="button" className={leftPanel==='elements'?'active':''} onClick={()=>setLeftPanel('elements')}><PanelLeft size={15}/><span>Elements</span></button><button type="button" className={leftPanel==='sections'?'active':''} onClick={()=>setLeftPanel('sections')}><LayoutGrid size={15}/><span>Sections</span></button><button type="button" className={leftPanel==='templates'?'active':''} onClick={()=>setLeftPanel('templates')}><LayoutTemplate size={15}/><span>Templates</span></button><button type="button" className={leftPanel==='ai'?'active':''} onClick={()=>setLeftPanel('ai')}><Bot size={15}/><span>AI</span></button><button type="button" className={leftPanel==='assets'?'active':''} onClick={()=>setLeftPanel('assets')}><FolderOpen size={15}/><span>Assets</span></button><button type="button" className={leftPanel==='seo'?'active':''} onClick={()=>setLeftPanel('seo')}><SearchCheck size={15}/><span>SEO</span></button><button type="button" className={leftPanel==='export'?'active':''} onClick={()=>setLeftPanel('export')}><PackageOpen size={15}/><span>Export</span></button><button type="button" className={leftPanel==='workspace'?'active':''} onClick={()=>setLeftPanel('workspace')}><HardDrive size={15}/><span>Local</span></button><button type="button" className={leftPanel==='layers'?'active':''} onClick={()=>setLeftPanel('layers')}><Layers3 size={15}/><span>Layers</span></button></div><div className="sidebar-scroll">{leftContent}</div></aside><main className="workspace-main"><Canvas nodes={nodes} pages={pages} assets={assets} activePageId={activePageId} viewport={viewport} zoom={zoom} selectedId={selectedId} preview={preview} onSelect={setSelectedId} onNavigatePage={activatePage}/></main><aside className="right-sidebar">{preview?<div className="preview-help"><Eye size={18}/><strong>Preview mode</strong><p>Internal page and anchor links are interactive. Press Escape or click Edit to return.</p></div>:<Inspector node={selectedNode} parentNode={selectedParent} pages={pages} assets={assets} fonts={fonts} viewport={viewport} onPatch={patchSelected} onPatchProps={patchProps} onPatchStyle={patchStyle} onPatchParentStyle={patchParentStyle} onRemoveStyle={removeStyle} onResetViewportStyles={resetViewportStyles} onDelete={deleteSelected} onDuplicate={duplicateSelected} onUploadMedia={uploadMedia}/>}</aside></div><footer className="editor-statusbar"><span>{workspaceName} · {activePage?.name??'Page'} · {activePage?routeForPage(activePage):'/'}</span><span>{preview?'Preview mode':selectedNode?`Selected: ${selectedNode.name}`:'No selection'}</span><span>{storageStatus} · SEO {seoAudit.score}/100 · {assets.length} assets · {viewport}</span></footer></div><DragOverlay>{activeLabel?<div className="drag-overlay"><Copy size={14}/> {activeLabel}</div>:null}</DragOverlay></DndContext>;
}
