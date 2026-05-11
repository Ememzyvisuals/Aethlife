'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const passwordSchema = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'One uppercase letter required')
  .regex(/[a-z]/, 'One lowercase letter required')
  .regex(/[0-9]/, 'One number required')
  .regex(/[^A-Za-z0-9]/, 'One special character required');

const signupSchema = z.object({
  full_name: z.string().min(2, 'At least 2 characters').max(80).trim(),
  email: z.string().email('Valid email required').toLowerCase().trim(),
  password: passwordSchema,
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

type SignupFormData = z.infer<typeof signupSchema>;

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Lowercase', pass: /[a-z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
    { label: 'Special character', pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ['', 'bg-rose-500', 'bg-amber-500', 'bg-yellow-400', 'bg-teal-400', 'bg-teal-500'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'];
  if (!password) return null;
  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map((i) => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= score ? colors[score] : 'bg-muted'}`} />
        ))}
        <span className="text-xs text-muted-foreground ml-2 w-20 text-right">{labels[score]}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        {checks.map((c) => (
          <div key={c.label} className={`flex items-center gap-1.5 text-xs ${c.pass ? 'text-teal-500' : 'text-muted-foreground/50'}`}>
            <div className={`w-1 h-1 rounded-full ${c.pass ? 'bg-teal-500' : 'bg-muted-foreground/30'}`} />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const supabase = createClient();

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const password = watch('password', '');

  async function onSubmit(data: SignupFormData) {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('already registered') || msg.includes('already exists')) {
        toast.error('Account already exists.', {
          description: 'Try signing in instead.',
          action: { label: 'Sign in', onClick: () => router.push('/auth/login') },
        });
      } else {
        toast.error('Could not create account.', { description: error.message });
      }
      return;
    }
    toast.success('Welcome to AethLife!');
    router.push('/onboarding');
    router.refresh();
  }

  async function signInWithGoogle() {
    setIsGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) { toast.error('Google sign-in failed.'); setIsGoogleLoading(false); }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-sans text-2xl font-semibold text-foreground tracking-tight mb-1.5">Create your account</h1>
        <p className="text-sm text-muted-foreground">Free forever. No credit card required.</p>
      </div>

      <button type="button" onClick={signInWithGoogle} disabled={isGoogleLoading} className="w-full flex items-center justify-center gap-3 border border-border rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-all disabled:opacity-60 disabled:cursor-not-allowed mb-6"
        className="w-full flex items-center justify-center gap-3 border border-border rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-all disabled:opacity-60 mb-6">
        {isGoogleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        Continue with Google
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">or with email</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-foreground mb-1.5">Full name</label>
          <input id="full_name" type="text" autoComplete="name" placeholder="Your name" {...register('full_name')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all" />
          {errors.full_name && <p className="text-xs text-destructive mt-1.5">{errors.full_name.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">Email</label>
          <input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register('email')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all" />
          {errors.email && <p className="text-xs text-destructive mt-1.5">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">Password</label>
          <div className="relative">
            <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Create a strong password" {...register('password')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all pr-10" />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <PasswordStrength password={password} />
          {errors.password && <p className="text-xs text-destructive mt-1.5">{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="confirm_password" className="block text-sm font-medium text-foreground mb-1.5">Confirm password</label>
          <input id="confirm_password" type="password" autoComplete="new-password" placeholder="Repeat your password" {...register('confirm_password')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all" />
          {errors.confirm_password && <p className="text-xs text-destructive mt-1.5">{errors.confirm_password.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-60 text-sm mt-2">
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (<>Create account <ArrowRight className="w-4 h-4" /></>)}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          By signing up you agree to our{' '}
          <Link href="/legal/terms" className="text-teal-500 hover:underline">Terms</Link> and{' '}
          <Link href="/legal/privacy" className="text-teal-500 hover:underline">Privacy Policy</Link>.
        </p>
      </form>

      <p className="text-sm text-muted-foreground text-center mt-6">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-teal-500 hover:text-teal-600 font-medium">Sign in</Link>
      </p>
    </div>
  );
}
