'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, CheckCircle2, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

export function ForgotForm() {
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    if (error) {
      toast.error('Could not send reset email. Please try again.');
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="animate-fade-in text-center">
        <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Mail className="w-7 h-7 text-teal-500" />
        </div>
        <h1 className="font-sans text-2xl font-semibold text-foreground mb-2">Check your inbox</h1>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
          If an account exists with that email, we've sent a password reset link. Check your spam folder if it doesn't arrive.
        </p>
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-teal-500 hover:text-teal-600 font-medium transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-sans text-2xl font-semibold text-foreground tracking-tight mb-1.5">Reset password</h1>
        <p className="text-sm text-muted-foreground">Enter your email and we'll send a reset link.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register('email')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
            autoFocus
          />
          {errors.email && <p className="text-xs text-destructive mt-1.5">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-60 text-sm"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send reset link</>}
        </button>
      </form>

      <Link
        href="/auth/login"
        className="flex items-center justify-center gap-2 mt-5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to sign in
      </Link>
    </div>
  );
}
