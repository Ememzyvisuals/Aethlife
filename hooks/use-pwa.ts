'use client';

import { useEffect } from 'react';

export function usePWA() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.info('[AethLife PWA] Service worker registered:', registration.scope);

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available — could show update prompt here
              console.info('[AethLife PWA] New version available');
            }
          });
        });
      })
      .catch((err) => {
        console.warn('[AethLife PWA] Service worker registration failed:', err);
      });

    // Listen for sync messages from SW
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SYNC_START') {
        console.info('[AethLife PWA] Background sync started');
      }
    });
  }, []);
}
