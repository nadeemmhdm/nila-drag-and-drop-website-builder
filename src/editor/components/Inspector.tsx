import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Copy, Eye, EyeOff, Lock, Move, RotateCcw, Trash2, Unlock, Upload, X } from 'lucide-react';
import { useMemo, useState, type ChangeEvent } from 'react';
import type { DeviceViewport, NilaAsset, NilaFont, NilaPage } from '../../core/project';
import { IMAGE_ACCEPT, VIDEO_ACCEPT } from '../assetPipeline';
import { ICON_ENTRIES, NilaIcon, resolveIconKey } from '../iconRegistry';
import { inferLinkType, normalizeAnchor } from '../linking';
import { gridCellStyles, horizontalPlacementStyles, type HorizontalPlacement } from '../placement';
import { ANIMATION_PRESETS, getStyleGroupsForNode, supportsAnimation, type StyleControl } from '../styleControls';
import type { EditorNode, LinkType, ListStyle, NodeStyle } from '../types';

interface InspectorProps {
  node: EditorNode | null;
  parentNode?: EditorNode | null;
  pages: NilaPage[];
  assets: NilaAsset[];
  fonts: NilaFont[];
  viewport: DeviceViewport;
  onPatch: (patch: Partial<EditorNode>) => void;
  onPatchProps: (patch: EditorNode['props']) => void;
  onPatchStyle: (patch: NodeStyle) => void;
  onPatchParentStyle: (patch: NodeStyle) => void;
  onRemoveStyle: (property: string) => void;
  onResetViewportStyles: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onUploadMedia: (file: File, expectedKind: 'image' | 'video') => Promise<NilaAsset>;
}

type InspectorTab = 'content' | 'style';

function mergeEffectiveStyles(node: EditorNode, viewport: DeviceViewport): NodeStyle {
  return {
    ...node.styles.desktop,
    ...(viewport === 'tablet' || viewport === 'mobile' ? node.styles.tablet : {}),
    ...(viewport === 'mobile' ? node.styles.mobile : {}),
  };
}

export function Inspector(props: InspectorProps) {
  const { node, viewport, onPatch, onDelete, onDuplicate } = props;
  const [tab, setTab] = useState<InspectorTab>('style');
  const effective = useMemo(() => node ? mergeEffectiveStyles(node, viewport) : {}, [node, viewport]);

  if (!node) return <div className="inspector-empty"><strong>No element selected</strong><p>Select an element on the canvas or in Layers. Only controls relevant to that element will appear here.</p></div>;

  return <div className={`inspector-content inspector-node-${node.type}`}>
    <div className="inspector-title">
      <div><span className="inspector-kicker">{node.type}</span><strong>{node.name}</strong></div>
      <div className="inspector-actions">
        <button type="button" onClick={onDuplicate} title="Duplicate"><Copy size={15}/></button>
        <button type="button" onClick={() => onPatch({ locked: !node.locked })} title={node.locked ? 'Unlock' : 'Lock'}>{node.locked ? <Lock size={15}/> : <Unlock size={15}/>}</button>
        <button type="button" onClick={() => onPatch({ hidden: !node.hidden })} title={node.hidden ? 'Show' : 'Hide'}>{node.hidden ? <EyeOff size={15}/> : <Eye size={15}/>}</button>
        <button type="button" onClick={onDelete} title="Delete" className="danger"><Trash2 size={15}/></button>
      </div>
    </div>
    <div className="inspector-tabs"><button type="button" className={tab === 'content' ? 'active' : ''} onClick={() => setTab('content')}>Content</button><button type="button" className={tab === 'style' ? 'active' : ''} onClick={() => setTab('style')}>Style & layout</button></div>
    {tab === 'content' ? <ContentInspector {...props} node={node}/> : <StyleInspector {...props} node={node} effective={effective}/>} 
  </div>;
}

function ContentInspector({ node, pages, assets, onPatch, onPatchProps, onUploadMedia }: InspectorProps & { node: EditorNode }) {
  const hasText = ['heading', 'paragraph', 'link', 'button', 'badge', 'quote'].includes(node.type);
  const hasLink = ['link', 'button'].includes(node.type);
  const hasMedia = ['image', 'avatar', 'video'].includes(node.type);
  const hasField = ['input', 'textarea', 'select', 'checkbox'].includes(node.type);
  const compatibleAssets = assets.filter((asset) => node.type === 'video' ? asset.kind === 'video' : asset.kind === 'image');

  return <section className="inspector-section contextual-content-panel">
    <div className="section-row"><h3>Content</h3><span>{node.type}</span></div>
    <label>Layer name<input value={node.name} onChange={(event) => onPatch({ name: event.target.value })}/></label>
    {hasText ? <label>Text<textarea rows={4} value={node.props.text ?? ''} onChange={(event) => onPatchProps({ text: event.target.value })}/></label> : null}
    <label>Anchor ID<input value={node.props.anchorId ?? ''} placeholder="section-name" onChange={(event) => onPatchProps({ anchorId: normalizeAnchor(event.target.value) })}/></label>
    {node.type === 'icon' ? <IconControls node={node} onPatchProps={onPatchProps}/> : null}
    {hasLink ? <LinkControls node={node} pages={pages} onPatchProps={onPatchProps}/> : null}
    {hasMedia ? <MediaControls node={node} assets={assets} compatibleAssets={compatibleAssets} onPatchProps={onPatchProps} onUploadMedia={onUploadMedia}/> : null}
    {node.type === 'list' ? <ListControls node={node} onPatchProps={onPatchProps}/> : null}
    {hasField ? <label>Label<input value={node.props.label ?? ''} onChange={(event) => onPatchProps({ label: event.target.value })}/></label> : null}
    {hasField ? <label>Field name<input value={node.props.fieldName ?? ''} placeholder="field_name" onChange={(event) => onPatchProps({ fieldName: event.target.value.replace(/[^a-zA-Z0-9_-]/g, '') })}/></label> : null}
    {node.type === 'input' ? <label>Input type<select value={node.props.inputType ?? 'text'} onChange={(event) => onPatchProps({ inputType: event.target.value as EditorNode['props']['inputType'] })}>{['text','email','tel','url','number','password','search','date','time'].map((type) => <option key={type} value={type}>{type}</option>)}</select></label> : null}
    {['input', 'textarea'].includes(node.type) ? <label>Placeholder<input value={node.props.placeholder ?? ''} onChange={(event) => onPatchProps({ placeholder: event.target.value })}/></label> : null}
    {node.type === 'textarea' ? <label>Rows<input type="number" min={2} max={20} value={node.props.rows ?? 5} onChange={(event) => onPatchProps({ rows: Math.max(2, Math.min(20, Number(event.target.value) || 5)) })}/></label> : null}
    {node.type === 'select' ? <label>Options<textarea rows={5} value={(node.props.options ?? []).join('\n')} onChange={(event) => onPatchProps({ options: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean) })}/></label> : null}
    {node.type === 'checkbox' ? <label className="inline-check"><input type="checkbox" checked={Boolean(node.props.checked)} onChange={(event) => onPatchProps({ checked: event.target.checked })}/> Checked by default</label> : null}
    {hasField ? <label className="inline-check"><input type="checkbox" checked={Boolean(node.props.required)} onChange={(event) => onPatchProps({ required: event.target.checked })}/> Required field</label> : null}
  </section>;
}

function IconControls({ node, onPatchProps }: { node: EditorNode; onPatchProps: InspectorProps['onPatchProps'] }) {
  const mode = node.props.iconMode ?? 'lucide';
  const key = resolveIconKey(node.props.iconName);
  return <div className="icon-inspector-controls"><div className="icon-mode-switch"><button type="button" className={mode === 'lucide' ? 'active' : ''} onClick={() => onPatchProps({ iconMode: 'lucide' })}>Lucide</button><button type="button" className={mode === 'emoji' ? 'active' : ''} onClick={() => onPatchProps({ iconMode: 'emoji' })}>Emoji</button></div>{mode === 'lucide' ? <label>Icon<select value={key} onChange={(event) => onPatchProps({ iconName: event.target.value, iconMode: 'lucide' })}>{ICON_ENTRIES.map(([iconKey, label]) => <option key={iconKey} value={iconKey}>{label}</option>)}</select><span className="icon-inspector-preview"><NilaIcon name={key} size={22}/>{ICON_ENTRIES.find(([iconKey]) => iconKey === key)?.[1] ?? key}</span></label> : <label>Emoji<input value={node.props.emoji ?? '✨'} maxLength={8} onChange={(event) => onPatchProps({ emoji: event.target.value, iconMode: 'emoji' })}/><small>Paste any Unicode emoji, for example ✨ 🚀 ✅ 🔒.</small></label>}</div>;
}

function ListControls({ node, onPatchProps }: { node: EditorNode; onPatchProps: InspectorProps['onPatchProps'] }) {
  return <div className="list-controls"><label>List style<select value={node.props.listStyle ?? 'bullet'} onChange={(event) => onPatchProps({ listStyle: event.target.value as ListStyle })}><option value="bullet">Bullets</option><option value="number">Numbers — 1, 2, 3</option><option value="lower-alpha">Letters — a, b, c</option><option value="upper-alpha">Letters — A, B, C</option><option value="roman">Roman — I, II, III</option><option value="mixed">Mixed — 1, a, 2, b</option></select></label><label>Items<textarea rows={6} value={(node.props.items ?? []).join('\n')} onChange={(event) => onPatchProps({ items: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean) })}/><small>One item per line.</small></label></div>;
}

function LinkControls({ node, pages, onPatchProps }: { node: EditorNode; pages: NilaPage[]; onPatchProps: InspectorProps['onPatchProps'] }) {
  const linkType = inferLinkType(node.props);
  const changeLinkType = (nextType: LinkType) => {
    const home = pages.find((page) => page.isHome) ?? pages[0];
    if (nextType === 'page') onPatchProps({ linkType: nextType, pageId: node.props.pageId ?? home?.id, href: undefined, anchor: undefined });
    else if (nextType === 'anchor') onPatchProps({ linkType: nextType, anchor: node.props.anchor ?? '', pageId: undefined, href: undefined });
    else onPatchProps({ linkType: nextType, pageId: undefined, anchor: undefined, href: node.props.href ?? '' });
  };
  return <div className="link-builder"><h4>Link target</h4><div className="edit-link-note">Links stay disabled while editing. Use Preview mode to test navigation.</div><label>Type<select value={linkType} onChange={(event) => changeLinkType(event.target.value as LinkType)}><option value="page">Page</option><option value="external">External URL</option><option value="anchor">Anchor</option><option value="email">Email</option><option value="phone">Phone</option></select></label>{linkType === 'page' ? <label>Page<select value={node.props.pageId ?? ''} onChange={(event) => onPatchProps({ pageId: event.target.value })}>{pages.map((page) => <option key={page.id} value={page.id}>{page.name} {page.isHome ? '(Home)' : ''}</option>)}</select></label> : null}{linkType === 'anchor' ? <label>Anchor<input value={node.props.anchor ?? ''} placeholder="pricing" onChange={(event) => onPatchProps({ anchor: normalizeAnchor(event.target.value) })}/></label> : null}{linkType === 'external' ? <><label>URL<input value={node.props.href ?? ''} placeholder="https://example.com" onChange={(event) => onPatchProps({ href: event.target.value })}/></label><label className="inline-check"><input type="checkbox" checked={Boolean(node.props.newTab)} onChange={(event) => onPatchProps({ newTab: event.target.checked })}/> Open in new tab</label></> : null}{linkType === 'email' ? <label>Email<input value={(node.props.href ?? '').replace(/^mailto:/i, '')} placeholder="hello@example.com" onChange={(event) => onPatchProps({ href: event.target.value })}/></label> : null}{linkType === 'phone' ? <label>Phone<input value={(node.props.href ?? '').replace(/^tel:/i, '')} placeholder="+91..." onChange={(event) => onPatchProps({ href: event.target.value })}/></label> : null}</div>;
}

function MediaControls({ node, assets, compatibleAssets, onPatchProps, onUploadMedia }: { node: EditorNode; assets: NilaAsset[]; compatibleAssets: NilaAsset[]; onPatchProps: InspectorProps['onPatchProps']; onUploadMedia: InspectorProps['onUploadMedia'] }) {
  const selectedAsset = assets.find((asset) => asset.id === node.props.assetId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const expectedKind: 'image' | 'video' = node.type === 'video' ? 'video' : 'image';
  const accept = expectedKind === 'video' ? VIDEO_ACCEPT : IMAGE_ACCEPT;
  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file || busy) return;
    setBusy(true); setError('');
    try {
      const asset = await onUploadMedia(file, expectedKind);
      const stem = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
      onPatchProps({ assetId: asset.id, src: undefined, alt: node.props.alt || stem || (expectedKind === 'video' ? 'Video' : 'Image') });
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Upload failed.'); }
    finally { setBusy(false); }
  };
  return <div className="media-controls"><label className={`media-inline-upload${busy ? ' busy' : ''}`}><Upload size={14}/><span>{busy ? 'Uploading…' : `Upload local ${expectedKind}`}</span><input type="file" accept={accept} disabled={busy} onChange={upload}/></label>{error ? <div className="asset-error">{error}</div> : null}<label>Project asset<select value={node.props.assetId ?? ''} onChange={(event) => onPatchProps({ assetId: event.target.value || undefined, src: event.target.value ? undefined : node.props.src })}><option value="">Use URL / placeholder</option>{compatibleAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select></label>{node.props.assetId ? <small className="asset-path-note">{selectedAsset?.projectPath ?? 'Missing project asset'}</small> : <label>Source URL<input value={node.props.src ?? ''} placeholder="https://... or leave empty" onChange={(event) => onPatchProps({ src: event.target.value })}/></label>}<label>Alt text<input value={node.props.alt ?? ''} placeholder={expectedKind === 'video' ? 'Describe the video content' : 'Describe the image'} onChange={(event) => onPatchProps({ alt: event.target.value })}/></label>{node.type === 'image' ? <><label>Caption<input value={node.props.caption ?? ''} placeholder="Optional image caption" onChange={(event) => onPatchProps({ caption: event.target.value })}/></label><label>Loading<select value={node.props.loading ?? 'lazy'} onChange={(event) => onPatchProps({ loading: event.target.value as 'lazy' | 'eager' })}><option value="lazy">Lazy</option><option value="eager">Eager</option></select></label></> : null}</div>;
}

function StyleInspector({ node, parentNode, fonts, viewport, effective, onPatchStyle, onPatchParentStyle, onRemoveStyle, onResetViewportStyles }: InspectorProps & { node: EditorNode; effective: NodeStyle }) {
  const direct = node.styles[viewport];
  const parentEffective = parentNode ? mergeEffectiveStyles(parentNode, viewport) : {};
  const currentAnimation = String(effective.animationName ?? 'none');
  const currentFontId = fonts.find((font) => String(effective.fontFamily ?? '').includes(font.family))?.id ?? '';
  const currentPosition = String(effective.position ?? 'static');
  const parentIsGrid = Boolean(parentNode && (['grid', 'columns'].includes(parentNode.type) || String(parentEffective.display).includes('grid')));
  const textCapable = ['heading', 'paragraph', 'link', 'button', 'badge', 'quote', 'list'].includes(node.type);
  const fontCapable = textCapable || ['input', 'textarea', 'select', 'checkbox'].includes(node.type);
  const styleGroups = getStyleGroupsForNode(node.type);

  const applyAnimation = (id: string) => {
    const preset = ANIMATION_PRESETS.find((item) => item.id === id) ?? ANIMATION_PRESETS[0];
    onPatchStyle({ animationDuration: undefined, animationTimingFunction: undefined, animationFillMode: undefined, animationIterationCount: undefined, ...preset.styles });
  };
  const applyHorizontalPlacement = (placement: HorizontalPlacement) => {
    const patch = horizontalPlacementStyles(placement);
    if (placement !== 'stretch' && ['button', 'link', 'badge', 'icon', 'avatar'].includes(node.type)) patch.width = 'fit-content';
    onPatchStyle(patch);
  };
  const makeParentGrid = () => onPatchParentStyle({ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gridTemplateRows: 'repeat(3, minmax(72px, auto))', gap: '12px', minHeight: String(parentEffective.minHeight ?? '280px'), position: String(parentEffective.position ?? 'static') === 'static' ? 'relative' : String(parentEffective.position ?? 'relative') });
  const enableFreePosition = () => { if (parentNode) onPatchParentStyle({ position: 'relative', minHeight: String(parentEffective.minHeight ?? '320px') }); onPatchStyle({ position: 'absolute', left: String(effective.left ?? '24px'), top: String(effective.top ?? '24px'), right: 'auto', bottom: 'auto', zIndex: String(effective.zIndex ?? '10') }); };
  const restoreFlow = () => onPatchStyle({ position: 'static', left: 'auto', top: 'auto', right: 'auto', bottom: 'auto', zIndex: 'auto' });

  return <>
    <div className="responsive-style-bar"><div><strong>{viewport}</strong><span>{viewport === 'desktop' ? 'Base styles' : `${viewport} overrides desktop${viewport === 'mobile' ? ' + tablet' : ''}`}</span></div>{viewport !== 'desktop' ? <button type="button" onClick={onResetViewportStyles}><RotateCcw size={13}/> Reset overrides</button> : null}</div>
    <div className="inspector-context-note">Showing only layout and style properties that are useful for this <strong>{node.type}</strong>.</div>
    <section className="inspector-section placement-panel">
      <div className="section-row"><h3>Placement & alignment</h3><span>{parentNode ? `Inside ${parentNode.name}` : 'Page root'}</span></div>
      <div className="placement-label">Element alignment</div>
      <div className="placement-segment four-way"><button type="button" onClick={() => applyHorizontalPlacement('left')}><AlignLeft size={15}/><span>Left</span></button><button type="button" onClick={() => applyHorizontalPlacement('center')}><AlignCenter size={15}/><span>Center</span></button><button type="button" onClick={() => applyHorizontalPlacement('right')}><AlignRight size={15}/><span>Right</span></button><button type="button" onClick={() => applyHorizontalPlacement('stretch')}><span className="stretch-glyph">↔</span><span>Full</span></button></div>
      {textCapable ? <><div className="placement-label">Text alignment</div><div className="placement-segment icon-only"><button type="button" className={effective.textAlign === 'left' ? 'active' : ''} onClick={() => onPatchStyle({ textAlign: 'left' })}><AlignLeft size={16}/></button><button type="button" className={effective.textAlign === 'center' ? 'active' : ''} onClick={() => onPatchStyle({ textAlign: 'center' })}><AlignCenter size={16}/></button><button type="button" className={effective.textAlign === 'right' ? 'active' : ''} onClick={() => onPatchStyle({ textAlign: 'right' })}><AlignRight size={16}/></button><button type="button" className={effective.textAlign === 'justify' ? 'active' : ''} onClick={() => onPatchStyle({ textAlign: 'justify' })}><AlignJustify size={16}/></button></div></> : null}
      {parentNode ? <div className="placement-parent-row"><span>Parent layout: <strong>{String(parentEffective.display ?? parentNode.type)}</strong></span>{!parentIsGrid ? <button type="button" onClick={makeParentGrid}>Make 3×3 grid</button> : null}</div> : null}
      {parentIsGrid ? <><div className="placement-label">Grid cell</div><div className="placement-grid">{[1,2,3].flatMap((row) => [1,2,3].map((column) => { const active = String(effective.gridColumnStart ?? '') === String(column) && String(effective.gridRowStart ?? '') === String(row); return <button type="button" className={active ? 'active' : ''} key={`${column}-${row}`} onClick={() => onPatchStyle(gridCellStyles(column, row))}><span>{column},{row}</span></button>; }))}</div></> : null}
      <div className="placement-label">Position mode</div><div className="position-mode-buttons"><button type="button" className={currentPosition !== 'absolute' && currentPosition !== 'fixed' ? 'active' : ''} onClick={restoreFlow}>Normal flow</button><button type="button" className={currentPosition === 'absolute' ? 'active' : ''} onClick={enableFreePosition}><Move size={14}/> Free position</button></div>
      {currentPosition === 'absolute' || currentPosition === 'fixed' ? <div className="field-pair compact-placement-fields"><label>X / Left<input value={String(effective.left ?? '')} placeholder="24px" onChange={(event) => onPatchStyle({ left: event.target.value })}/></label><label>Y / Top<input value={String(effective.top ?? '')} placeholder="24px" onChange={(event) => onPatchStyle({ top: event.target.value })}/></label></div> : null}
    </section>
    {fonts.length && fontCapable ? <section className="inspector-section"><h3>Project font</h3><label>Font<select value={currentFontId} onChange={(event) => { const font = fonts.find((candidate) => candidate.id === event.target.value); if (font) onPatchStyle({ fontFamily: `"${font.family}", sans-serif`, fontWeight: font.weight, fontStyle: font.style }); else onRemoveStyle('fontFamily'); }}><option value="">Default / manual</option>{fonts.map((font) => <option value={font.id} key={font.id}>{font.family}</option>)}</select></label></section> : null}
    {supportsAnimation(node.type) ? <section className="inspector-section compact-animation"><div className="section-row"><h3>Animation</h3><span>{viewport}</span></div><label>Preset<select value={animationId(currentAnimation)} onChange={(event) => applyAnimation(event.target.value)}>{ANIMATION_PRESETS.map((preset) => <option value={preset.id} key={preset.id}>{preset.label}</option>)}</select></label><div className="field-pair"><label>Duration<input value={String(effective.animationDuration ?? '')} placeholder="600ms" onChange={(event) => onPatchStyle({ animationDuration: event.target.value })}/></label><label>Delay<input value={String(effective.animationDelay ?? '')} placeholder="0ms" onChange={(event) => onPatchStyle({ animationDelay: event.target.value })}/></label></div></section> : null}
    {styleGroups.map((group) => <section className={`inspector-section style-control-group style-group-${group.id}`} key={group.id}><div className="section-row"><h3>{group.label}</h3><span>{viewport}</span></div>{group.controls.map((control) => <StyleField key={control.property} control={control} directValue={direct[control.property]} effectiveValue={effective[control.property]} viewport={viewport} onChange={(value) => value === '' ? onRemoveStyle(control.property) : onPatchStyle({ [control.property]: value })} onClear={() => onRemoveStyle(control.property)}/>)}</section>)}
  </>;
}

function StyleField({ control, directValue, effectiveValue, viewport, onChange, onClear }: { control: StyleControl; directValue: string | number | undefined; effectiveValue: string | number | undefined; viewport: DeviceViewport; onChange: (value: string) => void; onClear: () => void }) {
  const value = directValue === undefined ? String(effectiveValue ?? '') : String(directValue);
  const inherited = viewport !== 'desktop' && directValue === undefined && effectiveValue !== undefined;
  const color = /^#[0-9a-f]{6}$/i.test(value) ? value : '#111827';
  return <div className="style-field"><div className="style-field-head"><span>{control.label}</span><div>{inherited ? <em>Inherited</em> : null}{directValue !== undefined ? <button type="button" onClick={onClear}><X size={11}/></button> : null}</div></div>{control.type === 'select' ? <select value={value} onChange={(event) => onChange(event.target.value)}>{(control.options ?? []).map((option) => <option key={option || 'default'} value={option}>{option || 'Default / inherited'}</option>)}</select> : control.type === 'color' ? <div className="color-style-input"><input type="color" value={color} onChange={(event) => onChange(event.target.value)}/><input value={value} placeholder={control.placeholder} onChange={(event) => onChange(event.target.value)}/></div> : <input value={value} placeholder={control.placeholder} onChange={(event) => onChange(event.target.value)}/>} {inherited ? <small>Using {String(effectiveValue)}</small> : null}</div>;
}

function animationId(animationName: string) { return ANIMATION_PRESETS.find((preset) => preset.styles.animationName === animationName)?.id ?? 'none'; }
