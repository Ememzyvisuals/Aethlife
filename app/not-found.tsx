import Link from 'next/link';
import { Logo } from '@/components/shared/logo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="mb-6">
          <Logo wordmarkSize="lg" className="justify-center" />
        </div>

        <h1 className="font-sans text-6xl font-bold text-foreground mb-3">404</h1>
        <p className="text-lg font-semibold text-foreground mb-2">Page not found</p>
        <p className="text-sm text-muted-foreground mb-8">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center bg-teal-500 hover:bg-teal-600 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            Go to dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center border border-border hover:bg-muted text-foreground font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
