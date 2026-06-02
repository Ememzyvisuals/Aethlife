import type { Metadata } from 'next';
import { LoginPage } from './login-form';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to AethLife.',
};

export default function Page() {
  return <LoginPage />;
}
