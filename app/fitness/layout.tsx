import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { MobileNav } from '@/components/layout/mobile-nav';

// Shared dashboard layout — all authenticated app routes use this
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (profile && !profile.onboarding_completed) {
    redirect('/onboarding');
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar profile={profile} />
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <DashboardHeader profile={profile} />
        <main className="flex-1 p-4 sm:p-6 pb-24 lg:pb-6 max-w-[1200px] w-full mx-auto">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
