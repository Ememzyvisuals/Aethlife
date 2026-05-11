import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'AethLife Cookie Policy — how we use cookies and similar technologies.',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 border-b border-border flex items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded overflow-hidden">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M8 8 L20 32 L32 8" stroke="url(#teal-cook)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <defs><linearGradient id="teal-cook" x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#2dd4bf"/><stop offset="100%" stopColor="#0d9488"/></linearGradient></defs>
            </svg>
          </div>
          <span className="font-sans font-semibold text-foreground">AethLife</span>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="font-sans text-3xl font-semibold text-foreground mb-2">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="space-y-8">
          <section>
            <h2 className="font-sans text-lg font-semibold text-foreground mb-3">What Are Cookies?</h2>
            <p className="text-muted-foreground leading-relaxed">Cookies are small text files stored on your device when you visit a website. They allow the site to remember your preferences and maintain your login session.</p>
          </section>

          <section>
            <h2 className="font-sans text-lg font-semibold text-foreground mb-3">How AethLife Uses Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">AethLife uses a minimal set of cookies, strictly limited to what is necessary for the platform to function.</p>

            <div className="space-y-4">
              {[
                {
                  name: 'Authentication Cookies',
                  type: 'Essential',
                  purpose: 'Maintain your login session via Supabase Auth. Without these, you would need to log in on every page visit.',
                  duration: 'Session / 7 days',
                  canOptOut: false,
                },
                {
                  name: 'Theme Preference',
                  type: 'Functional',
                  purpose: 'Remember whether you prefer light or dark mode.',
                  duration: '1 year',
                  canOptOut: true,
                },
                {
                  name: 'CSRF Protection',
                  type: 'Security',
                  purpose: 'Protect against cross-site request forgery attacks.',
                  duration: 'Session',
                  canOptOut: false,
                },
              ].map((cookie) => (
                <div key={cookie.name} className="aethlife-card">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-semibold text-foreground">{cookie.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      cookie.type === 'Essential' ? 'bg-teal-500/10 text-teal-500' :
                      cookie.type === 'Security' ? 'bg-rose-500/10 text-rose-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {cookie.type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{cookie.purpose}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Duration: {cookie.duration}</span>
                    <span className={cookie.canOptOut ? 'text-amber-500' : 'text-teal-500'}>
                      {cookie.canOptOut ? 'Optional' : 'Required'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-sans text-lg font-semibold text-foreground mb-3">What We Don't Use</h2>
            <p className="text-muted-foreground leading-relaxed">AethLife does not use advertising cookies, tracking pixels, third-party analytics cookies (e.g., Google Analytics), social media tracking cookies, or any cookies that monitor your behavior across other websites.</p>
          </section>

          <section>
            <h2 className="font-sans text-lg font-semibold text-foreground mb-3">Local Storage</h2>
            <p className="text-muted-foreground leading-relaxed">In addition to cookies, AethLife uses your browser's IndexedDB for offline data storage when you're without internet. This data stays on your device and is only used to sync with your account when you reconnect.</p>
          </section>

          <section>
            <h2 className="font-sans text-lg font-semibold text-foreground mb-3">Managing Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">You can control cookies through your browser settings. Note that blocking essential cookies will prevent AethLife from functioning correctly — you won't be able to maintain a logged-in session. For guidance on managing cookies, visit your browser's help documentation.</p>
          </section>

          <section>
            <h2 className="font-sans text-lg font-semibold text-foreground mb-3">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">Questions? Email <a href="mailto:info@aethlife.vercel.app" className="text-teal-500 hover:underline">info@aethlife.vercel.app</a>.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-4">
          <Link href="/legal/privacy" className="text-sm text-teal-500 hover:underline">Privacy Policy</Link>
          <Link href="/legal/terms" className="text-sm text-teal-500 hover:underline">Terms of Service</Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
        </div>
      </main>
    </div>
  );
}
