'use client';

/**
 * AethLife — AI Insights Page
 * Redesigned as a premium intelligence feed
 * Clean cards, data-driven feel, no clutter
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Brain, Sparkles, Crown, TrendingUp, Activity,
  GitBranch, Zap, ChevronRight, X, RefreshCw,
  BarChart3, Flame, AlertTriangle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { GenerateInsightButton } from './generate-button';
import type { AiInsight, InsightType } from '@/types';

// ── Skeleton ─────────────────────────────────────────────────────────────────
function InsightSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-2xl border border-border p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 bg-muted rounded-full w-24" />
              <div className="h-4 bg-muted rounded-full w-3/4" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded-full w-full" />
            <div className="h-3 bg-muted rounded-full w-5/6" />
            <div className="h-3 bg-muted rounded-full w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Insight type config ───────────────────────────────────────────────────────
const TYPE_CONFIG: Record<InsightType | string, {
  icon: React.ElementType;
  label: string;
  color: string;
  bg: string;
}> = {
  behavior_correlation: { icon: GitBranch, label: 'Behavior', color: 'text-violet-400', bg: 'bg-violet-500/10' },
  energy_spending:      { icon: Zap,       label: 'Energy',   color: 'text-amber-400',  bg: 'bg-amber-500/10'  },
  streak_prediction:    { icon: Flame,     label: 'Streak',   color: 'text-orange-400', bg: 'bg-orange-500/10' },
  fitness_finance:      { icon: TrendingUp,label: 'Pattern',  color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
  habit_energy:         { icon: Activity,  label: 'Habit',    color: 'text-emerald-400',bg: 'bg-emerald-500/10'},
  spending_pattern:     { icon: BarChart3, label: 'Spending', color: 'text-rose-400',   bg: 'bg-rose-500/10'   },
  default:              { icon: Brain,     label: 'Insight',  color: 'text-primary',    bg: 'bg-primary/10'    },
};

// ── Single insight card ───────────────────────────────────────────────────────
function InsightCard({
  insight,
  onDismiss,
  onRead,
}: {
  insight: AiInsight;
  onDismiss: (id: string) => void;
  onRead: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = TYPE_CONFIG[insight.insight_type] ?? TYPE_CONFIG.default;
  const Icon = cfg.icon;

  const confidencePct = Math.round((insight.confidence_score ?? 0.8) * 100);

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        insight.is_read
          ? 'border-border bg-card/50'
          : 'border-border bg-card shadow-card'
      }`}
      onClick={() => { if (!insight.is_read) onRead(insight.id); }}
    >
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
            <Icon className={`w-5 h-5 ${cfg.color}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                {cfg.label}
              </span>
              {!insight.is_read && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
              {insight.is_premium && (
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
                  Premium
                </span>
              )}
            </div>
            <h3
              className="text-sm font-semibold text-foreground leading-snug"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              {insight.title}
            </h3>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onDismiss(insight.id); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="mt-3 pl-[52px]">
          <p className={`text-sm text-muted-foreground leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
            {insight.description}
          </p>

          {insight.description?.length > 120 && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
              className="text-xs text-primary hover:text-primary/80 mt-1 transition-colors flex items-center gap-1"
            >
              {expanded ? 'Show less' : 'Read more'}
              <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </button>
          )}

          {/* Confidence bar */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/60 rounded-full"
                style={{ width: `${confidencePct}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground flex-shrink-0">
              {confidencePct}% confidence
            </span>
          </div>

          {/* Action suggestion */}
          {insight.action_suggestion && (
            <div className="mt-3 flex items-start gap-2 p-2.5 rounded-xl bg-primary/5 border border-primary/15">
              <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-foreground/80">{insight.action_suggestion}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Locked premium preview card ───────────────────────────────────────────────
function LockedCard({ preview }: { preview: { type: string; title: string; preview: string } }) {
  const cfg  = TYPE_CONFIG[preview.type] ?? TYPE_CONFIG.default;
  const Icon = cfg.icon;

  return (
    <div className="rounded-2xl border border-border bg-card/40 overflow-hidden relative">
      {/* Blur overlay */}
      <div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl"
        style={{ backdropFilter: 'blur(4px)', background: 'hsl(var(--card)/0.7)' }}
      >
        <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center mb-3">
          <Crown className="w-5 h-5 text-amber-400" />
        </div>
        <p className="text-sm font-semibold text-foreground mb-1">Premium Insight</p>
        <Link
          href="/billing"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          Upgrade to unlock <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="p-5 select-none pointer-events-none">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
            <Icon className={`w-5 h-5 ${cfg.color}`} />
          </div>
          <div>
            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
              {cfg.label}
            </span>
            <h3 className="text-sm font-semibold text-foreground mt-1 blur-[2px]">{preview.title}</h3>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-3 pl-[52px] blur-[4px]">{preview.preview}</p>
      </div>
    </div>
  );
}

// ── Data needed empty state ───────────────────────────────────────────────────
function DataNeededState() {
  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
        <BarChart3 className="w-7 h-7 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-foreground mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>
        Building your profile
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
        Log a few workouts, expenses, and habits. Insights appear after 3–7 days of data.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
        {[
          { href: '/fitness/new', label: 'Log workout' },
          { href: '/expenses/new', label: 'Add expense' },
          { href: '/habits', label: 'Track habits' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-xs font-medium px-4 py-2 rounded-xl border border-border hover:bg-muted hover:border-primary/30 transition-all text-foreground"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Usage meter ───────────────────────────────────────────────────────────────
function UsageMeter({ used, limit }: { used: number; limit: number }) {
  const pct = Math.min(100, (used / limit) * 100);
  const full = used >= limit;

  return (
    <div className={`rounded-2xl border px-4 py-3 flex items-center gap-4 ${
      full ? 'border-amber-500/30 bg-amber-500/5' : 'border-border bg-card/50'
    }`}>
      {full ? (
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
      ) : (
        <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-foreground">
            {full ? 'Weekly limit reached' : `${used} of ${limit} insights used`}
          </span>
          <Link href="/billing" className="text-[10px] text-primary hover:underline">
            Upgrade
          </Link>
        </div>
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${full ? 'bg-amber-400' : 'bg-primary'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {!full && (
          <p className="text-[10px] text-muted-foreground mt-1">Resets every Monday</p>
        )}
      </div>
    </div>
  );
}

// ── Sample premium previews ───────────────────────────────────────────────────
const SAMPLES = [
  { type: 'behavior_correlation', title: 'Workout streaks predict 18% savings improvement', preview: 'Weeks with 4+ training sessions show measurably lower impulse spending…' },
  { type: 'energy_spending',      title: 'Low energy days precede spending spikes by 24h',   preview: 'On days you log energy ≤ 2/5, next-day discretionary spend is 2.3× baseline…' },
];

// ── Main component ────────────────────────────────────────────────────────────
interface InsightsContentProps {
  insights: AiInsight[];
  isPremium: boolean;
  weeklyUsed: number;
  hasData: boolean;
  loading?: boolean;
}

export function InsightsContent({ insights, isPremium, weeklyUsed, hasData, loading }: InsightsContentProps) {
  const router   = useRouter();
  const supabase = createClient();
  const LIMIT    = 3;
  const canGen   = isPremium || weeklyUsed < LIMIT;

  const active    = insights.filter(i => !i.is_dismissed);
  const freePart  = active.filter(i => !i.is_premium);
  const premPart  = active.filter(i => i.is_premium);

  async function dismiss(id: string) {
    await supabase.from('ai_insights').update({ is_dismissed: true }).eq('id', id);
    router.refresh();
  }

  async function read(id: string) {
    await supabase.from('ai_insights').update({ is_read: true }).eq('id', id);
  }

  if (loading) return <InsightSkeleton />;

  return (
    <div className="space-y-5 max-w-2xl animate-fade-up">
      {/* Page header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <h1
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              AI Insights
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Patterns discovered across your fitness, expenses, and habits.
          </p>
        </div>
        {hasData && canGen && <GenerateInsightButton />}
      </div>

      {/* Usage meter (free users only) */}
      {!isPremium && (
        <UsageMeter used={weeklyUsed} limit={LIMIT} />
      )}

      {/* No data state */}
      {!hasData && <DataNeededState />}

      {/* Insights feed */}
      {freePart.length > 0 && (
        <div className="space-y-3">
          {freePart.map(insight => (
            <InsightCard key={insight.id} insight={insight} onDismiss={dismiss} onRead={read} />
          ))}
        </div>
      )}

      {/* Premium insights */}
      {premPart.length > 0 && (
        <div className="space-y-3">
          {isPremium ? (
            premPart.map(insight => (
              <InsightCard key={insight.id} insight={insight} onDismiss={dismiss} onRead={read} />
            ))
          ) : (
            SAMPLES.map((sample, i) => (
              <LockedCard key={i} preview={sample} />
            ))
          )}
        </div>
      )}

      {/* Empty + has data */}
      {hasData && active.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <RefreshCw className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-foreground mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            No active insights
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Generate a new insight to discover patterns in your data.
          </p>
          {canGen && <GenerateInsightButton />}
        </div>
      )}

      {/* Premium upsell (free, has data, at limit) */}
      {!isPremium && hasData && weeklyUsed >= LIMIT && (
        <Link
          href="/billing"
          className="flex items-center justify-between rounded-2xl border border-amber-500/25 bg-amber-500/5 px-5 py-4 hover:bg-amber-500/10 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-sm font-semibold text-foreground">Unlimited insights with Premium</p>
              <p className="text-xs text-muted-foreground">Starts from ₦5,000/month</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>
      )}
    </div>
  );
}
