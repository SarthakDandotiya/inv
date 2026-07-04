import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Fonts we want ready before first paint of the app.
const FONT_SPECS = ['400 1rem "DM Sans"', '500 1rem "DM Sans"', '700 1rem "DM Sans"'];
// Never block rendering longer than this — fall back to system fonts if the CDN
// is slow, blocked, or the Font Loading API is unavailable.
const FONT_TIMEOUT_MS = 3000;

function waitForFonts(): Promise<unknown> {
  const timeout = new Promise((resolve) => setTimeout(resolve, FONT_TIMEOUT_MS));
  try {
    if (!('fonts' in document)) return timeout;
    const loaded = Promise.all(FONT_SPECS.map((spec) => document.fonts.load(spec)))
      .then(() => document.fonts.ready)
      .catch(() => undefined);
    return Promise.race([loaded, timeout]);
  } catch {
    return timeout;
  }
}

function render() {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

// Gate the first render on font readiness, but always render eventually.
waitForFonts().finally(render);
