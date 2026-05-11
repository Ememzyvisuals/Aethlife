'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Logo } from '@/components/shared/logo';

export function ResetForm() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [show, setShow]           = useState(false);
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);

  const strength = password.length >= 8
    && /[A-Z]/.test(password)
    && /[0-9]/.test(password)
    && /[^A-Za-z0-9]/.test(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (password !== confirm) { toast.error('Passwords do not match'); return; }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message.includes('session')
        ? 'Reset link expired. Please request a new one.'
        : 'Could not update password. Try again.');
      return;
    }

    setDone(true);
    setTimeout(() => router.push('/dashboard'), 2000);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center animate-fade-up">
          <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-foreground mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            Password updated
          </h1>
          <p className="text-sm text-muted-foreground">Taking you to your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="mb-8 text-center">
          <Logo wordmarkSize="md" className="justify-center mb-6" />
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            Set new password
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Choose a strong password for your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">New password</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••"
                autoComplete="new-password"
                className="w-full px-3.5 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all pr-11"
              />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength indicator */}
            {password.length > 0 && (
              <div className="mt-2 flex gap-1">
                {[...Array(4)].map((_, i) => {
                  const levels = [
                    password.length >= 6,
                    password.length >= 8,
                    /[A-Z]/.test(password) && /[0-9]/.test(password),
                    /[^A-Za-z0-9]/.test(password),
                  ];
                  const active = levels.slice(0, i + 1).every(Boolean);
                  return (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                      active
                        ? i < 2 ? 'bg-amber-400' : i < 3 ? 'bg-teal-400' : 'bg-emerald-400'
                        : 'bg-border'
                    }`} />
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Confirm password</label>
            <input
              type={show ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••••"
              autoComplete="new-password"
              className={`w-full px-3.5 py-3 rounded-xl bg-muted border text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                confirm && confirm !== password ? 'border-red-500/50 focus:ring-red-500/20' : 'border-border focus:border-primary'
              }`}
            />
            {confirm && confirm !== password && (
              <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !password || !confirm}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
