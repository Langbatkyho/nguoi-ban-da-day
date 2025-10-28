
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);

      // Logic to handle updates and activate the new service worker immediately.
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // A new SW is installed and waiting. Send a message to force activation.
              console.log('New service worker is waiting. Sending SKIP_WAITING message.');
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        }
      });

    }).catch(err => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
