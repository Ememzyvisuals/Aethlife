import type { Metadata } from 'next';
import Link from 'next/link';
import { Logo } from '@/components/shared/logo';
import { BRAND } from '@/lib/brand';

// Auth pages ARE indexable — signup/login are key conversion pages
export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),
  robots: { index: true, follow: true },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/" aria-label={`${BRAND.name} home`}>
          <Logo wordmarkSize="md" />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </main>
      <footer className="h-14 flex items-center justify-center px-6 border-t border-border">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {BRAND.name} · {BRAND.company}
        </p>
      </footer>
    </div>
  );
}
