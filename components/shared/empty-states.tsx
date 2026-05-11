'use client';

import Link from 'next/link';
import {
  Dumbbell, Wallet, CheckSquare, Brain,
  PiggyBank, Plus, ArrowRight, BarChart3,
} from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon: React.ElementType;
}

function EmptyState({ title, description, actionLabel, actionHref, icon: Icon }: EmptyStateProps) {
  return (
    <div className="text-center py-14 px-4">
      <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-muted-foreground/50" />
      </div>
      <p className="text-sm font-semibold text-foreground mb-2">{title}</p>
      <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed mb-5">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export function WorkoutsEmptyState() {
  return (
    <EmptyState
      icon={Dumbbell}
      title="No workouts yet"
      description="Log your first workout to start tracking progress and building your behavioral profile."
      actionLabel="Log first workout"
      actionHref="/fitness/new"
    />
  );
}

export function ExpensesEmptyState() {
  return (
    <EmptyState
      icon={Wallet}
      title="No expenses this month"
      description="Track your spending to unlock behavioral insights connecting your finances to habits and energy."
      actionLabel="Add expense"
      actionHref="/expenses/new"
    />
  );
}

export function HabitsEmptyState() {
  return (
    <EmptyState
      icon={CheckSquare}
      title="No habits created"
      description="Habits are the foundation of AethLife's behavioral intelligence. Start with one simple daily habit."
      actionLabel="Create first habit"
      actionHref="/habits"
    />
  );
}

export function BudgetEmptyState() {
  return (
    <EmptyState
      icon={PiggyBank}
      title="No budget set"
      description="Set your monthly income and savings goal. AethLife will show you how your habits affect your spending."
      actionLabel="Set up budget"
      actionHref="/budget"
    />
  );
}

export function InsightsDataNeeded() {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Brain className="w-6 h-6 text-teal-500" />
      </div>
      <p className="text-sm font-semibold text-foreground mb-2">Building your behavioral profile</p>
      <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed mb-5">
        Log workouts, expenses, and complete habits for 3-7 days.
        AethLife will then surface behavioral patterns invisible in isolation.
      </p>
      <div className="flex items-center justify-center gap-2 mb-6">
        {[
          { label: 'Workouts', icon: Dumbbell, href: '/fitness/new' },
          { label: 'Expenses', icon: Wallet, href: '/expenses/new' },
          { label: 'Habits', icon: CheckSquare, href: '/habits' },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-1.5 text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-lg hover:bg-teal-500/15 transition-all"
          >
            <item.icon className="w-3.5 h-3.5" />
            {item.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <BarChart3 className="w-3.5 h-3.5" />
        Insights typically appear after 3-7 days of consistent logging
      </div>
    </div>
  );
}

export function NotificationsEmptyState() {
  return (
    <EmptyState
      icon={Brain}
      title="No notifications yet"
      description="AethLife will notify you about streaks, budget alerts, AI insights, and behavioral patterns as you log."
    />
  );
}
