import Link from 'next/link';
import { Logo } from '@/components/shared/logo';
import { ArrowRight, Brain, Dumbbell, Wallet, CheckSquare, Zap, Shield, BarChart3 } from 'lucide-react';
import { BRAND } from '@/lib/brand';

export const metadata = {
  title: 'AethLife — Free AI Fitness, Expense & Habit Tracker',
  description: 'AethLife connects your workouts, spending, and habits using AI to reveal hidden patterns. Free forever. Track fitness, scan receipts with AI, build habits, get insights — all in one app.',
  keywords: [
    'free fitness tracker', 'AI habit tracker', 'expense tracker Nigeria',
    'receipt scanner AI', 'workout tracker app', 'naira budget app',
    'personal finance Nigeria', 'habit builder app', 'AI life tracker',
  ],
  alternates: { canonical: 'https://aethlife.vercel.app' },
  openGraph: {
    type: 'website',
    url: 'https://aethlife.vercel.app',
    title: 'AethLife — Free AI Fitness, Expense & Habit Tracker',
    description: 'Connect your workouts, spending, and habits. Get AI insights showing how every part of your life affects the others.',
    siteName: 'AethLife',
    images: [{ url: '/images/og-image.png', width: 1200, height: 630, alt: 'AethLife App Preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AethLife — Free AI Fitness, Expense & Habit Tracker',
    description: 'Free app to track fitness, expenses, and habits with AI insights.',
    creator: '@ememzyvisuals',
  },
};

// ── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, color, bg }: {
  icon: React.ElementType; title: string; desc: string; color: string; bg: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 hover:border-primary/20 transition-all duration-200">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <h3 className="font-semibold text-foreground mb-1.5" style={{ fontFamily: "'Clash Display', sans-serif" }}>
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

// ── Step card ─────────────────────────────────────────────────────────────────
function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-full gradient-teal flex items-center justify-center flex-shrink-0 text-sm font-bold text-white mt-0.5">
        {n}
      </div>
      <div>
        <h3 className="font-semibold text-foreground mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}



export default function LandingPage() {
  return (
    <div
      className="min-h-screen bg-background"
      style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
    >


      {/* Rich Results structured data for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "AethLife",
          "description": "AI-powered fitness, expense, and habit tracker that connects all areas of your life.",
          "url": "https://aethlife.vercel.app",
          "applicationCategory": "HealthApplication",
          "operatingSystem": "Any",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "description": "Free forever. Premium from $4.99/month."
          },
          "author": {
            "@type": "Organization",
            "name": "EMEMZYVISUALS DIGITALS",
            "url": "https://aethlife.vercel.app"
          },
          "featureList": [
            "AI Receipt Scanning",
            "Fitness Tracking",
            "Expense Tracking",
            "Habit Building",
            "AI Behavioral Insights",
            "Push Notifications",
            "Naira Currency Support"
          ]
        })}}
      />
      {/* ── Nav ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" aria-label="AethLife home">
            <Logo wordmarkSize="sm" />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
              Sign in
            </Link>
            <Link href="/auth/signup" className="btn-primary text-sm py-2 px-4">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="pt-20 pb-16 text-center">
          {/* Headline */}
          <h1
            className="text-[2.8rem] sm:text-[3.5rem] font-bold text-foreground leading-[1.1] tracking-tight mb-6 max-w-3xl mx-auto"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            Every part of your life,{' '}
            <span style={{ color: '#14b8a6' }}>connected.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10">
            AethLife links your workouts, spending, habits, and energy — then uses AI to show you how they affect each other.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth/signup" className="btn-primary flex items-center gap-2 px-6 py-3.5 text-base w-full sm:w-auto justify-center">
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/auth/login" className="btn-ghost flex items-center gap-2 px-6 py-3.5 text-base w-full sm:w-auto justify-center">
              Sign in
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Free forever · Premium from ₦5,000/month</p>
        </section>

        {/* ── Feature pills ────────────────────────────────────────── */}
        <section className="flex flex-wrap items-center justify-center gap-2 pb-16 border-b border-border">
          {[
            'Fitness tracking',
            'Expense tracking',
            'Habit builder',
            'AI insights',
            'Receipt scanning',
            'NGN support',
          ].map(f => (
            <span
              key={f}
              className="text-xs font-medium px-3 py-1.5 rounded-full border border-border text-muted-foreground bg-muted/40"
            >
              {f}
            </span>
          ))}
        </section>

        {/* ── Features ─────────────────────────────────────────────── */}
        <section className="py-16">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">What's inside</p>
            <h2
              className="text-3xl font-bold text-foreground"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              Everything in one place
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureCard
              icon={Dumbbell}
              title="Fitness Tracker"
              desc="Log workouts, track steps and energy. See your progress over time."
              color="text-blue-400"
              bg="bg-blue-500/10"
            />
            <FeatureCard
              icon={Wallet}
              title="Expense Tracker"
              desc="Scan receipts with AI, categorise expenses, track monthly spending."
              color="text-emerald-400"
              bg="bg-emerald-500/10"
            />
            <FeatureCard
              icon={CheckSquare}
              title="Habit Builder"
              desc="Build and track daily habits with streaks and completion tracking."
              color="text-violet-400"
              bg="bg-violet-500/10"
            />
            <FeatureCard
              icon={Brain}
              title="AI Insights"
              desc="Discover how your workouts affect your spending and vice versa."
              color="text-primary"
              bg="bg-primary/10"
            />
          </div>
        </section>

        {/* ── App preview mockup ───────────────────────────────────── */}
        <section className="py-8 pb-16">
          <div className="rounded-3xl border border-border bg-card overflow-hidden">
            {/* Mock nav bar */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/60">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              </div>
              <div className="flex-1 h-5 rounded-md bg-muted/60 max-w-[180px] mx-auto" />
            </div>

            {/* Mock dashboard */}
            <div className="p-5 space-y-4">
              <div className="h-5 w-36 bg-muted rounded-full" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: '3 workouts', color: 'bg-blue-500/20' },
                  { label: '₦14,200', color: 'bg-emerald-500/20' },
                  { label: '5/6 habits', color: 'bg-violet-500/20' },
                  { label: '3 insights', color: 'bg-primary/20' },
                ].map(({ label, color }) => (
                  <div key={label} className={`rounded-xl ${color} border border-white/5 p-4`}>
                    <div className="h-3 w-12 bg-white/20 rounded-full mb-3" />
                    <div className="text-sm font-semibold text-foreground">{label}</div>
                  </div>
                ))}
              </div>
              <div className="h-28 rounded-xl bg-muted/50 border border-border/50 flex items-end px-4 pb-4 gap-2">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-md bg-primary/30" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────── */}
        <section className="py-8 pb-16">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">How it works</p>
              <h2
                className="text-3xl font-bold text-foreground"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                Set up in 3 minutes
              </h2>
            </div>
            <div className="space-y-8">
              <Step n={1} title="Create your account" desc="Sign up free with Google or email. No credit card needed." />
              <Step n={2} title="Log your first entry" desc="Add a workout, an expense, or a habit — whatever feels natural to start with." />
              <Step n={3} title="Let AI find the patterns" desc="After a few days of data, AethLife surfaces insights about how your habits connect." />
            </div>
          </div>
        </section>

        {/* ── Why AethLife ─────────────────────────────────────────── */}
        <section className="py-8 pb-16">
          <div className="rounded-3xl border border-border bg-card p-8">
            <div className="text-center mb-8">
              <h2
                className="text-2xl font-bold text-foreground mb-2"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                Built different
              </h2>
              <p className="text-sm text-muted-foreground">Not just another tracker</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: Zap, title: 'Cross-domain insights', desc: 'Discovers how your sleep, spending, and workouts correlate.', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { icon: Shield, title: 'Private by default', desc: 'Your data is encrypted and private. We never sell it or share it with advertisers.', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { icon: BarChart3, title: 'Nigerian-first', desc: 'NGN currency, Naira formatting, and locally-aware suggestions.', color: 'text-primary', bg: 'bg-primary/10' },
              ].map(({ icon: Icon, title, desc, color, bg }) => (
                <div key={title} className="text-center">
                  <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <section className="py-8 pb-20 text-center">
          <div className="rounded-3xl gradient-teal p-px">
            <div className="rounded-[23px] bg-background p-10">
              <h2
                className="text-3xl font-bold text-foreground mb-3"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                Start tracking today
              </h2>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                Free forever. Upgrade to Premium for AI insights and unlimited tracking.
              </p>
              <Link href="/auth/signup" className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-base">
                Create free account <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-border py-8">
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 {BRAND.name} · {BRAND.company}
          </p>
          <div className="flex items-center gap-5">
            <Link href="/legal/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/legal/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
            <Link href="/auth/signup" className="text-xs text-primary hover:underline">Get started free</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
