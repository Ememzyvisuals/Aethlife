import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO, startOfMonth, endOfMonth, eachWeekOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { ArrowLeft, Dumbbell, Clock, TrendingUp } from 'lucide-react';

export default async function FitnessHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const now = new Date();
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

  const [{ data: allWorkouts }, { data: stepLogs }] = await Promise.all([
    supabase
      .from('workouts')
      .select('id, name, completed_at, duration_minutes')
      .eq('user_id', user.id)
      .gte('completed_at', `${monthStart}T00:00:00`)
      .lte('completed_at', `${monthEnd}T23:59:59`)
      .order('completed_at', { ascending: false }),
    supabase
      .from('step_logs')
      .select('date, steps, distance_km')
      .eq('user_id', user.id)
      .gte('date', monthStart)
      .lte('date', monthEnd)
      .order('date', { ascending: false }),
  ]);

  const totalWorkouts = allWorkouts?.length ?? 0;
  const totalDuration = allWorkouts?.reduce((s, w) => s + (w.duration_minutes ?? 0), 0) ?? 0;
  const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;
  const totalSteps = stepLogs?.reduce((s, l) => s + l.steps, 0) ?? 0;

  // Group workouts by week
  const weeks = eachWeekOfInterval(
    { start: startOfMonth(now), end: endOfMonth(now) },
    { weekStartsOn: 1 }
  );

  const byWeek = weeks.map((weekStart) => {
    const we = endOfWeek(weekStart, { weekStartsOn: 1 });
    const weekWorkouts = allWorkouts?.filter((w) => {
      const d = parseISO(w.completed_at);
      return d >= weekStart && d <= we;
    }) ?? [];
    return {
      label: `Week of ${format(weekStart, 'MMM d')}`,
      count: weekWorkouts.length,
    };
  });

  return (
    <div className="animate-fade-in max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/fitness" className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="page-title mb-0">Fitness History</h1>
          <p className="text-xs text-muted-foreground">{format(now, 'MMMM yyyy')}</p>
        </div>
      </div>

      {/* Monthly stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Workouts', value: String(totalWorkouts), icon: Dumbbell, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Total time', value: `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`, icon: Clock, color: 'text-teal-500', bg: 'bg-teal-500/10' },
          { label: 'Avg duration', value: avgDuration > 0 ? `${avgDuration}m` : '—', icon: TrendingUp, color: 'text-violet-500', bg: 'bg-violet-500/10' },
          { label: 'Total steps', value: totalSteps > 0 ? `${(totalSteps / 1000).toFixed(1)}k` : '—', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        ].map((s) => (
          <div key={s.label} className="aethlife-card text-center">
            <div className={`w-8 h-8 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-lg font-bold font-sans text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Weekly breakdown */}
      <div className="aethlife-card">
        <p className="text-sm font-semibold text-foreground mb-4">Weekly breakdown</p>
        <div className="space-y-3">
          {byWeek.map((week) => (
            <div key={week.label} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-28 flex-shrink-0">{week.label}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all"
                  style={{ width: `${Math.min((week.count / 7) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs font-medium text-foreground w-8 text-right">{week.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Workout list */}
      {allWorkouts && allWorkouts.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">All workouts this month</p>
          <div className="space-y-2">
            {allWorkouts.map((w) => (
              <Link key={w.id} href={`/fitness/${w.id}`} className="aethlife-card flex items-center gap-3 group">
                <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Dumbbell className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{w.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(w.completed_at), 'EEE, MMM d · h:mm a')}
                    {w.duration_minutes ? ` · ${w.duration_minutes}m` : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {(!allWorkouts || allWorkouts.length === 0) && (
        <div className="aethlife-card text-center py-12">
          <p className="text-sm text-muted-foreground">No workouts logged this month yet.</p>
          <Link href="/fitness/new" className="inline-flex items-center gap-2 mt-4 text-sm text-teal-500 font-medium">
            Log your first workout
          </Link>
        </div>
      )}
    </div>
  );
}
