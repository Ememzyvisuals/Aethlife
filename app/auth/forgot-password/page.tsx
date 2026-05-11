import type { Metadata } from 'next';
import { ForgotForm } from './forgot-form';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your AethLife password. Enter your email and we will send you a secure reset link.',
  robots: { index: false, follow: false }, // no need to index this page
};

export default function ForgotPasswordPage() {
  return <ForgotForm />;
}
