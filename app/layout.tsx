import type { Metadata, Viewport } from 'next';
import { Sora } from 'next/font/google';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { Toaster } from 'sonner';
import { BRAND } from '@/lib/brand';
import '@/styles/globals.css';
import { PwaRegister } from '@/components/shared/pwa-register';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),

  // ── Titles ──────────────────────────────────────────────────────────────────
  title: {
    default:  `${BRAND.name} — AI Fitness, Expense & Habit Tracker`,
    template: `%s | ${BRAND.name}`,
  },

  // ── Description (appears in Google search results) ───────────────────────
  description:
    'AethLife is a free AI-powered app that connects your workouts, spending, and habits to reveal hidden patterns. Track fitness, scan receipts, build habits, and get AI insights — all in one place.',

  // ── Keywords ───────────────────────────────────────────────────────────────
  keywords: [
    'AI life tracker',
    'fitness tracker app',
    'expense tracker Nigeria',
    'habit tracker app',
    'AI budget app Nigeria',
    'receipt scanner app',
    'workout tracker free',
    'personal finance app Nigeria',
    'AI insights app',
    'naira expense tracker',
    'free habit tracker',
    'life operating system',
    'AethLife',
    ...BRAND.keywords,
  ],

  // ── Authorship ─────────────────────────────────────────────────────────────
  authors:   [{ name: BRAND.company, url: BRAND.url }],
  creator:   BRAND.company,
  publisher: BRAND.company,
  category:  'Health & Fitness',

  // ── Canonical & indexing ───────────────────────────────────────────────────
  alternates: { canonical: BRAND.url },
  robots: {
    index:            true,
    follow:           true,
    googleBot: {
      index:               true,
      follow:              true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },

  // ── Google Search Console verification ────────────────────────────────────
  // TODO: replace with your actual code from Search Console → HTML tag method
  verification: {
    google: 'PASTE_YOUR_GOOGLE_VERIFICATION_CODE_HERE',
  },

  // ── Open Graph (WhatsApp, Facebook, LinkedIn previews) ─────────────────────
  openGraph: {
    type:        'website',
    locale:      'en_US',
    url:         BRAND.url,
    siteName:    BRAND.name,
    title:       `${BRAND.name} — AI Fitness, Expense & Habit Tracker`,
    description: 'Connect your workouts, spending, and habits. AethLife uses AI to reveal how every part of your life affects the others.',
    images: [{
      url:    '/images/og-image.png',
      width:  1200,
      height: 630,
      alt:    `${BRAND.name} — AI Life Tracker`,
    }],
  },

  // ── Twitter / X card ──────────────────────────────────────────────────────
  twitter: {
    card:        'summary_large_image',
    title:       `${BRAND.name} — AI Fitness, Expense & Habit Tracker`,
    description: 'Track fitness, expenses, and habits. Get AI insights connecting every part of your life.',
    creator:     BRAND.socials.twitterHandle,
    images:      [{ url: '/images/og-image.png', width: 1200, height: 630 }],
  },

  // ── Icons ─────────────────────────────────────────────────────────────────
  icons: {
    // Next.js auto-generates favicons from app/icon.tsx and app/apple-icon.tsx
    // SVG fallback for browsers that don't support the auto-generated ones
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon.svg', type: 'image/svg+xml', sizes: 'any' },
    ],
    apple:    [{ url: '/icons/icon.svg', type: 'image/svg+xml' }],
    shortcut: '/favicon.svg',
  },

  // ── PWA ────────────────────────────────────────────────────────────────────
  manifest:    '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: BRAND.name },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1315' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Clash Display from Fontshare — premium heading font */}
        {/* Capture PWA install event BEFORE React mounts — critical for install prompt */}
        <script
          dangerouslySetInnerHTML={{ __html: `
            window.__pwaInstallEvent = null;
            window.addEventListener('beforeinstallprompt', function(e) {
              e.preventDefault();
              window.__pwaInstallEvent = e;
              window.dispatchEvent(new Event('pwa-install-ready'));
            });
          `}}
        />

        {/* Clash Display — preconnect + preload for fastest render */}
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.fontshare.com" />
        <link
          rel="preload"
          href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700&display=swap"
          as="style"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: BRAND.name,
              description: BRAND.description,
              applicationCategory: 'HealthApplication',
              operatingSystem: 'Any',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'NGN' },
              author: {
                '@type': 'Organization',
                name: BRAND.company,
                email: BRAND.supportEmail,
                url: BRAND.url,
              },
              url: BRAND.url,
            }),
          }}
        />
      </head>
      <body className={`${sora.variable} antialiased`} style={{ fontFamily: "'Sora', system-ui, sans-serif" }}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <PwaRegister />
          {children}
          <Toaster
            position="bottom-center"
            richColors
            expand={false}
            toastOptions={{
              duration: 3500,
              classNames: {
                toast:       'font-[Sora] !rounded-2xl !border-border !bg-card !shadow-xl !shadow-black/20',
                description: '!text-muted-foreground',
                actionButton: '!bg-primary !text-white',
                cancelButton: '!bg-muted !text-muted-foreground',
                error:   '!border-red-500/20 !bg-red-950/60',
                success: '!border-emerald-500/20 !bg-emerald-950/60',
                warning: '!border-amber-500/20 !bg-amber-950/60',
                info:    '!border-blue-500/20 !bg-blue-950/60',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
