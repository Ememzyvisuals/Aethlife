import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ExpensesContent } from '@/components/expenses/expenses-content';
import { format, startOfMonth, endOfMonth } from 'date-fns';

// Currency conversion utilities
const RATES: Record<string, Record<string, number>> = {
  NGN: { USD: 0.00065, EUR: 0.00060, GBP: 0.00051, NGN: 1 },
  USD: { NGN: 1540,    EUR: 0.92,    GBP: 0.79,    USD: 1 },
  EUR: { NGN: 1673,    USD: 1.09,    GBP: 0.86,    EUR: 1 },
  GBP: { NGN: 1950,    USD: 1.27,    EUR: 1.16,    GBP: 1 },
};

function convertAmt(amount: number, from: string, to: string): number {
  if (from === to) return amount;
  return amount * (RATES[from]?.[to] ?? 1);
}

function fmtCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = { NGN: '₦', USD: '$', EUR: '€', GBP: '£' };
  const sym = symbols[currency] ?? currency + ' ';
  if (currency === 'NGN') return sym + Math.round(amount).toLocaleString('en-NG');
  return sym + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}



export const dynamic = 'force-dynamic';


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
