import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sanitizeString, validateAmount, isValidDate, isValidUUID, normalizeCurrency } from '@/lib/utils/sanitize';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200);
    const page = Math.max(parseInt(searchParams.get('page') ?? '1'), 1);
    const offset = (page - 1) * limit;
    const category = searchParams.get('category');
    const dateFrom = searchParams.get('from');
    const dateTo = searchParams.get('to');

    let query = supabase
      .from('expenses')
      .select('*, category:expense_categories(id, name, icon, color)', { count: 'exact' })
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category && isValidUUID(category)) query = query.eq('category_id', category);
    if (dateFrom && isValidDate(dateFrom)) query = query.gte('date', dateFrom);
    if (dateTo && isValidDate(dateTo)) query = query.lte('date', dateTo);

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data, total: count ?? 0, page, per_page: limit, has_more: (count ?? 0) > offset + limit });
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
    const { amount, category_id, description, merchant, date, notes, currency, ai_scanned, receipt_data } = body;

    const { valid: amountValid, value: safeAmount } = validateAmount(amount);
    if (!amountValid) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    if (!description || typeof description !== 'string') return NextResponse.json({ error: 'Description required' }, { status: 400 });
    if (!category_id || !isValidUUID(category_id)) return NextResponse.json({ error: 'Valid category required' }, { status: 400 });
    if (!date || !isValidDate(date)) return NextResponse.json({ error: 'Valid date required' }, { status: 400 });

    // Verify category belongs to this user or is a default
    const { data: cat } = await supabase
      .from('expense_categories')
      .select('id')
      .eq('id', category_id)
      .or(`user_id.is.null,user_id.eq.${user.id}`)
      .single();
    if (!cat) return NextResponse.json({ error: 'Invalid category' }, { status: 400 });

    const { data: profile } = await supabase.from('profiles').select('currency').eq('user_id', user.id).single();
    const safeCurrency = normalizeCurrency(currency ?? profile?.currency);

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        category_id,
        amount: safeAmount,
        currency: safeCurrency,
        description: sanitizeString(description, 200),
        merchant: merchant ? sanitizeString(merchant, 100) : null,
        date,
        notes: notes ? sanitizeString(notes, 500) : null,
        ai_scanned: Boolean(ai_scanned),
        receipt_data: ai_scanned ? receipt_data : null,
      })
      .select('*, category:expense_categories(id, name, icon, color)')
      .single();

    if (error) return NextResponse.json({ error: 'Failed to save expense' }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id || !isValidUUID(id)) return NextResponse.json({ error: 'Valid ID required' }, { status: 400 });

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // RLS enforced but double-check

    if (error) return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
