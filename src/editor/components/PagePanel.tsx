import { Copy, FilePlus2, Home, MoreHorizontal, Trash2 } from 'lucide-react';
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
  return <div className="page-panel">
    <button type="button" className="page-add" onClick={onAdd}><FilePlus2 size={14} /> Add page</button>
    <div className="page-list">{pages.map((page) => <article className={`page-card${activePageId === page.id ? ' active' : ''}`} key={page.id}>
      <button type="button" className="page-select" onClick={() => onActivate(page.id)}>
        <span className="page-icon">{page.isHome ? <Home size={13} /> : <MoreHorizontal size={13} />}</span>
        <span><strong>{page.name}</strong><small>{routeForPage(page)}</small></span>
      </button>
      {activePageId === page.id ? <div className="page-settings">
        <label>Name<input value={page.name} onChange={(event) => onRename(page.id, event.target.value)} /></label>
        <label>Slug<div className="slug-field"><span>/</span><input disabled={page.isHome} value={page.isHome ? '' : page.slug} placeholder={page.isHome ? 'home' : 'page'} onChange={(event) => onSlugChange(page.id, event.target.value)} /></div></label>
        <div className="page-actions">
          <button type="button" disabled={page.isHome} onClick={() => onSetHome(page.id)}><Home size={12} /> Set home</button>
          <button type="button" onClick={() => onDuplicate(page.id)}><Copy size={12} /> Duplicate</button>
          <button type="button" className="danger" disabled={pages.length === 1} onClick={() => onDelete(page.id)}><Trash2 size={12} /> Delete</button>
        </div>
      </div> : null}
    </article>)}</div>
  </div>;
}
