import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, ScanLine, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/pricing';
import type { Currency } from '@/types';

export default async function ExpenseHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const [{ data: expenses }, { data: profile }] = await Promise.all([
    supabase
      .from('expenses')
      .select('*, category:expense_categories(name, icon, color)')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(200),
    supabase.from('profiles').select('currency').eq('user_id', user.id).single(),
  ]);

  const currency = (profile?.currency ?? 'NGN') as Currency;
  const total = expenses?.reduce((s, e) => s + Number(e.amount), 0) ?? 0;

  // Group by month
  const byMonth = new Map<string, typeof expenses>();
  for (const e of expenses ?? []) {
    const key = format(parseISO(e.date), 'MMMM yyyy');
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(e);
  }

  return (
    <div className="animate-fade-in max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/expenses" className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="page-title mb-0">All Expenses</h1>
          <p className="text-xs text-muted-foreground">
            {expenses?.length ?? 0} transactions · {formatCurrency(total, currency)} total
          </p>
        </div>
      </div>

      {Array.from(byMonth.entries()).map(([month, monthExpenses]) => {
        const monthTotal = monthExpenses!.reduce((s, e) => s + Number(e.amount), 0);
        return (
          <div key={month}>
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{month}</p>
              <p className="text-xs font-medium text-foreground">{formatCurrency(monthTotal, currency)}</p>
            </div>
            <div className="space-y-1.5">
              {monthExpenses!.map((e) => (
                <div key={e.id} className="aethlife-card flex items-center gap-3 py-3">
                  <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-base flex-shrink-0">
                    {e.category?.icon ?? '💳'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{e.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(e.date), 'MMM d')}
                      {e.merchant ? ` · ${e.merchant}` : ''}
                      {e.category ? ` · ${e.category.name}` : ''}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(Number(e.amount), e.currency as Currency)}
                    </p>
                    {e.ai_scanned && (
                      <span className="flex items-center gap-0.5 justify-end text-[10px] text-teal-500">
                        <ScanLine className="w-2.5 h-2.5" /> AI
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {(!expenses || expenses.length === 0) && (
        <div className="aethlife-card text-center py-12">
          <p className="text-sm text-muted-foreground">No expenses logged yet.</p>
          <Link href="/expenses/new" className="inline-flex mt-4 text-sm text-teal-500 font-medium">
            Add your first expense
          </Link>
        </div>
      )}
    </div>
  );
}
