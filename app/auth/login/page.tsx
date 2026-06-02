import type { Metadata } from 'next';

// Default import — works regardless of what the function is named inside
// login-form.tsx (LoginForm OR LoginFormPage both work)
import LoginFormComponent from './login-form';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to AethLife — your AI fitness, expense, and habit tracker.',
  alternates: { canonical: 'https://aethlife.vercel.app/auth/login' },
};

export default function LoginPage() {
  return <LoginFormComponent />;
}
