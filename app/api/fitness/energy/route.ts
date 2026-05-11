import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isValidDate } from '@/lib/utils/sanitize';
import { format } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const { level, mood, date, notes } = body;

    if (typeof level !== 'number' || level < 1 || level > 5) {
      return NextResponse.json({ error: 'Energy level must be 1-5' }, { status: 400 });
    }
    if (typeof mood !== 'number' || mood < 1 || mood > 5) {
      return NextResponse.json({ error: 'Mood must be 1-5' }, { status: 400 });
    }

    const safeDate = isValidDate(date ?? '') ? date : format(new Date(), 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('energy_logs')
      .upsert({
        user_id: user.id,
        date: safeDate,
        level: Math.round(level),
        mood: Math.round(mood),
        notes: typeof notes === 'string' ? notes.slice(0, 300) : null,
      }, { onConflict: 'user_id,date' })
      .select()
      .single();

    if (error) return NextResponse.json({ error: 'Failed to save energy log' }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('energy_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(30);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: data ?? [] });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
