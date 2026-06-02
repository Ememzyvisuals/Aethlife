import Link from 'next/link';
import { Logo } from '@/components/shared/logo';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'AethLife Terms of Service — the rules governing your use of our platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 border-b border-border flex items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded overflow-hidden">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M8 8 L20 32 L32 8" stroke="url(#teal-terms)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <defs><linearGradient id="teal-terms" x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#2dd4bf"/><stop offset="100%" stopColor="#0d9488"/></linearGradient></defs>
            </svg>
          </div>
          <Logo wordmarkSize="sm" />
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="font-sans text-3xl font-semibold text-foreground mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="space-y-8 text-foreground">
          {[
            {
              title: '1. Acceptance of Terms',
              body: 'By accessing or using AethLife ("the Service") at aethlife.vercel.app, operated by EMEMZYVISUALS DIGITALS, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Service.',
            },
            {
              title: '2. Description of Service',
              body: 'AethLife is an AI-powered personal life operating system that connects fitness tracking, expense management, habit building, energy logging, and behavioral analysis. The Service is provided on a free and premium subscription basis.',
            },
            {
              title: '3. User Accounts',
              body: 'You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information when creating your account. You are responsible for all activities that occur under your account. You must notify us immediately of any unauthorized access.',
            },
            {
              title: '4. Free and Premium Tiers',
              body: 'The free tier provides limited access to AI features (3 insights per week, 5 receipt scans per month). Premium plans (Monthly at ₦5,000, Yearly at ₦50,000, or Lifetime at ₦45,000) unlock unlimited AI access, advanced analytics, and behavioral correlations. Prices are primarily in Nigerian Naira (NGN) with other currencies shown as approximations.',
            },
            {
              title: '5. Payments and Subscriptions',
              body: 'Premium subscriptions are processed via NOWPayments (crypto payments). Monthly and yearly subscriptions auto-renew unless cancelled. Lifetime subscriptions are one-time payments with permanent access. All payments are non-refundable except where required by law.',
            },
            {
              title: '6. AI Features and Receipt Scanning',
              body: 'AethLife uses AI for receipt scanning and insight generation. AI outputs are generated automatically and may contain errors. You must review all scanned receipt data before confirming. AethLife provides AI insights for informational purposes only — they do not constitute financial, medical, or professional advice.',
            },
            {
              title: '7. User Content',
              body: 'You retain ownership of all data you input into AethLife. By using the Service, you grant AethLife a limited license to process your data solely for providing the Service. We do not claim ownership of your personal data.',
            },
            {
              title: '8. Prohibited Use',
              body: 'You may not use AethLife to upload illegal content, attempt to breach platform security, reverse engineer the application, scrape or extract data at scale, impersonate other users, or use the Service for any unlawful purpose.',
            },
            {
              title: '9. Limitation of Liability',
              body: 'AethLife and EMEMZYVISUALS DIGITALS shall not be liable for indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid in the last 12 months. The Service is provided "as is" without warranties of any kind.',
            },
            {
              title: '10. Termination',
              body: 'We reserve the right to terminate or suspend accounts for violation of these terms. You may delete your account at any time from the Settings page. Upon termination, your data will be deleted according to our Privacy Policy.',
            },
            {
              title: '11. Changes to Terms',
              body: 'We may update these terms at any time. We will notify users of significant changes via email or in-app notification. Continued use of the Service after changes constitutes acceptance of the new terms.',
            },
            {
              title: '12. Contact',
              body: 'For questions about these Terms, contact EMEMZYVISUALS DIGITALS at info@aethlife.vercel.app.',
            },
          ].map(({ title, body }) => (
            <section key={title}>
              <h2 className="font-sans text-lg font-semibold mb-3">{title}</h2>
              <p className="text-muted-foreground leading-relaxed">{body}</p>
            </section>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-4">
          <Link href="/legal/privacy" className="text-sm text-teal-500 hover:underline">Privacy Policy</Link>
          <Link href="/legal/cookies" className="text-sm text-teal-500 hover:underline">Cookie Policy</Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
        </div>
      </main>
    </div>
  );
}
