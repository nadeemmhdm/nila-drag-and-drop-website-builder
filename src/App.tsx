import { APP_NAME, APP_VERSION, VIEWPORTS } from './core/constants';

const phases = [
  'Foundation & architecture',
  'Editor + drag-and-drop engine',
  'Elements, sections & template catalog',
  'Style inspector + responsive controls',
  'Multi-page routing + internal/external links',
  'Assets, fonts, icons & upload pipeline',
  'SEO, AEO, GEO + robots/security/llms/sitemap',
  'Preview, ZIP export + GitHub export',
  'Offline installer, updater + local workspaces',
  'Security hardening, tests, docs + release',
];

export function App() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Open source · Local first</p>
          <h1>{APP_NAME}</h1>
        </div>
        <span className="version">v{APP_VERSION}</span>
      </header>

      <section className="hero-card">
        <div>
          <p className="eyebrow">Phase 1</p>
          <h2>Foundation is ready for the visual editor engine.</h2>
          <p>
            This phase establishes the React + Vite + TypeScript base, offline-safe architecture,
            responsive viewport constants, project schema, repository governance and CI.
          </p>
        </div>

        <div className="viewport-grid" aria-label="Supported editor viewport widths">
          {Object.entries(VIEWPORTS).map(([name, width]) => (
            <article className="viewport-card" key={name}>
              <strong>{name}</strong>
              <span>{width}px</span>
            </article>
          ))}
        </div>
      </section>

      <section className="roadmap-card">
        <div className="section-heading">
          <p className="eyebrow">Build roadmap</p>
          <h2>10 phases</h2>
        </div>
        <ol className="phase-list">
          {phases.map((phase, index) => (
            <li className={index === 0 ? 'active' : ''} key={phase}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <p>{phase}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
