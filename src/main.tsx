import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { registerOfflineWorker } from './offline/registerServiceWorker';
import './styles/index.css';
import './styles/seo.css';
import './styles/editor-ux.css';

const root = document.getElementById('root');
if (!root) throw new Error('Nila root element was not found.');
createRoot(root).render(<StrictMode><App /></StrictMode>);
registerOfflineWorker();
