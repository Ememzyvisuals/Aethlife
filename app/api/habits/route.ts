import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sanitizeString, isValidUUID, isValidDate } from '@/lib/utils/sanitize';
import { format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const today = format(new Date(), 'yyyy-MM-dd');

    const [{ data: habits }, { data: todayLogs }] = await Promise.all([
      supabase.from('habits').select('*').eq('user_id', user.id).eq('is_active', true).order('streak_count', { ascending: false }),
      supabase.from('habit_logs').select('habit_id, count').eq('user_id', user.id).eq('date', today),
    ]);

    const completedIds = new Set((todayLogs ?? []).map((l) => l.habit_id));

    return NextResponse.json({
      data: habits ?? [],
      completed_today: Array.from(completedIds),
      today,
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
    const { action } = body;

    if (action === 'toggle') {
      // Toggle habit completion for today
      const { habit_id, date } = body;
      if (!habit_id || !isValidUUID(habit_id)) return NextResponse.json({ error: 'Valid habit_id required' }, { status: 400 });
      const safeDate = isValidDate(date ?? '') ? date : format(new Date(), 'yyyy-MM-dd');

      // Verify habit belongs to user
      const { data: habit } = await supabase.from('habits').select('id').eq('id', habit_id).eq('user_id', user.id).single();
      if (!habit) return NextResponse.json({ error: 'Habit not found' }, { status: 404 });

      const { data: existing } = await supabase.from('habit_logs').select('id').eq('habit_id', habit_id).eq('date', safeDate).single();

      if (existing) {
        await supabase.from('habit_logs').delete().eq('id', existing.id);
        return NextResponse.json({ completed: false });
      } else {
        await supabase.from('habit_logs').insert({ habit_id, user_id: user.id, date: safeDate, count: 1 });

        // Update streak
        await updateStreak(supabase, habit_id, user.id);
        return NextResponse.json({ completed: true });
      }
    }

    if (action === 'create') {
      const { name, description, icon, color, frequency, frequency_days, target_count, reminder_time } = body;
      if (!name || typeof name !== 'string') return NextResponse.json({ error: 'Name required' }, { status: 400 });

      const { data, error } = await supabase.from('habits').insert({
        user_id: user.id,
        name: sanitizeString(name, 100),
        description: description ? sanitizeString(description, 300) : null,
        icon: icon ?? '⭐',
        color: color ?? '#14b8a6',
        frequency: ['daily', 'weekly', 'custom'].includes(frequency) ? frequency : 'daily',
        frequency_days: Array.isArray(frequency_days) ? frequency_days : [1, 2, 3, 4, 5, 6, 7],
        target_count: typeof target_count === 'number' ? Math.max(1, Math.min(target_count, 99)) : 1,
        reminder_time: reminder_time ?? null,
      }).select().single();

      if (error) return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 });
      return NextResponse.json({ data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function updateStreak(supabase: ReturnType<typeof import('@/lib/supabase/server').createClient> extends Promise<infer T> ? T : never, habitId: string, userId: string) {
  try {
    const { data: logs } = await supabase
      .from('habit_logs')
      .select('date')
      .eq('habit_id', habitId)
      .order('date', { ascending: false })
      .limit(365);

    if (!logs || logs.length === 0) return;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logDates = new Set(logs.map((l) => l.date));

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      if (logDates.has(dateStr)) {
        streak++;
      } else {
        break;
      }
    }

    const { data: currentHabit } = await supabase.from('habits').select('longest_streak').eq('id', habitId).single();
    const longestStreak = Math.max(streak, currentHabit?.longest_streak ?? 0);

    await supabase.from('habits').update({ streak_count: streak, longest_streak: longestStreak }).eq('id', habitId).eq('user_id', userId);
  } catch (e) {
    console.error('[AethLife] Streak update error:', e);
  }
}
