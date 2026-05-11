import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email/templates';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type'); // 'recovery' for password reset

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
  }

  // Password reset flow — redirect to the reset page
  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/auth/reset-password`);
  }

  const user = data.user;

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed, full_name')
    .eq('user_id', user.id)
    .single();

  // Welcome email for new users
  if (!profile?.onboarding_completed && user.email) {
    const name = profile?.full_name ?? user.user_metadata?.full_name ?? 'there';
    sendWelcomeEmail(user.email, name).catch(() => {});
  }

  const destination = profile?.onboarding_completed ? '/dashboard' : '/onboarding';
  return NextResponse.redirect(`${origin}${destination}`);
}
