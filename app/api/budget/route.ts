import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { normalizeCurrency } from '@/lib/utils/sanitize';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const now = new Date();
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') ?? String(now.getMonth() + 1));
    const year = parseInt(searchParams.get('year') ?? String(now.getFullYear()));

    if (month < 1 || month > 12 || year < 2020 || year > 2100) {
      return NextResponse.json({ error: 'Invalid month or year' }, { status: 400 });
    }

    const { data: budget } = await supabase
      .from('budgets')
      .select('*, category_limits:budget_category_limits(*, category:expense_categories(id, name, icon, color))')
      .eq('user_id', user.id)
      .eq('month', month)
      .eq('year', year)
      .single();

    return NextResponse.json({ data: budget ?? null });
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
    const { total_income, currency, savings_goal_percent, month, year } = body;

    if (typeof total_income !== 'number' || total_income < 0 || total_income > 999_999_999) {
      return NextResponse.json({ error: 'Invalid income amount' }, { status: 400 });
    }

    const now = new Date();
    const safeMonth = typeof month === 'number' && month >= 1 && month <= 12 ? month : now.getMonth() + 1;
    const safeYear = typeof year === 'number' && year >= 2020 && year <= 2100 ? year : now.getFullYear();
    const safeSavings = typeof savings_goal_percent === 'number' ? Math.min(Math.max(savings_goal_percent, 0), 100) : 20;
    const safeCurrency = normalizeCurrency(currency);

    const { data: profile } = await supabase.from('profiles').select('currency').eq('user_id', user.id).single();

    const { data, error } = await supabase
      .from('budgets')
      .upsert({
        user_id: user.id,
        month: safeMonth,
        year: safeYear,
        total_income,
        currency: safeCurrency || profile?.currency || 'NGN',
        savings_goal_percent: safeSavings,
      }, { onConflict: 'user_id,month,year' })
      .select()
      .single();

    if (error) return NextResponse.json({ error: 'Failed to save budget' }, { status: 500 });
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
