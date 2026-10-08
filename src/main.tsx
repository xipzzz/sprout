import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/app.css'
import App from './App.tsx'
import ReportButton from './components/ReportButton.tsx'

async function boot() {
  if (import.meta.env.DEV) {
    const which = new URLSearchParams(window.location.search).get('scanShot');
    if (which) {
      const { mountScanShot } = await import('./scan-shot/mount.tsx');
      mountScanShot(which);
      return;
    }
  }
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
      <ReportButton />
    </StrictMode>,
  );
}

void boot();
