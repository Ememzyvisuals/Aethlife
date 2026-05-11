import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Clock, Dumbbell, RotateCcw, Trash2 } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkoutDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: workout } = await supabase
    .from('workouts')
    .select(`
      *,
      workout_logs(
        *,
        exercise:exercises(name, muscle_group, equipment)
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!workout) notFound();

  // Group logs by exercise
  const byExercise = new Map<string, { name: string; muscle: string; sets: typeof workout.workout_logs }>();
  for (const log of workout.workout_logs ?? []) {
    const ex = log.exercise;
    if (!ex) continue;
    if (!byExercise.has(ex.name)) {
      byExercise.set(ex.name, { name: ex.name, muscle: ex.muscle_group, sets: [] });
    }
    byExercise.get(ex.name)!.sets.push(log);
  }

  const exercises = Array.from(byExercise.values());

  return (
    <div className="animate-fade-in max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/fitness" className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="page-title mb-0">{workout.name}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {format(parseISO(workout.completed_at), 'EEEE, MMMM d, yyyy · h:mm a')}
          </p>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Duration', value: workout.duration_minutes ? `${workout.duration_minutes}m` : '—', icon: Clock },
          { label: 'Exercises', value: String(exercises.length), icon: Dumbbell },
          { label: 'Total sets', value: String(workout.workout_logs?.length ?? 0), icon: Dumbbell },
        ].map((s) => (
          <div key={s.label} className="aethlife-card text-center">
            <p className="text-xl font-bold font-sans text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {workout.notes && (
        <div className="aethlife-card">
          <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
          <p className="text-sm text-foreground">{workout.notes}</p>
        </div>
      )}

      {/* Exercise breakdown */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Exercises</h2>
        {exercises.map((ex) => (
          <div key={ex.name} className="aethlife-card">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{ex.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{ex.muscle.replace(/_/g, ' ')}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="grid grid-cols-4 text-xs font-medium text-muted-foreground px-1 mb-2">
                <span>Set</span><span>Weight</span><span>Reps</span><span>Notes</span>
              </div>
              {ex.sets
                .sort((a: any, b: any) => a.set_number - b.set_number)
                .map((set: any) => (
                  <div key={set.id} className="grid grid-cols-4 text-sm bg-muted/40 rounded-lg px-3 py-2">
                    <span className="font-medium text-foreground">{set.set_number}</span>
                    <span className="text-foreground">{set.weight_kg ? `${set.weight_kg}kg` : '—'}</span>
                    <span className="text-foreground">{set.reps ?? '—'}</span>
                    <span className="text-muted-foreground text-xs">{set.notes ?? ''}</span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Link
          href={`/fitness/new?repeat=${workout.id}`}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Repeat workout
        </Link>
      </div>
    </div>
  );
}
