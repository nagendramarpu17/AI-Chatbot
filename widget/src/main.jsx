import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Find the script tag that loaded this bundle to extract the site key
const scriptTag = document.currentScript || document.querySelector('script[data-site-key]');
const siteKey = scriptTag?.getAttribute('data-site-key') || "";

// Create the host element for the Shadow DOM
const host = document.createElement('div');
host.id = 'smiles-chat-widget';
document.body.appendChild(host);

// Create the Shadow Root to prevent CSS leaking
const shadow = host.attachShadow({ mode: 'open' });
const renderRoot = document.createElement('div');
shadow.appendChild(renderRoot);

ReactDOM.createRoot(renderRoot).render(
  <React.StrictMode>
    {/* We pass siteKey as a prop here */}
    <App siteKey={siteKey} />
  </React.StrictMode>
);