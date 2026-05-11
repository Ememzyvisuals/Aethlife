import type { Metadata } from 'next';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to AethLife — your AI fitness, expense, and habit tracker. Access your dashboard, AI insights, and personalized reports.',
  alternates: { canonical: 'https://aethlife.vercel.app/auth/login' },
  openGraph: {
    title: 'Sign In to AethLife',
    description: 'Sign in to track your fitness, expenses, and habits with AI-powered insights.',
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
