import Link from 'next/link';
import { Logo } from '@/components/shared/logo';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'AethLife Privacy Policy — how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 border-b border-border flex items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded overflow-hidden">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M8 8 L20 32 L32 8" stroke="url(#teal-priv)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <defs><linearGradient id="teal-priv" x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#2dd4bf"/><stop offset="100%" stopColor="#0d9488"/></linearGradient></defs>
            </svg>
          </div>
          <Logo wordmarkSize="sm" />
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="font-sans text-3xl font-semibold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="font-sans text-lg font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">AethLife ("we", "us", "our") is operated by EMEMZYVISUALS DIGITALS. This Privacy Policy explains how we collect, use, store, and protect your personal data when you use AethLife at aethlife.vercel.app. By using AethLife, you agree to the practices described in this policy.</p>
          </section>

          <section>
            <h2 className="font-sans text-lg font-semibold mb-3">2. Data We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">We collect the following categories of data:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2"><span className="text-teal-500 font-medium flex-shrink-0">Account data:</span> Email address, name, and authentication credentials.</li>
              <li className="flex gap-2"><span className="text-teal-500 font-medium flex-shrink-0">Health & fitness data:</span> Workout logs, exercise sets and reps, step counts, energy levels, and mood ratings.</li>
              <li className="flex gap-2"><span className="text-teal-500 font-medium flex-shrink-0">Financial data:</span> Expense amounts, categories, merchants, dates, and budget goals. We never store payment card details.</li>
              <li className="flex gap-2"><span className="text-teal-500 font-medium flex-shrink-0">Receipt images:</span> Photos you upload for AI scanning. These are processed by our AI scanning service and not permanently stored on our servers.</li>
              <li className="flex gap-2"><span className="text-teal-500 font-medium flex-shrink-0">Behavioral data:</span> App usage patterns used to generate AI insights.</li>
              <li className="flex gap-2"><span className="text-teal-500 font-medium flex-shrink-0">Device data:</span> Browser type, operating system, and push notification tokens (FCM).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-sans text-lg font-semibold mb-3">3. How We Use Your Data</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>— Provide and operate the AethLife platform</li>
              <li>— Generate AI insights and behavioral correlations</li>
              <li>— Send relevant push notifications and emails</li>
              <li>— Improve features based on usage patterns</li>
              <li>— Process payments (handled by our secure crypto payment partner)</li>
              <li>— Respond to feedback and support requests</li>
            </ul>
          </section>

          <section>
            <h2 className="font-sans text-lg font-semibold mb-3">4. AI Systems</h2>
            <p className="text-muted-foreground leading-relaxed">AethLife uses AI language models and vision AI to process receipts and generate personalized insights. Your data is sent to our AI processing service solely to provide these features. We do not use your data to train third-party AI models without explicit consent.</p>
          </section>

          <section>
            <h2 className="font-sans text-lg font-semibold mb-3">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">All data is stored in Supabase (PostgreSQL) with enterprise-grade encryption at rest and in transit. Row-Level Security (RLS) ensures only you can access your data. Authentication is handled via Supabase Auth with industry-standard JWT tokens.</p>
          </section>

          <section>
            <h2 className="font-sans text-lg font-semibold mb-3">6. Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">We do not sell your personal data. We share data only with the following service providers who process it on our behalf: Supabase (database), AI processing services, Firebase (push notifications), Resend (email), Vercel (hosting), NOWPayments (crypto payment processing).</p>
          </section>

          <section>
            <h2 className="font-sans text-lg font-semibold mb-3">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">You have the right to:</p>
            <ul className="space-y-1.5 text-muted-foreground">
              <li>— Access all data we hold about you</li>
              <li>— Request correction of inaccurate data</li>
              <li>— Delete your account and all associated data</li>
              <li>— Export your data in a portable format</li>
              <li>— Opt out of marketing communications</li>
            </ul>
            <p className="text-muted-foreground mt-3">To exercise these rights, email <a href="mailto:info@aethlife.vercel.app" className="text-teal-500">info@aethlife.vercel.app</a>.</p>
          </section>

          <section>
            <h2 className="font-sans text-lg font-semibold mb-3">8. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">AethLife uses essential cookies for authentication session management. We do not use advertising or tracking cookies. See our <Link href="/legal/cookies" className="text-teal-500 hover:underline">Cookie Policy</Link> for details.</p>
          </section>

          <section>
            <h2 className="font-sans text-lg font-semibold mb-3">9. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">AethLife is not directed at children under 13. We do not knowingly collect data from children. If you believe we have inadvertently collected such data, contact us immediately.</p>
          </section>

          <section>
            <h2 className="font-sans text-lg font-semibold mb-3">10. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">For privacy-related inquiries, contact EMEMZYVISUALS DIGITALS at <a href="mailto:info@aethlife.vercel.app" className="text-teal-500">info@aethlife.vercel.app</a>.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-4">
          <Link href="/legal/terms" className="text-sm text-teal-500 hover:underline">Terms of Service</Link>
          <Link href="/legal/cookies" className="text-sm text-teal-500 hover:underline">Cookie Policy</Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
        </div>
      </main>
    </div>
  );
}
