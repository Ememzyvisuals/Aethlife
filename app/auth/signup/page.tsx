import type { Metadata } from 'next';
import { SignupForm } from './signup-form';

export const metadata: Metadata = {
  title: 'Create Free Account',
  description: 'Create your free AethLife account. Track fitness, scan receipts, build habits, and get AI-powered insights — all in one app. No credit card required.',
  alternates: { canonical: 'https://aethlife.vercel.app/auth/signup' },
  openGraph: {
    title: 'Create Free AethLife Account',
    description: 'Join AethLife free. Track fitness, expenses, and habits with AI-powered insights. Start in 30 seconds.',
  },
};

export default function SignupPage() {
  return <SignupForm />;
}
