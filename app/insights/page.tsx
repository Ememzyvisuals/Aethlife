import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { InsightsContent } from '@/components/insights/insights-content';

export const metadata = { title: 'AI Insights' };

export default async function InsightsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const [{ data: profile }, { data: insights }, { count: workoutCount }] = await Promise.all([
    supabase.from('profiles').select('subscription_tier, subscription_status').eq('user_id', user.id).single(),
    supabase.from('ai_insights').select('*').eq('user_id', user.id).eq('is_dismissed', false).order('generated_at', { ascending: false }).limit(20),
    supabase.from('workouts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ]);

  const isPremium = profile?.subscription_tier === 'premium' && profile?.subscription_status === 'active';

  let weeklyUsed = 0;
  if (!isPremium) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('ai_insights')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('generated_at', weekAgo);
    weeklyUsed = count ?? 0;
  }

  return (
    <InsightsContent
      insights={insights ?? []}
      isPremium={isPremium}
      weeklyUsed={weeklyUsed}
      hasData={(workoutCount ?? 0) >= 1}
    />
  );
}
