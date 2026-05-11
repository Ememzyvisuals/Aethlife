'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console in development
    console.error('[AethLife] Runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>

        <h2 className="font-sans text-xl font-semibold text-foreground mb-2">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-6">
          An unexpected error occurred. Your data is safe — this is a display issue.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center bg-teal-500 hover:bg-teal-600 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center border border-border hover:bg-muted text-foreground font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            Go to dashboard
          </Link>
          <Link
            href="/feedback?type=bug_report"
            className="text-xs text-muted-foreground hover:text-teal-500 transition-colors"
          >
            Report this problem
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="text-xs text-muted-foreground cursor-pointer">Error details (dev only)</summary>
            <pre className="mt-2 text-xs text-rose-400 bg-rose-500/10 rounded-lg p-3 overflow-auto max-h-40">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
