import { Copy, Eye, EyeOff, Lock, RotateCcw, Trash2, Unlock, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { DeviceViewport } from '../../core/project';
import { ANIMATION_PRESETS, STYLE_GROUPS, type StyleControl } from '../styleControls';
import type { EditorNode, NodeStyle } from '../types';

interface InspectorProps {
  node: EditorNode | null;
  viewport: DeviceViewport;
  onPatch: (patch: Partial<EditorNode>) => void;
  onPatchProps: (patch: EditorNode['props']) => void;
  onPatchStyle: (patch: NodeStyle) => void;
  onRemoveStyle: (property: string) => void;
  onResetViewportStyles: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

type InspectorTab = 'content' | 'style';

function mergeEffectiveStyles(node: EditorNode, viewport: DeviceViewport): NodeStyle {
  return {
    ...node.styles.desktop,
    ...(viewport === 'tablet' || viewport === 'mobile' ? node.styles.tablet : {}),
    ...(viewport === 'mobile' ? node.styles.mobile : {}),
  };
}

export function Inspector({ node, viewport, onPatch, onPatchProps, onPatchStyle, onRemoveStyle, onResetViewportStyles, onDelete, onDuplicate }: InspectorProps) {
  const [tab, setTab] = useState<InspectorTab>('style');
  const effective = useMemo(() => node ? mergeEffectiveStyles(node, viewport) : {}, [node, viewport]);

  if (!node) return <div className="inspector-empty"><strong>No element selected</strong><p>Select an element on the canvas or in Layers.</p></div>;

  const direct = node.styles[viewport];
  const hasText = ['heading','paragraph','link','button','badge','quote'].includes(node.type);
  const hasLink = ['link','button'].includes(node.type);
  const hasMedia = ['image','avatar','video'].includes(node.type);
  const hasField = ['input','textarea','select','checkbox'].includes(node.type);
  const currentAnimation = String(effective.animationName ?? 'none');

  const applyAnimation = (id: string) => {
    const preset = ANIMATION_PRESETS.find((item) => item.id === id) ?? ANIMATION_PRESETS[0];
    onPatchStyle({ animationDuration: undefined, animationTimingFunction: undefined, animationFillMode: undefined, animationIterationCount: undefined, ...preset.styles });
  };

  return <div className="inspector-content">
    <div className="inspector-title"><div><span className="inspector-kicker">{node.type}</span><strong>{node.name}</strong></div><div className="inspector-actions"><button type="button" onClick={onDuplicate} title="Duplicate"><Copy size={15} /></button><button type="button" onClick={() => onPatch({ locked: !node.locked })} title={node.locked ? 'Unlock' : 'Lock'}>{node.locked ? <Lock size={15} /> : <Unlock size={15} />}</button><button type="button" onClick={() => onPatch({ hidden: !node.hidden })} title={node.hidden ? 'Show' : 'Hide'}>{node.hidden ? <EyeOff size={15} /> : <Eye size={15} />}</button><button type="button" onClick={onDelete} title="Delete" className="danger"><Trash2 size={15} /></button></div></div>

    <div className="inspector-tabs"><button type="button" className={tab === 'content' ? 'active' : ''} onClick={() => setTab('content')}>Content</button><button type="button" className={tab === 'style' ? 'active' : ''} onClick={() => setTab('style')}>Style</button></div>

    {tab === 'content' ? <section className="inspector-section"><h3>Content</h3><label>Name<input value={node.name} onChange={(event) => onPatch({ name: event.target.value })} /></label>
      {hasText ? <label>Text<textarea rows={4} value={node.props.text ?? ''} onChange={(event) => onPatchProps({ text: event.target.value })} /></label> : null}
      {hasLink ? <label>Link<input value={node.props.href ?? ''} onChange={(event) => onPatchProps({ href: event.target.value })} /></label> : null}
      {hasMedia ? <><label>Source URL<input value={node.props.src ?? ''} onChange={(event) => onPatchProps({ src: event.target.value })} /></label><label>Alt text<input value={node.props.alt ?? ''} onChange={(event) => onPatchProps({ alt: event.target.value })} /></label></> : null}
      {hasField ? <label>Label<input value={node.props.label ?? ''} onChange={(event) => onPatchProps({ label: event.target.value })} /></label> : null}
      {['input','textarea'].includes(node.type) ? <label>Placeholder<input value={node.props.placeholder ?? ''} onChange={(event) => onPatchProps({ placeholder: event.target.value })} /></label> : null}
      {node.type === 'list' ? <label>Items<textarea rows={5} value={(node.props.items ?? []).join('\n')} onChange={(event) => onPatchProps({ items: event.target.value.split('\n').filter(Boolean) })} /></label> : null}
      {node.type === 'select' ? <label>Options<textarea rows={5} value={(node.props.options ?? []).join('\n')} onChange={(event) => onPatchProps({ options: event.target.value.split('\n').filter(Boolean) })} /></label> : null}
      {node.type === 'checkbox' ? <label className="inline-check"><input type="checkbox" checked={Boolean(node.props.checked)} onChange={(event) => onPatchProps({ checked: event.target.checked })} /> Checked</label> : null}
    </section> : <>
      <div className="responsive-style-bar"><div><strong>{viewport}</strong><span>{viewport === 'desktop' ? 'Base styles' : `${viewport} overrides desktop${viewport === 'mobile' ? ' + tablet' : ''}`}</span></div>{viewport !== 'desktop' ? <button type="button" onClick={onResetViewportStyles} title="Clear all device overrides"><RotateCcw size={13} /> Reset overrides</button> : null}</div>

      <section className="inspector-section"><div className="section-row"><h3>Animation</h3><span>{viewport}</span></div><label>Preset<select value={animationId(currentAnimation)} onChange={(event) => applyAnimation(event.target.value)}>{ANIMATION_PRESETS.map((preset) => <option value={preset.id} key={preset.id}>{preset.label}</option>)}</select></label><div className="field-pair"><label>Duration<input value={String(effective.animationDuration ?? '')} placeholder="600ms" onChange={(event) => onPatchStyle({ animationDuration: event.target.value })} /></label><label>Delay<input value={String(effective.animationDelay ?? '')} placeholder="0ms" onChange={(event) => onPatchStyle({ animationDelay: event.target.value })} /></label></div></section>

      {STYLE_GROUPS.map((group) => <section className="inspector-section style-control-group" key={group.id}><div className="section-row"><h3>{group.label}</h3><span>{viewport}</span></div>{group.controls.map((control) => <StyleField key={control.property} control={control} directValue={direct[control.property]} effectiveValue={effective[control.property]} viewport={viewport} onChange={(value) => value === '' ? onRemoveStyle(control.property) : onPatchStyle({ [control.property]: value })} onClear={() => onRemoveStyle(control.property)} />)}</section>)}
    </>}
  </div>;
}

function StyleField({ control, directValue, effectiveValue, viewport, onChange, onClear }: { control: StyleControl; directValue: string | number | undefined; effectiveValue: string | number | undefined; viewport: DeviceViewport; onChange: (value: string) => void; onClear: () => void }) {
  const value = directValue === undefined ? String(effectiveValue ?? '') : String(directValue);
  const inherited = viewport !== 'desktop' && directValue === undefined && effectiveValue !== undefined;
  const color = /^#[0-9a-f]{6}$/i.test(value) ? value : '#111827';
  return <div className="style-field"><div className="style-field-head"><span>{control.label}</span><div>{inherited ? <em>Inherited</em> : null}{directValue !== undefined ? <button type="button" onClick={onClear} title={`Clear ${control.label} override`}><X size={11} /></button> : null}</div></div>{control.type === 'select' ? <select value={value} onChange={(event) => onChange(event.target.value)}>{(control.options ?? []).map((option) => <option key={option || 'default'} value={option}>{option || 'Default / inherited'}</option>)}</select> : control.type === 'color' ? <div className="color-style-input"><input type="color" value={color} onChange={(event) => onChange(event.target.value)} /><input value={value} placeholder={control.placeholder} onChange={(event) => onChange(event.target.value)} /></div> : <input value={value} placeholder={control.placeholder} onChange={(event) => onChange(event.target.value)} />}{inherited ? <small>Using {String(effectiveValue)}</small> : null}</div>;
}

function animationId(animationName: string) {
  return ANIMATION_PRESETS.find((preset) => preset.styles.animationName === animationName)?.id ?? 'none';
}
