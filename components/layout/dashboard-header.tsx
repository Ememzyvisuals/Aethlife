'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Sun, Moon, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Logo } from '@/components/shared/logo';
import { BRAND } from '@/lib/brand';
import type { Profile } from '@/types';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':     'Dashboard',
  '/fitness':       'Fitness',
  '/expenses':      'Expenses',
  '/budget':        'Budget',
  '/habits':        'Habits',
  '/insights':      'AI Insights',
  '/notifications': 'Notifications',
  '/settings':      'Settings',
  '/billing':       'Billing',
  '/feedback':      'Feedback',
};

export function DashboardHeader({ profile }: { profile: Profile | null }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { theme, setTheme } = useTheme();
  const supabase  = createClient();
  const [menuOpen, setMenuOpen] = useState(false);

  const title = Object.entries(PAGE_TITLES).find(
    ([path]) => pathname === path || (path !== '/dashboard' && pathname.startsWith(path))
  )?.[1] ?? BRAND.name;

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  async function handleSignOut() {
    setMenuOpen(false);
    await supabase.auth.signOut();
    // Hard redirect — router.push can race with session clearing
    // window.location.href forces a full page reload so middleware
    // sees the cleared session and routes correctly
    window.location.href = '/auth/login';
  }

  return (
    <header className="h-14 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 sm:px-5">
      {/* Left: logo (mobile) + title */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="lg:hidden flex-shrink-0" aria-label={BRAND.name}>
          <Logo wordmarkSize="sm" />
        </Link>
        <h1
          className="font-semibold text-foreground text-[15px] tracking-tight"
          style={{ fontFamily: "'Clash Display', sans-serif" }}
        >
          {title}
        </h1>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
        </Link>

        {/* Profile menu */}
        <div className="relative ml-1">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 h-9 pl-1 pr-2 rounded-xl hover:bg-muted/60 transition-all"
            aria-label="Profile menu"
          >
            <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
              <span className="text-[11px] font-semibold text-primary" style={{ fontFamily: "'Sora', sans-serif" }}>
                {initials}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-11 z-20 w-44 glass rounded-2xl border border-border/60 shadow-xl shadow-black/20 py-1.5 overflow-hidden animate-fade-up">
                {profile?.full_name && (
                  <div className="px-3 py-2 border-b border-border/50 mb-1">
                    <p className="text-xs font-medium text-foreground truncate">{profile.full_name}</p>
                    <p className="text-[11px] text-muted-foreground capitalize">{profile.subscription_tier} plan</p>
                  </div>
                )}
                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/8 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
