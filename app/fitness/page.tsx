import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Plus, Dumbbell, Clock, Calendar, ChevronRight,
  Flame, Target, Trophy, TrendingUp, Zap,
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';

// ── Skeleton ──────────────────────────────────────────────────────────────────
function FitnessSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-2xl" />)}
      </div>
      <div className="h-48 bg-muted rounded-2xl" />
      <div className="space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-20 bg-muted rounded-2xl" />)}
      </div>
    </div>
  );
}

// ── Beginner Quick Start workouts ─────────────────────────────────────────────
const QUICK_START = [
  {
    name: '5-Minute Morning Move',
    emoji: '🌅',
    level: 'Beginner',
    duration: 5,
    desc: 'Light stretching and bodyweight — perfect if you\'re just starting out',
  },
  {
    name: 'Beginner Full Body',
    emoji: '💪',
    level: 'Beginner',
    duration: 20,
    desc: 'Squats, push-ups, and planks. No equipment needed.',
  },
  {
    name: '30-Min Walk',
    emoji: '🚶',
    level: 'Any level',
    duration: 30,
    desc: 'One of the most effective habits you can build. Just walk.',
  },
];

export default async function FitnessPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

  const [{ data: workouts }, { data: recentSteps }] = await Promise.all([
    supabase
      .from('workouts')
      .select('*, workout_logs(*, exercise:exercises(name, muscle_group))')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(20),
    supabase
      .from('step_logs')
      .select('steps, logged_date')
      .eq('user_id', user.id)
      .gte('logged_date', format(today, 'yyyy-MM-01'))
      .order('logged_date', { ascending: false })
      .limit(7),
  ]);

  const monthWorkouts = (workouts ?? []).filter(w =>
    w.completed_at >= monthStart
  );
  const avgDuration = monthWorkouts.length > 0
    ? Math.round(monthWorkouts.reduce((s, w) => s + (w.duration_minutes ?? 0), 0) / monthWorkouts.length)
    : 0;
  const todaySteps = recentSteps?.[0]?.steps ?? 0;
  const isFirstTime = (workouts ?? []).length === 0;

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Fitness</h1>
          <p className="page-subtitle">{monthWorkouts.length} workouts this month</p>
        </div>
        <Link
          href="/fitness/new"
          className="btn-primary flex items-center gap-2 py-2.5 px-4 text-sm"
        >
          <Plus className="w-4 h-4" />
          Log workout
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Calendar, label: 'This month', value: monthWorkouts.length, unit: 'workouts', color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { icon: Clock,    label: 'Avg duration', value: avgDuration, unit: 'minutes', color: 'text-teal-400', bg: 'bg-teal-500/10' },
          { icon: Flame,    label: 'Steps today', value: todaySteps.toLocaleString(), unit: '', color: 'text-orange-400', bg: 'bg-orange-500/10' },
        ].map(({ icon: Icon, label, value, unit, color, bg }) => (
          <div key={label} className="aethlife-card flex flex-col items-center text-center p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${bg}`}>
              <Icon className={`w-4.5 h-4.5 ${color}`} />
            </div>
            <span className="text-lg font-bold text-foreground" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              {value}
            </span>
            {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
            <span className="text-[10px] text-muted-foreground mt-0.5">{label}</span>
          </div>
        ))}
      </div>

      {/* ── First-time user guide ─────────────────────────────────── */}
      {isFirstTime && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Welcome! Log your first workout
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            No experience needed. Start small — even 5 minutes counts and builds the habit.
          </p>

          <div className="space-y-2 mb-4">
            {QUICK_START.map((qs) => (
              <Link
                key={qs.name}
                href={`/fitness/new?name=${encodeURIComponent(qs.name)}&duration=${qs.duration}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-muted/40 transition-all group"
              >
                <span className="text-xl flex-shrink-0">{qs.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{qs.name}</span>
                    <span className="text-[10px] text-muted-foreground border border-border rounded-full px-1.5 py-0.5">
                      {qs.level}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{qs.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            Or tap <strong>Log workout</strong> above to create a custom session.
          </p>
        </div>
      )}

      {/* ── Workout history ───────────────────────────────────────── */}
      {(workouts ?? []).length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Workout History
            </h2>
            <Link href="/fitness/history" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-2">
            {(workouts ?? []).slice(0, 8).map((workout) => {
              const exerciseCount = workout.workout_logs?.length ?? 0;
              const setCount = workout.workout_logs?.reduce(
                (s: number, l: { sets?: unknown[] }) => s + (l.sets?.length ?? 0), 0
              ) ?? 0;
              const daysDiff = differenceInDays(today, parseISO(workout.completed_at));

              return (
                <Link
                  key={workout.id}
                  href={`/fitness/${workout.id}`}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:border-primary/20 hover:bg-muted/40 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{workout.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {daysDiff === 0 ? 'Today' : daysDiff === 1 ? 'Yesterday' : format(parseISO(workout.completed_at), 'MMM d')}
                      </span>
                      <span className="text-muted-foreground/40 text-xs">·</span>
                      <span className="text-xs text-muted-foreground">
                        {workout.duration_minutes}m
                      </span>
                      {exerciseCount > 0 && (
                        <>
                          <span className="text-muted-foreground/40 text-xs">·</span>
                          <span className="text-xs text-muted-foreground">
                            {exerciseCount} exercises · {setCount} sets
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tips for beginners ────────────────────────────────────── */}
      {(workouts ?? []).length < 5 && (
        <div className="rounded-2xl border border-border bg-card/50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Beginner tips
            </h3>
          </div>
          <ul className="space-y-2.5">
            {[
              'Start with 2–3 workouts per week. Consistency beats intensity.',
              'Log everything — even a 10-minute walk. It all counts.',
              'Rest days are training too. Your body grows when you rest.',
              'Drink water before, during, and after every session.',
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  {i + 1}
                </span>
                <p className="text-sm text-muted-foreground">{tip}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
