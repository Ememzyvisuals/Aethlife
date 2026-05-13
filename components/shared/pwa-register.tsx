'use client';

import { useEffect } from 'react';

/**
 * PwaRegister — mounts at the root layout level.
 *
 * Two jobs:
 * 1. Registers the service worker (required for PWA install + push notifications)
 * 2. Re-captures the beforeinstallprompt event in case it already fired
 *    before the notification prompt component mounted.
 *
 * The global script in layout.tsx <head> captures it first (before any React),
 * this component is a safety net and handles the SW registration.
 */
export function PwaRegister() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.info('[AethLife] SW registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('[AethLife] SW registration failed:', err);
        });
    }

    // Capture beforeinstallprompt if not already caught by the head script
    const handler = (e: Event) => {
      e.preventDefault();
      (window as Window & { __pwaInstallEvent?: Event }).__pwaInstallEvent = e;
      window.dispatchEvent(new Event('pwa-install-ready'));
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  return null; // renders nothing
}
