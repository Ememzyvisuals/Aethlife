'use client';

/**
 * AethLife — Smart Notification + PWA Install Prompt
 *
 * Shows after 30 seconds of dashboard use.
 * Reads the install event from window.__pwaInstallEvent
 * which is captured by the global script in layout.tsx <head>
 * BEFORE React even loads — so we never miss it.
 */

import { useState, useEffect } from 'react';
import { Bell, BellOff, Download, X } from 'lucide-react';
import { getFCMToken, saveFCMToken } from '@/lib/firebase/messaging';
import { createClient } from '@/lib/supabase/client';

type Step = 'idle' | 'notification' | 'pwa' | 'done';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    __pwaInstallEvent?: BeforeInstallPromptEvent;
  }
}

export function NotificationAndPWAPrompt() {
  const [step, setStep]       = useState<Step>('idle');
  const [loading, setLoading] = useState(false);
  const supabase              = createClient();

  useEffect(() => {
    const alreadyGranted  = 'Notification' in window && Notification.permission === 'granted';
    const promptedBefore  = localStorage.getItem('aethlife_notif_prompted');
    const isInstalled     = window.matchMedia('(display-mode: standalone)').matches;

    // Show notification prompt after 30 seconds if not already handled
    const timer = setTimeout(() => {
      if (!alreadyGranted && !promptedBefore) {
        setStep('notification');
        return;
      }
      // Skip to PWA if notifications already sorted
      if (!isInstalled && window.__pwaInstallEvent) {
        setStep('pwa');
      }
    }, 30_000);

    // Also listen for the pwa-install-ready custom event
    const onInstallReady = () => {
      if (step === 'idle') setStep('pwa');
    };
    window.addEventListener('pwa-install-ready', onInstallReady);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('pwa-install-ready', onInstallReady);
    };
  }, []);

  async function handleEnableNotifications() {
    setLoading(true);
    localStorage.setItem('aethlife_notif_prompted', '1');
    try {
      const token = await getFCMToken();
      if (token) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await saveFCMToken(user.id, token);
      }
    } catch { /* ignore */ }
    finally {
      setLoading(false);
      // Move to PWA step if install event exists
      if (window.__pwaInstallEvent) {
        setStep('pwa');
      } else {
        setStep('done');
      }
    }
  }

  async function handleInstallPWA() {
    const evt = window.__pwaInstallEvent;
    if (!evt) { setStep('done'); return; }
    setLoading(true);
    try {
      await evt.prompt();
      const { outcome } = await evt.userChoice;
      if (outcome === 'accepted') {
        window.__pwaInstallEvent = undefined;
      }
    } catch { /* ignore */ }
    finally {
      setLoading(false);
      setStep('done');
    }
  }

  function dismiss() {
    localStorage.setItem('aethlife_notif_prompted', '1');
    setStep('done');
  }

  if (step === 'idle' || step === 'done') return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 lg:bottom-6 lg:left-auto lg:right-6 lg:w-80 z-50 animate-slide-up">
      <div className="bg-card border border-border rounded-3xl shadow-float overflow-hidden">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="p-5">
          {step === 'notification' && (
            <>
              <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center mb-4">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1.5" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                Stay on track
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Get nudges when your streak is at risk or new AI insights are ready.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleEnableNotifications}
                  disabled={loading}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 text-sm"
                >
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><Bell className="w-3.5 h-3.5" /> Enable</>
                  }
                </button>
                <button onClick={dismiss} className="flex-1 btn-ghost flex items-center justify-center gap-1.5 py-2.5 text-sm">
                  <BellOff className="w-3.5 h-3.5" /> Not now
                </button>
              </div>
            </>
          )}

          {step === 'pwa' && window.__pwaInstallEvent && (
            <>
              <div className="w-10 h-10 rounded-2xl bg-violet-500/15 flex items-center justify-center mb-4">
                <Download className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-1.5" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                Add to home screen
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Install AethLife as an app. Works offline, loads instantly — no App Store needed.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleInstallPWA}
                  disabled={loading}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 text-sm"
                >
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><Download className="w-3.5 h-3.5" /> Install</>
                  }
                </button>
                <button onClick={() => setStep('done')} className="flex-1 btn-ghost flex items-center justify-center py-2.5 text-sm">
                  Later
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
