import { Copy, Eye, EyeOff, Lock, Trash2, Unlock } from 'lucide-react';
import type { DeviceViewport } from '../../core/project';
import type { EditorNode, NodeStyle } from '../types';

interface InspectorProps { node: EditorNode | null; viewport: DeviceViewport; onPatch: (patch: Partial<EditorNode>) => void; onPatchProps: (patch: EditorNode['props']) => void; onPatchStyle: (patch: NodeStyle) => void; onDelete: () => void; onDuplicate: () => void; }

export function Inspector({ node, viewport, onPatch, onPatchProps, onPatchStyle, onDelete, onDuplicate }: InspectorProps) {
  if (!node) return <div className="inspector-empty"><strong>No element selected</strong><p>Select an element on the canvas or in Layers.</p></div>;
  const style = node.styles[viewport];
  const inherited = node.styles.desktop;
  const value = (key: string) => String(style[key] ?? (viewport !== 'desktop' ? inherited[key] ?? '' : ''));
  const hasText = ['heading','paragraph','link','button','badge','quote'].includes(node.type);
  const hasLink = ['link','button'].includes(node.type);
  const hasMedia = ['image','avatar','video'].includes(node.type);
  const hasField = ['input','textarea','select','checkbox'].includes(node.type);

  return <div className="inspector-content">
    <div className="inspector-title"><div><span className="inspector-kicker">{node.type}</span><strong>{node.name}</strong></div><div className="inspector-actions"><button type="button" onClick={onDuplicate} title="Duplicate"><Copy size={15} /></button><button type="button" onClick={() => onPatch({ locked: !node.locked })} title={node.locked ? 'Unlock' : 'Lock'}>{node.locked ? <Lock size={15} /> : <Unlock size={15} />}</button><button type="button" onClick={() => onPatch({ hidden: !node.hidden })} title={node.hidden ? 'Show' : 'Hide'}>{node.hidden ? <EyeOff size={15} /> : <Eye size={15} />}</button><button type="button" onClick={onDelete} title="Delete" className="danger"><Trash2 size={15} /></button></div></div>
    <section className="inspector-section"><h3>Content</h3><label>Name<input value={node.name} onChange={(event) => onPatch({ name: event.target.value })} /></label>
      {hasText ? <label>Text<textarea rows={4} value={node.props.text ?? ''} onChange={(event) => onPatchProps({ text: event.target.value })} /></label> : null}
      {hasLink ? <label>Link<input value={node.props.href ?? ''} onChange={(event) => onPatchProps({ href: event.target.value })} /></label> : null}
      {hasMedia ? <><label>Source URL<input value={node.props.src ?? ''} onChange={(event) => onPatchProps({ src: event.target.value })} /></label><label>Alt text<input value={node.props.alt ?? ''} onChange={(event) => onPatchProps({ alt: event.target.value })} /></label></> : null}
      {hasField ? <label>Label<input value={node.props.label ?? ''} onChange={(event) => onPatchProps({ label: event.target.value })} /></label> : null}
      {['input','textarea'].includes(node.type) ? <label>Placeholder<input value={node.props.placeholder ?? ''} onChange={(event) => onPatchProps({ placeholder: event.target.value })} /></label> : null}
      {node.type === 'list' ? <label>Items<textarea rows={5} value={(node.props.items ?? []).join('\n')} onChange={(event) => onPatchProps({ items: event.target.value.split('\n').filter(Boolean) })} /></label> : null}
      {node.type === 'select' ? <label>Options<textarea rows={5} value={(node.props.options ?? []).join('\n')} onChange={(event) => onPatchProps({ options: event.target.value.split('\n').filter(Boolean) })} /></label> : null}
      {node.type === 'checkbox' ? <label className="inline-check"><input type="checkbox" checked={Boolean(node.props.checked)} onChange={(event) => onPatchProps({ checked: event.target.checked })} /> Checked</label> : null}
    </section>
    <section className="inspector-section"><div className="section-row"><h3>Style</h3><span>{viewport}</span></div><label>Padding<input placeholder="24px" value={value('padding')} onChange={(event) => onPatchStyle({ padding: event.target.value })} /></label><label>Gap<input placeholder="16px" value={value('gap')} onChange={(event) => onPatchStyle({ gap: event.target.value })} /></label><div className="field-pair"><label>Text color<input type="color" value={colorValue(value('color'), '#111827')} onChange={(event) => onPatchStyle({ color: event.target.value })} /></label><label>Background<input type="color" value={colorValue(value('background'), '#ffffff')} onChange={(event) => onPatchStyle({ background: event.target.value })} /></label></div><label>Border radius<input placeholder="12px" value={value('borderRadius')} onChange={(event) => onPatchStyle({ borderRadius: event.target.value })} /></label></section>
  </div>;
}
function colorValue(value: string, fallback: string) { return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback; }
