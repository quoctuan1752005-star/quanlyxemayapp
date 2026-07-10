// Polyfill to prevent "Cannot set property fetch of #<Window> which has only a getter" error
try {
  const originalFetch = window.fetch;
  let currentFetch = originalFetch;
  Object.defineProperty(window, 'fetch', {
    get() {
      return currentFetch;
    },
    set(val) {
      console.warn("Attempted to set window.fetch, ignoring to prevent error.", val);
      currentFetch = val;
    },
    configurable: true,
    enumerable: true,
  });
} catch (e) {
  console.error("Failed to polyfill window.fetch getter/setter:", e);
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

registerSW({
  immediate: true,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
