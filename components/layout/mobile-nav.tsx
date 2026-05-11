'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Dumbbell, Wallet, CheckSquare, Brain } from 'lucide-react';

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/fitness',   icon: Dumbbell,        label: 'Fitness' },
  { href: '/expenses',  icon: Wallet,           label: 'Expenses' },
  { href: '/habits',    icon: CheckSquare,      label: 'Habits' },
  { href: '/insights',  icon: Brain,            label: 'Insights' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40"
      style={{ width: 'min(360px, calc(100vw - 32px))' }}
    >
      <div className="glass rounded-2xl border border-border/60 px-2 py-2.5 flex items-center justify-around shadow-xl shadow-black/20">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {active && (
                <span className="absolute inset-0 rounded-xl bg-primary/10" />
              )}
              <Icon className="w-5 h-5 relative" strokeWidth={active ? 2.2 : 1.8} />
              <span
                className={`text-[10px] font-medium relative leading-none ${
                  active ? 'text-primary' : ''
                }`}
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
