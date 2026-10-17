import { ArrowDownToLine, LayoutTemplate, Plus, Replace, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SECTION_PRESETS, TEMPLATE_PRESETS, type CatalogKind, type CatalogPreset } from '../catalog';

export type PresetInsertMode = 'append' | 'replace';

interface CatalogBrowserProps {
  kind: CatalogKind;
  onInsert: (preset: CatalogPreset, mode?: PresetInsertMode) => void;
}

export function CatalogBrowser({ kind, onInsert }: CatalogBrowserProps) {
  const presets = kind === 'section' ? SECTION_PRESETS : TEMPLATE_PRESETS;
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const categories = useMemo(() => ['All', ...Array.from(new Set(presets.map((item) => item.category)))], [presets]);
  const filtered = presets.filter((item) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || `${item.name} ${item.description} ${item.tags.join(' ')}`.toLowerCase().includes(q);
    return matchesQuery && (category === 'All' || item.category === category);
  });

  return (
    <div className="catalog-browser catalog-browser-v2">
      {kind === 'template' ? <div className="template-behavior-note"><Replace size={14} /><span><strong>Use template</strong> replaces the current page. You can Undo immediately if needed.</span></div> : null}
      <div className="catalog-search"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${kind}s`} /></div>
      <div className="catalog-categories">{categories.map((item) => <button type="button" key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <div className="catalog-list">
        {filtered.map((preset) => (
          <article className="catalog-card" key={preset.id}>
            <div className="catalog-preview"><LayoutTemplate size={22} /><span>{preset.category}</span></div>
            <div className="catalog-card-body"><strong>{preset.name}</strong><p>{preset.description}</p><div className="catalog-tags">{preset.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div></div>
            {kind === 'template' ? <div className="catalog-template-actions">
              <button type="button" className="catalog-insert primary" onClick={() => onInsert(preset, 'replace')}><Replace size={14} /> Use template</button>
              <button type="button" className="catalog-insert secondary" onClick={() => onInsert(preset, 'append')}><ArrowDownToLine size={14} /> Add below</button>
            </div> : <button type="button" className="catalog-insert" onClick={() => onInsert(preset, 'append')}><Plus size={14} /> Insert section</button>}
          </article>
        ))}
        {filtered.length === 0 ? <div className="catalog-empty">No matching {kind}s.</div> : null}
      </div>
    </div>
  );
}
