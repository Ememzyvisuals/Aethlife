import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isValidDate } from '@/lib/utils/sanitize';
import { format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '30'), 90);

    const { data, error } = await supabase
      .from('step_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: data ?? [] });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const { steps, date, distance_km, calories_burned } = body;

    const safeSteps = typeof steps === 'number' ? Math.max(0, Math.min(Math.round(steps), 100000)) : null;
    if (!safeSteps && safeSteps !== 0) {
      return NextResponse.json({ error: 'Valid step count required (0-100,000)' }, { status: 400 });
    }

    const safeDate = isValidDate(date ?? '') ? date : format(new Date(), 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('step_logs')
      .upsert({
        user_id: user.id,
        date: safeDate,
        steps: safeSteps,
        distance_km: typeof distance_km === 'number' ? Math.max(0, distance_km) : null,
        calories_burned: typeof calories_burned === 'number' ? Math.max(0, Math.round(calories_burned)) : null,
      }, { onConflict: 'user_id,date' })
      .select()
      .single();

    if (error) return NextResponse.json({ error: 'Failed to save step log' }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
