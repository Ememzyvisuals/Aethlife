import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardContent } from '@/components/dashboard/dashboard-content';
import { trackDailyActive } from '@/lib/utils/analytics';
import { format, startOfMonth, endOfMonth, startOfWeek } from 'date-fns';

export const dynamic = 'force-dynamic';


export const metadata = { title: 'Dashboard' };


// ── Static NGN/USD exchange rate (updated periodically) ─────
// For live rates, use an exchange API when budget is saved
const NGN_TO_USD = 0.00065;  // ~₦1,540 = $1 (approx May 2026)
const USD_TO_NGN = 1540;

function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) return amount;
  if (fromCurrency === 'NGN' && toCurrency === 'USD') return amount * NGN_TO_USD;
  if (fromCurrency === 'USD' && toCurrency === 'NGN') return amount * USD_TO_NGN;
  return amount;
}

function formatCurrency(amount: number, currency: string): string {
  if (currency === 'NGN') return `₦${amount.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
  if (currency === 'USD') return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `${currency} ${amount.toLocaleString()}`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const monthStart = format(startOfMonth(today), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd');
  const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');

  trackDailyActive(user.id).catch(() => {});

  const [
    { data: profile },
    { data: todayWorkouts },
    { data: todayExpenses },
    { data: monthExpenses },
    { data: todaySteps },
    { data: activeHabits },
    { data: todayHabitLogs },
    { data: currentBudget },
    { data: recentInsights },
    { data: recentNotifications },
    { data: weeklyWorkouts },
    { data: weeklyExpenses },
    { data: topStreakHabits },
    { count: unreadInsights },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('workouts').select('id').eq('user_id', user.id).gte('completed_at', `${todayStr}T00:00:00`).lte('completed_at', `${todayStr}T23:59:59`),
    supabase.from('expenses').select('id').eq('user_id', user.id).eq('date', todayStr),
    supabase.from('expenses').select('amount').eq('user_id', user.id).gte('date', monthStart).lte('date', monthEnd),
    supabase.from('step_logs').select('steps').eq('user_id', user.id).eq('date', todayStr).single(),
    supabase.from('habits').select('id').eq('user_id', user.id).eq('is_active', true),
    supabase.from('habit_logs').select('habit_id').eq('user_id', user.id).eq('date', todayStr),
    supabase.from('budgets').select('total_income, currency').eq('user_id', user.id).eq('month', today.getMonth() + 1).eq('year', today.getFullYear()).single(),
    supabase.from('ai_insights').select('*').eq('user_id', user.id).eq('is_dismissed', false).order('generated_at', { ascending: false }).limit(3),
    supabase.from('notifications').select('*').eq('user_id', user.id).order('sent_at', { ascending: false }).limit(4),
    supabase.from('workouts').select('completed_at, duration_minutes').eq('user_id', user.id).gte('completed_at', weekStart).order('completed_at'),
    supabase.from('expenses').select('date, amount').eq('user_id', user.id).gte('date', weekStart).order('date'),
    supabase.from('habits').select('name, icon, color, streak_count').eq('user_id', user.id).eq('is_active', true).order('streak_count', { ascending: false }).limit(4),
    supabase.from('ai_insights').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false).eq('is_dismissed', false),
  ]);

  const monthlyTotal = monthExpenses?.reduce((s, e) => s + Number(e.amount), 0) ?? 0;

  // Currency conversion — convert stored amounts to user's display currency
  const displayCurrency  = (profile?.currency ?? 'NGN') as string;
  const budgetCurrency   = (currentBudget?.currency ?? 'NGN') as string;

  // Convert monthly total from stored currency to display currency
  const convertedMonthlyTotal = convertAmount(monthlyTotal, budgetCurrency, displayCurrency);

  // Convert income for budget percentage (use same currency basis)
  const incomeInDisplay = convertAmount(
    Number(currentBudget?.total_income ?? 0),
    budgetCurrency,
    displayCurrency
  );

  const budgetUsed = incomeInDisplay > 0
    ? Math.min(Math.round((convertedMonthlyTotal / incomeInDisplay) * 100), 100)
    : 0;
  const completedHabits = todayHabitLogs?.length ?? 0;
  const totalHabits = activeHabits?.length ?? 0;
  const bestStreak = topStreakHabits?.[0]?.streak_count ?? 0;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyWorkoutData = days.map((day, i) => {
    const d = new Date(weekStart); d.setDate(d.getDate() + i);
    const ds = format(d, 'yyyy-MM-dd');
    const dw = weeklyWorkouts?.filter((w) => w.completed_at.startsWith(ds)) ?? [];
    return { day, workouts: dw.length, duration: dw.reduce((s, w) => s + (w.duration_minutes ?? 0), 0) };
  });

  const weeklyExpenseData = days.map((day, i) => {
    const d = new Date(weekStart); d.setDate(d.getDate() + i);
    const ds = format(d, 'yyyy-MM-dd');
    const de = weeklyExpenses?.filter((e) => e.date === ds) ?? [];
    const rawAmount = de.reduce((s, e) => s + Number(e.amount), 0);
    // Convert chart amounts to display currency too
    return { day, amount: convertAmount(rawAmount, budgetCurrency, displayCurrency) };
  });

  return (
    <DashboardContent
      profile={profile}
      todayWorkoutsCount={todayWorkouts?.length ?? 0}
      todayExpensesCount={todayExpenses?.length ?? 0}
      todaySteps={todaySteps?.steps ?? 0}
      monthlyExpenseTotal={convertedMonthlyTotal}
      budgetUsedPercent={budgetUsed}
      displayCurrency={displayCurrency}
      activeHabitsToday={totalHabits}
      completedHabitsToday={completedHabits}
      pendingInsights={unreadInsights ?? 0}
      bestStreak={bestStreak}
      recentInsights={recentInsights ?? []}
      recentNotifications={recentNotifications ?? []}
      weeklyWorkoutData={weeklyWorkoutData}
      weeklyExpenseData={weeklyExpenseData}
      streakData={(topStreakHabits ?? []).map((h) => ({
        habit_name: h.name, streak: h.streak_count, icon: h.icon, color: h.color,
      }))}
    />
  );
}
