import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sanitizeString, validateAmount, isValidDate } from '@/lib/utils/sanitize';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const page = Math.max(parseInt(searchParams.get('page') ?? '1'), 1);
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('workouts')
      .select('*, workout_logs(*, exercise:exercises(name, muscle_group))', { count: 'exact' })
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      data,
      total: count ?? 0,
      page,
      per_page: limit,
      has_more: (count ?? 0) > offset + limit,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, notes, duration_minutes, exercises, completed_at } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Workout name is required' }, { status: 400 });
    }
    if (!Array.isArray(exercises) || exercises.length === 0) {
      return NextResponse.json({ error: 'At least one exercise is required' }, { status: 400 });
    }

    const safeName = sanitizeString(name, 100);
    const safeNotes = notes ? sanitizeString(notes, 500) : null;
    const safeDuration = typeof duration_minutes === 'number'
      ? Math.min(Math.max(Math.round(duration_minutes), 1), 600)
      : null;

    // Save workout
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        user_id: user.id,
        name: safeName,
        notes: safeNotes,
        duration_minutes: safeDuration,
        completed_at: completed_at ?? new Date().toISOString(),
      })
      .select()
      .single();

    if (workoutError || !workout) {
      return NextResponse.json({ error: 'Failed to save workout' }, { status: 500 });
    }

    // Save workout logs
    const logs = exercises.flatMap((ex: { exercise_id: string; sets: { reps?: number; weight_kg?: number; duration_seconds?: number; notes?: string }[] }) =>
      (ex.sets ?? []).map((set, idx) => ({
        workout_id: workout.id,
        exercise_id: ex.exercise_id,
        set_number: idx + 1,
        reps: typeof set.reps === 'number' ? Math.max(0, Math.min(set.reps, 9999)) : null,
        weight_kg: typeof set.weight_kg === 'number' ? Math.max(0, Math.min(set.weight_kg, 9999)) : null,
        duration_seconds: typeof set.duration_seconds === 'number' ? Math.max(0, set.duration_seconds) : null,
        notes: set.notes ? sanitizeString(set.notes, 200) : null,
      }))
    );

    if (logs.length > 0) {
      const { error: logsError } = await supabase.from('workout_logs').insert(logs);
      if (logsError) console.error('[AethLife] Workout logs save error:', logsError);
    }

    return NextResponse.json({ data: workout }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
