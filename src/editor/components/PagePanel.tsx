import { Copy, FilePlus2, Home, Search, Settings2, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { NilaPage } from '../../core/project';
import { routeForPage } from '../linking';

interface PagePanelProps {
  pages: NilaPage[];
  activePageId: string;
  onActivate: (pageId: string) => void;
  onAdd: () => void;
  onRename: (pageId: string, name: string) => void;
  onSlugChange: (pageId: string, slug: string) => void;
  onSetHome: (pageId: string) => void;
  onDuplicate: (pageId: string) => void;
  onDelete: (pageId: string) => void;
}

export function PagePanel({ pages, activePageId, onActivate, onAdd, onRename, onSlugChange, onSetHome, onDuplicate, onDelete }: PagePanelProps) {
  const [query, setQuery] = useState('');
  const activePage = pages.find((page) => page.id === activePageId) ?? pages[0];
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return pages;
    return pages.filter((page) => `${page.name} ${page.slug} ${routeForPage(page)}`.toLowerCase().includes(value));
  }, [pages, query]);

  return <div className="page-panel page-panel-v2">
    <div className="page-panel-toolbar">
      <div className="page-search"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pages" aria-label="Search pages" /></div>
      <button type="button" className="page-add page-add-icon" onClick={onAdd} title="Add page"><FilePlus2 size={15} /><span>Add</span></button>
    </div>

    <div className="page-list page-list-v2">
      {filtered.map((page) => {
        const active = activePageId === page.id;
        return <button type="button" className={`page-row${active ? ' active' : ''}`} key={page.id} onClick={() => onActivate(page.id)}>
          <span className={`page-row-icon${page.isHome ? ' home' : ''}`}>{page.isHome ? <Home size={14} /> : <span>{page.name.slice(0, 1).toUpperCase()}</span>}</span>
          <span className="page-row-copy"><strong>{page.name || 'Untitled page'}</strong><small>{routeForPage(page)}</small></span>
          {page.isHome ? <span className="page-home-badge">Home</span> : null}
        </button>;
      })}
      {filtered.length === 0 ? <div className="page-empty">No pages match “{query}”.</div> : null}
    </div>

    {activePage ? <section className="page-detail-card">
      <div className="page-detail-title"><span><Settings2 size={14} /> Page settings</span><small>{activePage.isHome ? '/' : `/${activePage.slug}`}</small></div>
      <label>Page name<input value={activePage.name} onChange={(event) => onRename(activePage.id, event.target.value)} placeholder="Page name" /></label>
      <label>URL path<div className={`slug-field${activePage.isHome ? ' disabled' : ''}`}><span>/</span><input disabled={activePage.isHome} value={activePage.isHome ? '' : activePage.slug} placeholder={activePage.isHome ? 'Home uses /' : 'page-url'} onChange={(event) => onSlugChange(activePage.id, event.target.value)} /></div></label>
      <p className="page-route-help">{activePage.isHome ? 'This is the site home page.' : `Published route: /${activePage.slug || 'page'}`}</p>
      <div className="page-action-grid">
        <button type="button" disabled={activePage.isHome} onClick={() => onSetHome(activePage.id)}><Home size={13} /><span>Set home</span></button>
        <button type="button" onClick={() => onDuplicate(activePage.id)}><Copy size={13} /><span>Duplicate</span></button>
        <button type="button" className="danger" disabled={pages.length === 1} onClick={() => onDelete(activePage.id)}><Trash2 size={13} /><span>Delete</span></button>
      </div>
    </section> : null}
  </div>;
}
