'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PiggyBank, Plus, Target, TrendingDown, Loader2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/pricing';
import type { Budget, ExpenseCategory, Currency } from '@/types';

const budgetSchema = z.object({
  total_income: z.number().positive('Income must be greater than 0'),
  savings_goal_percent: z.number().min(0).max(100),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

export default function BudgetPage() {
  const supabase = createClient();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [budget, setBudget] = useState<Budget | null>(null);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [monthlySpend, setMonthlySpend] = useState<Record<string, number>>({});
  const [currency, setCurrency] = useState<Currency>('NGN');
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { savings_goal_percent: 20 },
  });

  const income = watch('total_income', 0);
  const savingsPercent = watch('savings_goal_percent', 20);
  const savingsAmount = (income * savingsPercent) / 100;
  const spendableAmount = income - savingsAmount;

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const monthStart = format(new Date(currentYear, currentMonth - 1, 1), 'yyyy-MM-dd');
      const monthEnd = format(new Date(currentYear, currentMonth, 0), 'yyyy-MM-dd');

      const [{ data: budgetData }, { data: catsData }, { data: profileData }, { data: expenses }] =
        await Promise.all([
          supabase
            .from('budgets')
            .select('*, category_limits:budget_category_limits(*, category:expense_categories(*))')
            .eq('user_id', user.id)
            .eq('month', currentMonth)
            .eq('year', currentYear)
            .single(),
          supabase.from('expense_categories').select('*').or(`user_id.is.null,user_id.eq.${user.id}`).order('name'),
          supabase.from('profiles').select('currency').eq('user_id', user.id).single(),
          supabase.from('expenses').select('category_id, amount').eq('user_id', user.id).gte('date', monthStart).lte('date', monthEnd),
        ]);

      if (budgetData) {
        setBudget(budgetData);
        reset({ total_income: Number(budgetData.total_income), savings_goal_percent: Number(budgetData.savings_goal_percent) });
      }
      if (catsData) setCategories(catsData);
      if (profileData) setCurrency(profileData.currency as Currency);
      if (expenses) {
        const spendMap: Record<string, number> = {};
        expenses.forEach((e) => {
          if (e.category_id) {
            spendMap[e.category_id] = (spendMap[e.category_id] ?? 0) + Number(e.amount);
          }
        });
        setMonthlySpend(spendMap);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  async function onSubmit(data: BudgetFormData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      user_id: user.id,
      month: currentMonth,
      year: currentYear,
      total_income: data.total_income,
      currency,
      savings_goal_percent: data.savings_goal_percent,
    };

    const { data: saved, error } = await supabase
      .from('budgets')
      .upsert(payload, { onConflict: 'user_id,month,year' })
      .select()
      .single();

    if (error) {
      toast.error('Failed to save budget');
      return;
    }

    setBudget(saved);
    toast.success('Budget saved!');
  }

  const totalSpent = Object.values(monthlySpend).reduce((s, v) => s + v, 0);
  const budgetUsedPct = income > 0 ? Math.min(Math.round((totalSpent / income) * 100), 100) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl">
      <div className="page-header">
        <h1 className="page-title">Budget</h1>
        <p className="page-subtitle">{format(now, 'MMMM yyyy')}</p>
      </div>

      {/* Budget form */}
      <div className="aethlife-card">
        <div className="flex items-center gap-2 mb-5">
          <PiggyBank className="w-4 h-4 text-teal-500" />
          <p className="text-sm font-semibold text-foreground">Monthly Income & Goals</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Monthly income ({currency})
              </label>
              <input
                type="number"
                step="100"
                min="0"
                placeholder="0"
                {...register('total_income', { valueAsNumber: true })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-mono"
              />
              {errors.total_income && <p className="text-xs text-destructive mt-1">{errors.total_income.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Savings goal: {savingsPercent}%
              </label>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                {...register('savings_goal_percent', { valueAsNumber: true })}
                className="w-full accent-teal-500 mt-3"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span>30%</span>
                <span>60%</span>
              </div>
            </div>
          </div>

          {/* Budget breakdown preview */}
          {income > 0 && (
            <div className="grid grid-cols-3 gap-3 p-4 bg-muted/50 rounded-xl">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Income</p>
                <p className="text-sm font-bold text-foreground">{formatCurrency(income, currency)}</p>
              </div>
              <div className="text-center border-x border-border">
                <p className="text-xs text-muted-foreground mb-1">Savings goal</p>
                <p className="text-sm font-bold text-teal-500">{formatCurrency(savingsAmount, currency)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Spendable</p>
                <p className="text-sm font-bold text-foreground">{formatCurrency(spendableAmount, currency)}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Save Budget
          </button>
        </form>
      </div>

      {/* Spending overview */}
      {income > 0 && (
        <div className="aethlife-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-teal-500" />
              <p className="text-sm font-semibold text-foreground">Spending Overview</p>
            </div>
            <span className={`text-sm font-bold ${budgetUsedPct > 80 ? 'text-rose-500' : 'text-foreground'}`}>
              {budgetUsedPct}% used
            </span>
          </div>

          <div className="h-2.5 bg-muted rounded-full overflow-hidden mb-4">
            <div
              className={`h-full rounded-full transition-all ${
                budgetUsedPct > 90 ? 'bg-rose-500' : budgetUsedPct > 70 ? 'bg-amber-500' : 'bg-teal-500'
              }`}
              style={{ width: `${budgetUsedPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground mb-5">
            <span>Spent: {formatCurrency(totalSpent, currency)}</span>
            <span>Remaining: {formatCurrency(Math.max(income - totalSpent, 0), currency)}</span>
          </div>

          {/* Category breakdown */}
          <div className="space-y-3">
            {categories
              .filter((cat) => monthlySpend[cat.id])
              .sort((a, b) => (monthlySpend[b.id] ?? 0) - (monthlySpend[a.id] ?? 0))
              .map((cat) => {
                const spent = monthlySpend[cat.id] ?? 0;
                const pct = income > 0 ? Math.round((spent / income) * 100) : 0;
                return (
                  <div key={cat.id} className="flex items-center gap-3">
                    <span className="text-base flex-shrink-0">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-foreground">{cat.name}</p>
                        <p className="text-xs font-medium text-foreground ml-2">{formatCurrency(spent, currency)}</p>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-teal-500"
                          style={{ width: `${Math.min(pct * 3, 100)}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right flex-shrink-0">{pct}%</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
