import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Intercept window.fetch to attach Bearer token and include credentials for cross-origin API calls
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const token = localStorage.getItem('token');
  const modifiedInit: RequestInit = { ...init };

  if (!modifiedInit.credentials) {
    modifiedInit.credentials = 'include';
  }

  if (token) {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
    const isTargetApi = !urlStr.startsWith('http') || (apiUrl && urlStr.startsWith(apiUrl));

    if (isTargetApi) {
      const headers = new Headers(modifiedInit.headers || {});
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      modifiedInit.headers = headers;
    }
  }

  return originalFetch(input, modifiedInit);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
