import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ExpensesContent } from '@/components/expenses/expenses-content';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export default async function ExpensesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const now = new Date();
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

  const [{ data: expenses }, { data: categories }, { data: profile }] = await Promise.all([
    supabase
      .from('expenses')
      .select('*, category:expense_categories(*)')
      .eq('user_id', user.id)
      .gte('date', monthStart)
      .lte('date', monthEnd)
      .order('date', { ascending: false }),
    supabase
      .from('expense_categories')
      .select('*')
      .or(`user_id.is.null,user_id.eq.${user.id}`)
      .order('name'),
    supabase.from('profiles').select('currency').eq('user_id', user.id).single(),
  ]);

  return (
    <ExpensesContent
      expenses={expenses ?? []}
      categories={categories ?? []}
      currency={profile?.currency ?? 'NGN'}
    />
  );
}
