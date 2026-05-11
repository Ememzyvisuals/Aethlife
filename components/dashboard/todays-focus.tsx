'use client';

import { useState } from 'react';
import Link from 'next/link';

import {
  Dumbbell, Wallet, CheckSquare, Brain,
  ChevronRight, Circle, CheckCircle2, ArrowRight,
  Zap, Flame,
} from 'lucide-react';
import { format } from 'date-fns';

interface FocusTask {
  id: string;
  type: 'workout' | 'expense' | 'habit' | 'insight';
  label: string;
  description: string;
  href: string;
  completed: boolean;
  priority: 'high' | 'normal';
}

interface TodaysFocusProps {
  todayWorkouts: number;
  todayExpenses: number;
  completedHabits: number;
  totalHabits: number;
  pendingInsights: number;
  streak: number;
}

const iconMap = {
  workout: Dumbbell,
  expense: Wallet,
  habit: CheckSquare,
  insight: Brain,
};

const colorMap = {
  workout: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
  expense: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
  habit: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
  insight: { bg: 'bg-teal-500/10', text: 'text-teal-500', border: 'border-teal-500/20' },
};

export function TodaysFocus({
  todayWorkouts,
  todayExpenses,
  completedHabits,
  totalHabits,
  pendingInsights,
  streak,
}: TodaysFocusProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const tasks: FocusTask[] = [
    {
      id: 'workout',
      type: 'workout',
      label: todayWorkouts > 0 ? `${todayWorkouts} workout${todayWorkouts > 1 ? 's' : ''} logged` : 'Log today\'s workout',
      description: todayWorkouts > 0 ? 'Keep your training streak going.' : 'Consistency compounds. Log anything — even a walk counts.',
      href: todayWorkouts > 0 ? '/fitness' : '/fitness/new',
      completed: todayWorkouts > 0,
      priority: 'normal',
    },
    {
      id: 'habits',
      type: 'habit',
      label: totalHabits === 0
        ? 'Create your first habit'
        : completedHabits === totalHabits
        ? `All ${totalHabits} habits done`
        : `${completedHabits}/${totalHabits} habits completed`,
      description: totalHabits === 0
        ? 'Habits are the foundation of behavioral insight.'
        : completedHabits === totalHabits
        ? 'Perfect habit day. Your AI insights will be sharper tomorrow.'
        : `${totalHabits - completedHabits} remaining. Don't break your streak.`,
      href: '/habits',
      completed: totalHabits > 0 && completedHabits === totalHabits,
      priority: streak > 3 ? 'high' : 'normal',
    },
    {
      id: 'expense',
      type: 'expense',
      label: todayExpenses > 0 ? `${todayExpenses} expense${todayExpenses > 1 ? 's' : ''} logged` : 'Log today\'s spending',
      description: todayExpenses > 0
        ? 'Good. AethLife can now correlate your spending with today\'s habits.'
        : 'Even one expense gives AethLife behavioral pattern data.',
      href: todayExpenses > 0 ? '/expenses' : '/expenses/new',
      completed: todayExpenses > 0,
      priority: 'normal',
    },
    {
      id: 'insight',
      type: 'insight',
      label: pendingInsights > 0 ? `${pendingInsights} new insight${pendingInsights > 1 ? 's' : ''} ready` : 'AI insights',
      description: pendingInsights > 0
        ? 'AethLife detected patterns in your recent behavior.'
        : 'Keep logging daily. Insights appear after 3+ days of data.',
      href: '/insights',
      completed: pendingInsights === 0,
      priority: pendingInsights > 0 ? 'high' : 'normal',
    },
  ].filter((t) => !dismissed.has(t.id));

  const completedCount = tasks.filter((t) => t.completed).length;
  const allDone = tasks.every((t) => t.completed);

  return (
    <div className="aethlife-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Today's focus</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-lg">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-xs font-bold text-orange-500">{streak}d</span>
            </div>
          )}
          <div className="text-right">
            <p className="text-sm font-bold text-foreground">{completedCount}/{tasks.length}</p>
            <p className="text-xs text-muted-foreground">done</p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-teal-500 rounded-full"
          style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%`, transition: 'width 0.4s ease' }}
        />
      </div>

      {allDone ? (
        <div
          className="text-center py-4"
        >
          <div className="w-10 h-10 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-5 h-5 text-teal-500" />
          </div>
          <p className="text-sm font-semibold text-foreground">All done for today</p>
          <p className="text-xs text-muted-foreground mt-1">
            AethLife is building your behavioral profile. See you tomorrow.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          
            {tasks.map((task) => {
              const Icon = iconMap[task.type];
              const colors = colorMap[task.type];

              return (
                <div
                  layout
                >
                  <Link
                    href={task.href}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all group ${
                      task.completed
                        ? 'border-border bg-muted/20 opacity-60'
                        : task.priority === 'high'
                        ? `border ${colors.border} ${colors.bg}`
                        : 'border-border hover:border-teal-500/30 hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-teal-500" />
                      ) : (
                        <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${colors.text}`} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {task.label}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                    </div>
                    {!task.completed && (
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-teal-500 transition-colors flex-shrink-0" />
                    )}
                  </Link>
                </div>
              );
            })}
          
        </div>
      )}
    </div>
  );
}
