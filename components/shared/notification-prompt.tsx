'use client';

/**
 * AethLife — Smart Notification + PWA Install Prompt
 *
 * Shows AFTER the user has been in the dashboard for 30 seconds
 * (not immediately on load — that's what causes people to deny).
 *
 * Wire into dashboard layout:
 *   <NotificationAndPWAPrompt />
 */

import { useState, useEffect, useRef } from 'react';
import { Bell, BellOff, Download, X, ChevronRight } from 'lucide-react';
import { getFCMToken, saveFCMToken } from '@/lib/firebase/messaging';
import { createClient } from '@/lib/supabase/client';

type Step = 'idle' | 'notification' | 'pwa' | 'done';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function NotificationAndPWAPrompt() {
  const [step, setStep]       = useState<Step>('idle');
  const [loading, setLoading] = useState(false);
  const deferredRef           = useRef<BeforeInstallPromptEvent | null>(null);
  const supabase              = createClient();

  useEffect(() => {
    // Capture the PWA install event
    const onInstall = (e: Event) => {
      e.preventDefault();
      deferredRef.current = e as BeforeInstallPromptEvent;
    };
    window.addEventListener('beforeinstallprompt', onInstall);

    // Already installed check
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as { standalone?: boolean }).standalone === true;

    // Already granted check
    const notifGranted   = 'Notification' in window && Notification.permission === 'granted';
    const promptedBefore = localStorage.getItem('aethlife_notif_prompted');

    if (isInstalled && notifGranted) return;

    // Wait 30 seconds before showing prompt — user needs to engage first
    const timer = setTimeout(() => {
      if (!notifGranted && !promptedBefore) {
        setStep('notification');
      } else if (!isInstalled && deferredRef.current) {
        setStep('pwa');
      }
    }, 30_000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', onInstall);
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
        setStep('pwa');
      } else {
        setStep('done');
      }
    } catch {
      setStep('done');
    } finally {
      setLoading(false);
    }
  }

  async function handleInstallPWA() {
    if (!deferredRef.current) { setStep('done'); return; }
    setLoading(true);
    try {
      await deferredRef.current.prompt();
      const { outcome } = await deferredRef.current.userChoice;
      if (outcome === 'accepted') deferredRef.current = null;
    } catch { /* ignore */ }
    finally { setLoading(false); setStep('done'); }
  }

  if (step === 'idle' || step === 'done') return null;

  return (
    <div
      className="fixed bottom-24 left-4 right-4 lg:bottom-6 lg:left-auto lg:right-6 lg:w-80 z-50 animate-slide-up"
      role="dialog"
      aria-modal="false"
    >
      <div className="bg-card border border-border rounded-3xl shadow-float overflow-hidden">
        {/* Dismiss */}
        <button
          onClick={() => { localStorage.setItem('aethlife_notif_prompted', '1'); setStep('done'); }}
          className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="p-5">
          {/* ── Notification prompt ── */}
          {step === 'notification' && (
            <>
              <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center mb-4">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <h3
                className="font-semibold text-foreground mb-1.5"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                Stay on track
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Get gentle nudges when your streak is at risk or when new AI insights are ready.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleEnableNotifications}
                  disabled={loading}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 text-sm"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Bell className="w-3.5 h-3.5" /> Enable</>
                  )}
                </button>
                <button
                  onClick={() => { localStorage.setItem('aethlife_notif_prompted', '1'); setStep('pwa'); }}
                  className="flex-1 btn-ghost flex items-center justify-center gap-1.5 py-2.5 text-sm"
                >
                  <BellOff className="w-3.5 h-3.5" /> Not now
                </button>
              </div>
            </>
          )}

          {/* ── PWA install prompt ── */}
          {step === 'pwa' && deferredRef.current && (
            <>
              <div className="w-10 h-10 rounded-2xl bg-violet-500/15 flex items-center justify-center mb-4">
                <Download className="w-5 h-5 text-violet-400" />
              </div>
              <h3
                className="font-semibold text-foreground mb-1.5"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                Add to home screen
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Install AethLife as an app for faster access and offline support — no App Store needed.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleInstallPWA}
                  disabled={loading}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 text-sm"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Download className="w-3.5 h-3.5" /> Install</>
                  )}
                </button>
                <button
                  onClick={() => setStep('done')}
                  className="flex-1 btn-ghost flex items-center justify-center py-2.5 text-sm"
                >
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
