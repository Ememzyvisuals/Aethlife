import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { HabitsContent } from '@/components/habits/habits-content';
import { format } from 'date-fns';

export default async function HabitsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const today = format(new Date(), 'yyyy-MM-dd');

  const [{ data: habits }, { data: todayLogs }] = await Promise.all([
    supabase.from('habits').select('*').eq('user_id', user.id).eq('is_active', true).order('streak_count', { ascending: false }),
    supabase.from('habit_logs').select('habit_id, count').eq('user_id', user.id).eq('date', today),
  ]);

  const completedToday = new Set(todayLogs?.map((l) => l.habit_id) ?? []);

  return (
    <HabitsContent
      habits={habits ?? []}
      completedTodayIds={completedToday}
      today={today}
    />
  );
}
