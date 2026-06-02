import type { Metadata } from 'next';
import LoginForm from './login-form';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to AethLife — your AI fitness, expense, and habit tracker.',
  alternates: { canonical: 'https://aethlife.vercel.app/auth/login' },
};

export default function LoginPage() {
  return <LoginForm />;
}
