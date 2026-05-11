'use client';

import { useState } from 'react';

import { Brain, TrendingUp, GitBranch, Activity, Zap, X, ChevronRight, Lock } from 'lucide-react';
import Link from 'next/link';
import type { AiInsight, InsightType } from '@/types';

const TYPE_CONFIG: Record<InsightType, {
  icon: React.ElementType;
  label: string;
  accent: string;
  bg: string;
  border: string;
}> = {
  spending_pattern:     { icon: TrendingUp,  label: 'Spending Pattern',     accent: 'text-amber-500', bg: 'bg-amber-500/8',  border: 'border-amber-500/25' },
  workout_consistency:  { icon: Activity,    label: 'Training Consistency',  accent: 'text-blue-500',  bg: 'bg-blue-500/8',   border: 'border-blue-500/25'  },
  behavior_correlation: { icon: GitBranch,   label: 'Behavior Correlation',  accent: 'text-violet-500',bg: 'bg-violet-500/8', border: 'border-violet-500/25'},
  energy_spending:      { icon: Zap,         label: 'Energy × Spending',     accent: 'text-rose-500',  bg: 'bg-rose-500/8',   border: 'border-rose-500/25'  },
  streak_prediction:    { icon: Brain,       label: 'Streak Forecast',       accent: 'text-teal-500',  bg: 'bg-teal-500/8',   border: 'border-teal-500/25'  },
  overspending_risk:    { icon: TrendingUp,  label: 'Spending Risk',         accent: 'text-rose-600',  bg: 'bg-rose-500/8',   border: 'border-rose-500/30'  },
  habit_performance:    { icon: Activity,    label: 'Habit Performance',     accent: 'text-green-500', bg: 'bg-green-500/8',  border: 'border-green-500/25' },
  cross_system:         { icon: GitBranch,   label: 'Cross-System Insight',  accent: 'text-teal-500',  bg: 'bg-teal-500/8',   border: 'border-teal-500/25'  },
  weekly_summary:       { icon: Brain,       label: 'Weekly Summary',        accent: 'text-blue-500',  bg: 'bg-blue-500/8',   border: 'border-blue-500/25'  },
  monthly_review:       { icon: Brain,       label: 'Monthly Review',        accent: 'text-violet-500',bg: 'bg-violet-500/8', border: 'border-violet-500/25'},
};

const PRIORITY_INDICATOR = {
  low: null,
  medium: null,
  high: <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />,
  critical: <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0 mt-1.5 animate-pulse-soft" />,
};

interface InsightCardProps {
  insight: AiInsight;
  onDismiss?: (id: string) => void;
  onRead?: (id: string) => void;
  compact?: boolean;
}

export function InsightCard({ insight, onDismiss, onRead, compact = false }: InsightCardProps) {
  const config = TYPE_CONFIG[insight.type] ?? TYPE_CONFIG.cross_system;
  const Icon = config.icon;
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  function handleDismiss(e: React.MouseEvent) {
    e.preventDefault();
    setDismissed(true);
    onDismiss?.(insight.id);
  }

  function handleClick() {
    if (!insight.is_read) onRead?.(insight.id);
  }

  return (
    <div
      onClick={handleClick}
      className={`relative border rounded-xl transition-all cursor-default ${config.border} ${config.bg} ${
        !insight.is_read ? 'ring-1 ring-inset ring-teal-500/10' : ''
      } ${compact ? 'p-3.5' : 'p-4'}`}
    >
      {/* Unread dot */}
      {!insight.is_read && (
        <span className="absolute top-3.5 right-10 w-1.5 h-1.5 bg-teal-500 rounded-full" />
      )}

      {/* Dismiss */}
      {onDismiss && (
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-lg text-muted-foreground/40 hover:text-muted-foreground hover:bg-black/5 transition-all"
          aria-label="Dismiss insight"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      <div className="flex items-start gap-3 pr-8">
        {/* Priority + Icon */}
        <div className="flex items-start gap-1.5 flex-shrink-0">
          {PRIORITY_INDICATOR[insight.priority]}
          <div className={`w-8 h-8 rounded-lg bg-background/60 border border-white/10 flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${config.accent}`} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[10px] font-semibold uppercase tracking-wide ${config.accent}`}>
              {config.label}
            </span>
            {insight.is_premium && (
              <span className="text-[9px] font-bold text-teal-500 bg-teal-500/15 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                Premium
              </span>
            )}
          </div>

          <p className={`font-semibold text-foreground leading-snug ${compact ? 'text-xs' : 'text-sm'} mb-1`}>
            {insight.title}
          </p>

          {!compact && (
            <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
          )}

          {/* Action suggestion from data */}
          {!compact && insight.data && typeof insight.data === 'object' &&
            'action_suggestion' in insight.data &&
            typeof insight.data.action_suggestion === 'string' && (
            <div className="mt-2.5 flex items-start gap-1.5">
              <ChevronRight className="w-3 h-3 text-teal-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-teal-600 dark:text-teal-400 font-medium leading-snug">
                {insight.data.action_suggestion}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Locked premium insight preview ───────────────────────────
interface LockedInsightCardProps {
  type: InsightType;
  title: string;
  preview: string;
}

export function LockedInsightCard({ type, title, preview }: LockedInsightCardProps) {
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.cross_system;
  const Icon = config.icon;

  return (
    <div className="relative border border-border rounded-xl p-4 overflow-hidden">
      {/* Blurred content */}
      <div className="blur-[3px] select-none pointer-events-none">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Icon className={`w-4 h-4 ${config.accent}`} />
          </div>
          <div>
            <span className={`text-[10px] font-semibold uppercase tracking-wide ${config.accent}`}>{config.label}</span>
            <p className="text-sm font-semibold text-foreground mt-0.5">{title}</p>
            <p className="text-xs text-muted-foreground mt-1">{preview}</p>
          </div>
        </div>
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[1px]">
        <Link
          href="/billing"
          className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 shadow-sm hover:border-teal-500/40 hover:bg-muted transition-all"
        >
          <Lock className="w-3.5 h-3.5 text-teal-500" />
          <span className="text-xs font-semibold text-foreground">Unlock with Premium</span>
        </Link>
      </div>
    </div>
  );
}

// ── Empty state for no insights yet ──────────────────────────
export function InsightsEmptyState() {
  return (
    <div className="text-center py-10 px-4">
      <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Brain className="w-7 h-7 text-teal-500" />
      </div>
      <p className="text-sm font-semibold text-foreground mb-2">Building your behavioral profile</p>
      <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed mb-5">
        AethLife analyzes patterns across your workouts, habits, expenses, and energy.
        Insights appear after a few days of logging.
      </p>
      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mb-5">
        {[
          { label: 'Log workouts', icon: Activity },
          { label: 'Track expenses', icon: TrendingUp },
          { label: 'Check habits', icon: GitBranch },
        ].map((item) => (
          <div key={item.label} className="bg-muted rounded-xl p-3 text-center">
            <item.icon className="w-4 h-4 text-muted-foreground mx-auto mb-1.5" />
            <p className="text-[10px] text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Usually ready after 3–7 days of activity</p>
    </div>
  );
}
