import type { Metadata } from 'next';
import { ResetForm } from './reset-form';

export const metadata: Metadata = {
  title: 'Set New Password',
  description: 'Set a new password for your AethLife account.',
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return <ResetForm />;
}
