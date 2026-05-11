'use client';

import Link from 'next/link';
// motion replaced with CSS animations
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, YAxis } from 'recharts';
import { Dumbbell, Wallet, Flame, Brain, Footprints, ArrowRight, AlertTriangle, Info, Plus } from 'lucide-react';
import { TodaysFocus } from './todays-focus';
import { InsightCard, InsightsEmptyState } from '@/components/insights/insight-card';
import { formatCurrency } from '@/lib/pricing';
import type { Profile, AiInsight, Notification, WeeklyWorkoutData, WeeklyExpenseData, StreakData } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface DashboardContentProps {
  profile: Profile | null;
  todayWorkoutsCount: number;
  todayExpensesCount: number;
  todaySteps: number;
  monthlyExpenseTotal: number;
  budgetUsedPercent: number;
  activeHabitsToday: number;
  completedHabitsToday: number;
  pendingInsights: number;
  bestStreak: number;
  recentInsights: AiInsight[];
  recentNotifications: Notification[];
  weeklyWorkoutData: WeeklyWorkoutData[];
  weeklyExpenseData: WeeklyExpenseData[];
  streakData: StreakData[];
}

function StatCard({ index, icon: Icon, bg, accent, label, value, sub, href }: {
  index: number; icon: React.ElementType; bg: string; accent: string;
  label: string; value: string; sub?: string; href: string;
}) {
  return (
    <div className="animate-fade-up" style={{ animationDelay: `${index * 60}ms` }}>
      <Link href={href} className="aethlife-card block group">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${accent}`} />
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
        </div>
        <p className="text-2xl font-bold font-sans text-foreground leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-1.5">{label}</p>
        {sub && <p className="text-[11px] text-teal-500 mt-0.5">{sub}</p>}
      </Link>
    </div>
  );
}

export function DashboardContent({
  profile,
  todayWorkoutsCount,
  todayExpensesCount,
  todaySteps,
  monthlyExpenseTotal,
  budgetUsedPercent,
  activeHabitsToday,
  completedHabitsToday,
  pendingInsights,
  bestStreak,
  recentInsights,
  recentNotifications,
  weeklyWorkoutData,
  weeklyExpenseData,
  streakData,
}: DashboardContentProps) {
  const currency = profile?.currency ?? 'NGN';
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const supabase = createClient();
  const router = useRouter();

  async function handleInsightDismiss(id: string) {
    await supabase.from('ai_insights').update({ is_dismissed: true }).eq('id', id);
  }

  async function handleInsightRead(id: string) {
    await supabase.from('ai_insights').update({ is_read: true }).eq('id', id);
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Greeting */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1
          className="text-2xl font-bold text-foreground tracking-tight"
          style={{ fontFamily: "'Clash Display', sans-serif" }}
        >
          {greeting}, {firstName}
        </h1>
      </div>

      {/* PRIMARY HOOK: Today's Focus */}
      <TodaysFocus
        todayWorkouts={todayWorkoutsCount}
        todayExpenses={todayExpensesCount}
        completedHabits={completedHabitsToday}
        totalHabits={activeHabitsToday}
        pendingInsights={pendingInsights}
        streak={bestStreak}
      />

      {/* Quick stats — secondary to focus card */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard index={0} icon={Footprints} bg="bg-green-500/10" accent="text-green-500"
          label="Steps today" value={todaySteps.toLocaleString()}
          sub={todaySteps >= 10000 ? '🎯 Goal reached' : `${(10000 - todaySteps).toLocaleString()} to goal`}
          href="/fitness" />
        <StatCard index={1} icon={Wallet} bg="bg-amber-500/10" accent="text-amber-500"
          label="Month spending" value={formatCurrency(monthlyExpenseTotal, currency)}
          sub={budgetUsedPercent > 0 ? `${budgetUsedPercent}% of income` : 'No budget set'}
          href="/expenses" />
        <StatCard index={2} icon={Flame} bg="bg-orange-500/10" accent="text-orange-500"
          label="Best streak" value={bestStreak > 0 ? `${bestStreak}d` : '—'}
          sub={bestStreak > 0 ? 'Keep going' : 'Start a habit'}
          href="/habits" />
        <StatCard index={3} icon={Brain} bg="bg-teal-500/10" accent="text-teal-500"
          label="AI insights" value={String(pendingInsights || recentInsights.length)}
          sub={pendingInsights > 0 ? `${pendingInsights} unread` : 'View patterns'}
          href="/insights" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="aethlife-card animate-fade-up" style={{ animationDelay: "160ms" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Training this week</p>
              <p className="text-xs text-muted-foreground">Daily sessions</p>
            </div>
            <Link href="/fitness" className="text-xs text-teal-500 hover:text-teal-600 transition-colors">All workouts</Link>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={weeklyWorkoutData} barSize={18}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
                cursor={{ fill: 'hsl(var(--muted))', radius: 4 }} />
              <Bar dataKey="workouts" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="aethlife-card animate-fade-up" style={{ animationDelay: "220ms" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Spending this week</p>
              <p className="text-xs text-muted-foreground">Daily expenses</p>
            </div>
            <Link href="/expenses" className="text-xs text-teal-500 hover:text-teal-600 transition-colors">All expenses</Link>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={weeklyExpenseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={35} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
              <Line type="monotone" dataKey="amount" stroke="#14b8a6" strokeWidth={2} dot={{ fill: '#14b8a6', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights — behavioral intelligence */}
      <div className="animate-fade-up" style={{ animationDelay: "280ms" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-teal-500" />
            <p className="text-sm font-semibold text-foreground">Behavioral intelligence</p>
          </div>
          <Link href="/insights" className="text-xs text-teal-500 hover:text-teal-600 transition-colors">
            View all
          </Link>
        </div>

        {recentInsights.length === 0 ? (
          <div className="aethlife-card">
            <InsightsEmptyState />
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentInsights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onDismiss={handleInsightDismiss}
                onRead={handleInsightRead}
                compact
              />
            ))}
          </div>
        )}
      </div>

      {/* Budget health */}
      {budgetUsedPercent > 0 && (
        <div className="aethlife-card animate-fade-up" style={{ animationDelay: "300ms" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-foreground">Monthly budget</p>
            <div className="flex items-center gap-2">
              {budgetUsedPercent > 80 && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
              <Link href="/budget" className="text-xs text-teal-500 hover:text-teal-600 transition-colors">Manage</Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${budgetUsedPercent > 90 ? 'bg-rose-500' : budgetUsedPercent > 70 ? 'bg-amber-500' : 'bg-teal-500'}`}
                style={{ width: `${budgetUsedPercent}%` }} />
            </div>
            <span className={`text-sm font-bold ${budgetUsedPercent > 90 ? 'text-rose-500' : budgetUsedPercent > 70 ? 'text-amber-500' : 'text-teal-500'}`}>
              {budgetUsedPercent}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {formatCurrency(monthlyExpenseTotal, currency)} spent this month
            {budgetUsedPercent > 80 && <span className="text-amber-500 ml-2">— approaching limit</span>}
          </p>
        </div>
      )}

      {/* Active streaks */}
      {streakData.length > 0 && (
        <div className="aethlife-card animate-fade-up" style={{ animationDelay: "360ms" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-foreground">Active streaks</p>
            <Link href="/habits" className="text-xs text-teal-500 hover:text-teal-600 transition-colors">All habits</Link>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {streakData.map((s) => (
              <div key={s.habit_name} className="flex items-center gap-2.5 bg-muted/40 rounded-xl px-3 py-2.5">
                <span className="text-base">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{s.habit_name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Flame className="w-3 h-3 text-orange-500" />
                    <span className="text-xs font-bold text-orange-500">{s.streak}d</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
