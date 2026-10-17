import { ArrowDownToLine, Blocks, Cloud, LayoutDashboard, LayoutTemplate, Plus, Replace, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SECTION_PRESETS, TEMPLATE_PRESETS, type CatalogKind, type CatalogPreset } from '../catalog';
import { EXTRA_SECTION_PRESETS, EXTRA_TEMPLATE_PRESETS } from '../catalogExtras';
import { ShadcnSpaceLibrary } from './ShadcnSpaceLibrary';

export type PresetInsertMode = 'append' | 'replace';

interface CatalogBrowserProps {
  kind: CatalogKind;
  onInsert: (preset: CatalogPreset, mode?: PresetInsertMode) => void;
}

function PreviewGraphic({ preset }: { preset: CatalogPreset }) {
  const animated = preset.tags.includes('animated') || preset.category === 'Animated';
  const dashboard = preset.tags.includes('dashboard') || preset.category === 'Dashboard' || preset.category === 'Application';
  const Icon = dashboard ? LayoutDashboard : animated ? Sparkles : kindIcon(preset.kind);
  return (
    <div className={`catalog-preview-visual${animated ? ' animated' : ''}${dashboard ? ' dashboard' : ''}`}>
      <div className="catalog-preview-window">
        <div className="catalog-preview-top"><i /><i /><i /></div>
        <div className="catalog-preview-layout"><span className="preview-line wide" /><span className="preview-line" /><div className="preview-cards"><i /><i /><i /></div></div>
      </div>
      <span className="catalog-preview-icon"><Icon size={17} /></span>
      {animated ? <span className="catalog-motion-badge"><Sparkles size={11} /> Motion</span> : null}
    </div>
  );
}

function kindIcon(kind: CatalogKind) { return kind === 'template' ? LayoutTemplate : Blocks; }

function NativeCatalog({ kind, onInsert }: CatalogBrowserProps) {
  const presets = useMemo(() => kind === 'section' ? [...SECTION_PRESETS, ...EXTRA_SECTION_PRESETS] : [...TEMPLATE_PRESETS, ...EXTRA_TEMPLATE_PRESETS], [kind]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState<'featured' | 'az'>('featured');
  const categories = useMemo(() => ['All', ...Array.from(new Set(presets.map((item) => item.category)))], [presets]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const next = presets.filter((item) => {
      const matchesQuery = !q || `${item.name} ${item.description} ${item.tags.join(' ')} ${item.category}`.toLowerCase().includes(q);
      return matchesQuery && (category === 'All' || item.category === category);
    });
    return sort === 'az' ? [...next].sort((a, b) => a.name.localeCompare(b.name)) : next;
  }, [category, presets, query, sort]);

  return <>
    {kind === 'template' ? <div className="template-behavior-note"><Replace size={14} /><span><strong>Use template</strong> replaces this page. <strong>Add below</strong> keeps existing content.</span></div> : <div className="catalog-intro"><Blocks size={15} /><div><strong>Composable blocks</strong><span>Marketing, animated, application and dashboard patterns built from editable Nila elements.</span></div></div>}
    <div className="catalog-toolbar">
      <div className="catalog-search"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${kind === 'section' ? 'blocks' : 'templates'}`} /></div>
      <select className="catalog-sort" value={sort} onChange={(event) => setSort(event.target.value as 'featured' | 'az')} aria-label="Sort catalog"><option value="featured">Featured</option><option value="az">A–Z</option></select>
    </div>
    <div className="catalog-categories">{categories.map((item) => <button type="button" key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}<span>{presets.filter((preset) => item === 'All' || preset.category === item).length}</span></button>)}</div>
    <div className="catalog-results-meta"><span>{filtered.length} results</span><span>{kind === 'section' ? 'Insert anywhere' : 'Complete page starters'}</span></div>
    <div className="catalog-list">
      {filtered.map((preset) => {
        const animated = preset.tags.includes('animated') || preset.category === 'Animated';
        return (
          <article className={`catalog-card catalog-card-v3${animated ? ' is-animated' : ''}`} key={preset.id}>
            <PreviewGraphic preset={preset} />
            <div className="catalog-card-body">
              <div className="catalog-card-title"><div><span className="catalog-kind-label">{kind === 'section' ? 'Block' : 'Template'}</span><strong>{preset.name}</strong></div><span className="catalog-category-pill">{preset.category}</span></div>
              <p>{preset.description}</p>
              <div className="catalog-tags">{preset.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}</div>
            </div>
            {kind === 'template' ? <div className="catalog-template-actions">
              <button type="button" className="catalog-insert primary" onClick={() => onInsert(preset, 'replace')}><Replace size={14} /> Use template</button>
              <button type="button" className="catalog-insert secondary" onClick={() => onInsert(preset, 'append')}><ArrowDownToLine size={14} /> Add below</button>
            </div> : <button type="button" className="catalog-insert" onClick={() => onInsert(preset, 'append')}><Plus size={14} /> Insert block</button>}
          </article>
        );
      })}
      {filtered.length === 0 ? <div className="catalog-empty"><Search size={20} /><strong>No matches</strong><span>Try another keyword or category.</span></div> : null}
    </div>
  </>;
}

export function CatalogBrowser({ kind, onInsert }: CatalogBrowserProps) {
  const [source, setSource] = useState<'nila' | 'shadcnspace'>('nila');
  return (
    <div className="catalog-browser catalog-browser-v3">
      <div className="library-source-tabs">
        <button type="button" className={source === 'nila' ? 'active' : ''} onClick={() => setSource('nila')}><Blocks size={14} /> Nila library</button>
        <button type="button" className={source === 'shadcnspace' ? 'active' : ''} onClick={() => setSource('shadcnspace')}><Cloud size={14} /> ShadcnSpace MCP</button>
      </div>
      {source === 'nila' ? <NativeCatalog kind={kind} onInsert={onInsert} /> : <ShadcnSpaceLibrary mode={kind === 'section' ? 'blocks' : 'pages'} />}
    </div>
  );
}
