'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Dumbbell, Wallet, PiggyBank,
  CheckSquare, Brain, Settings, CreditCard,
  Bell, MessageSquare, ChevronRight, Crown,
} from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { BRAND } from '@/lib/brand';
import type { Profile } from '@/types';

const navItems = [
  { href: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/fitness',        icon: Dumbbell,        label: 'Fitness' },
  { href: '/expenses',       icon: Wallet,          label: 'Expenses' },
  { href: '/budget',         icon: PiggyBank,       label: 'Budget' },
  { href: '/habits',         icon: CheckSquare,     label: 'Habits' },
  { href: '/insights',       icon: Brain,           label: 'AI Insights' },
  { href: '/notifications',  icon: Bell,            label: 'Notifications' },
];

const bottomItems = [
  { href: '/settings', icon: Settings,      label: 'Settings' },
  { href: '/billing',  icon: CreditCard,    label: 'Billing' },
  { href: '/feedback', icon: MessageSquare, label: 'Feedback' },
];

interface DashboardSidebarProps {
  profile: Profile | null;
}

export function DashboardSidebar({ profile }: DashboardSidebarProps) {
  const pathname = usePathname();
  const isPremium = profile?.subscription_tier === 'premium';

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-30">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-border">
        <Link href="/dashboard" aria-label={`${BRAND.name} dashboard`}>
          <Logo wordmarkSize="md" />
        </Link>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-teal-500' : ''}`} />
              {item.label}
              {isActive && <ChevronRight className="w-3 h-3 ml-auto text-teal-500/60" />}
            </Link>
          );
        })}
      </nav>

      {/* Premium upsell */}
      {!isPremium && (
        <div className="px-3 py-3">
          <Link
            href="/billing"
            className="flex items-center gap-2.5 bg-gradient-to-r from-teal-500/15 to-teal-600/10 border border-teal-500/20 rounded-xl p-3.5 hover:border-teal-500/40 transition-all"
          >
            <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Crown className="w-4 h-4 text-teal-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">Upgrade to Premium</p>
              <p className="text-xs text-muted-foreground">From ₦5,000/month</p>
            </div>
          </Link>
        </div>
      )}

      {/* Bottom nav */}
      <div className="px-3 py-3 border-t border-border space-y-0.5">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0" aria-hidden="true">
            <span className="text-sm font-semibold text-teal-600">
              {profile?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">{profile?.full_name ?? 'User'}</p>
            <p className="text-xs text-muted-foreground capitalize">{profile?.subscription_tier ?? 'free'} plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
