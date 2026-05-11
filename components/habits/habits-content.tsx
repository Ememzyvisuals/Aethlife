'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Flame, CheckCircle2, Circle, Trophy, X, Loader2,
  Droplets, BookOpen, Dumbbell, Brain, Heart, Footprints,
  Sun, Moon, Coffee, Pencil, Target, Apple,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { Habit } from '@/types';

// ── Icon map (Lucide only — no emoji) ────────────────────────────────────────
const HABIT_ICONS = [
  { key: 'target',    Icon: Target },
  { key: 'dumbbell', Icon: Dumbbell },
  { key: 'book',     Icon: BookOpen },
  { key: 'brain',    Icon: Brain },
  { key: 'heart',    Icon: Heart },
  { key: 'water',    Icon: Droplets },
  { key: 'apple',    Icon: Apple },
  { key: 'sleep',    Icon: Moon },
  { key: 'write',    Icon: Pencil },
  { key: 'steps',    Icon: Footprints },
  { key: 'sun',      Icon: Sun },
  { key: 'coffee',   Icon: Coffee },
];

const HABIT_COLORS = [
  '#14b8a6', '#3b82f6', '#8b5cf6', '#f59e0b',
  '#ef4444', '#10b981', '#f97316', '#ec4899',
];

function getIconComponent(key: string) {
  return HABIT_ICONS.find(h => h.key === key)?.Icon ?? Target;
}

// ── Suggested starter habits ──────────────────────────────────────────────────
const SUGGESTED = [
  { name: 'Drink 8 glasses of water', icon: 'water', color: '#3b82f6', desc: 'Daily hydration' },
  { name: 'Exercise for 20 minutes', icon: 'dumbbell', color: '#10b981', desc: 'Move your body' },
  { name: 'Read for 15 minutes', icon: 'book', color: '#8b5cf6', desc: 'Learn something daily' },
  { name: 'Walk 5,000 steps', icon: 'steps', color: '#f59e0b', desc: 'Light daily activity' },
  { name: 'Sleep before 11 PM', icon: 'sleep', color: '#6366f1', desc: 'Protect your rest' },
];

// ── Skeleton ──────────────────────────────────────────────────────────────────
function HabitsSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-16 bg-muted rounded-2xl" />
      <div className="space-y-2.5">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-[72px] bg-muted rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// ── Progress ring ─────────────────────────────────────────────────────────────
function ProgressRing({ done, total }: { done: number; total: number }) {
  const pct    = total > 0 ? done / total : 0;
  const radius = 20;
  const circ   = 2 * Math.PI * radius;
  const offset = circ * (1 - pct);
  const allDone = done === total && total > 0;

  return (
    <div className={`relative flex items-center gap-4 rounded-2xl p-4 border transition-colors ${
      allDone ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
    }`}>
      <svg width="52" height="52" viewBox="0 0 52 52" className="flex-shrink-0 -rotate-90">
        <circle cx="26" cy="26" r={radius} fill="none" strokeWidth="4" className="stroke-muted" />
        <circle
          cx="26" cy="26" r={radius} fill="none" strokeWidth="4"
          stroke="#14b8a6"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-foreground" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            Today's Progress
          </p>
          {allDone && <Trophy className="w-4 h-4 text-amber-400" />}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          {done} of {total} habits · {Math.round(pct * 100)}%
          {allDone && ' — Great job!'}
        </p>
      </div>
    </div>
  );
}

// ── Habit row ─────────────────────────────────────────────────────────────────
function HabitRow({ habit, completed, onToggle }: {
  habit: Habit;
  completed: boolean;
  onToggle: () => void;
}) {
  const Icon = getIconComponent(habit.icon);

  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-150 ${
      completed ? 'border-border/50 bg-card/40 opacity-70' : 'border-border bg-card hover:border-primary/20'
    }`}>
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className="flex-shrink-0 press"
        aria-label={completed ? 'Unmark habit' : 'Complete habit'}
      >
        {completed
          ? <CheckCircle2 className="w-6 h-6 text-primary" />
          : <Circle className="w-6 h-6 text-muted-foreground/40 hover:text-primary transition-colors" />
        }
      </button>

      {/* Icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${habit.color}18` }}
      >
        <Icon className="w-4.5 h-4.5" style={{ color: habit.color }} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {habit.name}
        </p>
        {habit.description && (
          <p className="text-xs text-muted-foreground truncate">{habit.description}</p>
        )}
      </div>

      {/* Streak */}
      {habit.streak_count > 0 && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/10 flex-shrink-0">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-xs font-bold text-orange-500">{habit.streak_count}</span>
        </div>
      )}
    </div>
  );
}

// ── Empty state with suggestions ──────────────────────────────────────────────
function EmptyState({ onCreate }: { onCreate: (name: string, icon: string, color: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-dashed border-border p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <Target className="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>
          No habits yet
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Small daily habits compound into big results. Start with just one.
        </p>
      </div>

      {/* Suggested habits */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Popular starters
        </p>
        <div className="space-y-2">
          {SUGGESTED.map(s => {
            const Icon = getIconComponent(s.icon);
            return (
              <button
                key={s.name}
                onClick={() => onCreate(s.name, s.icon, s.color)}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-border hover:border-primary/30 hover:bg-muted/40 transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${s.color}18` }}>
                  <Icon className="w-4.5 h-4.5" style={{ color: s.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
                <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Create habit modal ────────────────────────────────────────────────────────
function CreateModal({
  prefillName, prefillIcon, prefillColor,
  onClose, onCreated,
}: {
  prefillName?: string; prefillIcon?: string; prefillColor?: string;
  onClose: () => void; onCreated: () => void;
}) {
  const supabase = createClient();
  const [name, setName]   = useState(prefillName ?? '');
  const [desc, setDesc]   = useState('');
  const [icon, setIcon]   = useState(prefillIcon ?? 'target');
  const [color, setColor] = useState(prefillColor ?? '#14b8a6');
  const [loading, setLoading] = useState(false);

  async function create() {
    if (!name.trim()) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('habits').insert({
      user_id: user.id,
      name: name.trim(),
      description: desc.trim() || null,
      icon,
      color,
      frequency: 'daily',
      frequency_days: [1,2,3,4,5,6,7],
      target_count: 1,
    });

    setLoading(false);
    if (error) { toast.error('Failed to create habit'); return; }
    toast.success('Habit created!');
    onCreated();
  }

  const SelectedIcon = getIconComponent(icon);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
    >
      <div className="bg-card border border-border rounded-3xl w-full max-w-md shadow-float animate-slide-up">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border/50">
          <h3 className="font-semibold text-foreground" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            New Habit
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Name *</label>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Morning workout"
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Description (optional)</label>
            <input
              value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="Why does this matter to you?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          {/* Icon picker */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {HABIT_ICONS.map(({ key, Icon }) => (
                <button
                  key={key}
                  onClick={() => setIcon(key)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all press ${
                    icon === key
                      ? 'bg-primary/20 border-2 border-primary text-primary'
                      : 'bg-muted border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {HABIT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform press ${
                    color === c ? 'scale-125 ring-2 ring-offset-2 ring-offset-card' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c, ...(color === c ? { ringColor: c } : {}) }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-border p-3 flex items-center gap-3 bg-muted/30">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
              <SelectedIcon className="w-4.5 h-4.5" style={{ color }} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{name || 'Habit name'}</p>
              <p className="text-xs text-muted-foreground">Daily · streak 0</p>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-border/50 flex gap-3">
          <button onClick={onClose} className="flex-1 btn-ghost py-3 text-sm">Cancel</button>
          <button
            onClick={create}
            disabled={!name.trim() || loading}
            className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create habit'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface Props {
  habits: Habit[];
  completedTodayIds: Set<string>;
  today: string;
}

export function HabitsContent({ habits, completedTodayIds, today }: Props) {
  const router   = useRouter();
  const supabase = createClient();
  const [, startT] = useTransition();
  const [completed, setCompleted]       = useState<Set<string>>(completedTodayIds);
  const [modal, setModal]               = useState(false);
  const [prefill, setPrefill]           = useState<{ name: string; icon: string; color: string } | null>(null);

  async function toggle(habitId: string) {
    const wasDone = completed.has(habitId);
    setCompleted(prev => {
      const next = new Set(prev);
      wasDone ? next.delete(habitId) : next.add(habitId);
      return next;
    });

    if (wasDone) {
      const { error } = await supabase.from('habit_logs').delete().eq('habit_id', habitId).eq('date', today);
      if (error) { setCompleted(completedTodayIds); toast.error('Could not update habit'); }
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('habit_logs').upsert(
        { habit_id: habitId, user_id: user!.id, date: today, count: 1 },
        { onConflict: 'habit_id,date' }
      );
      if (error) { setCompleted(completedTodayIds); toast.error('Could not mark habit'); }
      else toast.success('Habit done!', { duration: 1500 });
    }
    startT(() => router.refresh());
  }

  function openWithPrefill(name: string, icon: string, color: string) {
    setPrefill({ name, icon, color });
    setModal(true);
  }

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Habits</h1>
          <p className="page-subtitle">{completed.size}/{habits.length} completed today</p>
        </div>
        <button
          onClick={() => { setPrefill(null); setModal(true); }}
          className="btn-primary flex items-center gap-2 py-2.5 px-4 text-sm"
        >
          <Plus className="w-4 h-4" /> New habit
        </button>
      </div>

      {/* Progress — only if has habits */}
      {habits.length > 0 && (
        <ProgressRing done={completed.size} total={habits.length} />
      )}

      {/* Habit list or empty state */}
      {habits.length === 0 ? (
        <EmptyState onCreate={openWithPrefill} />
      ) : (
        <div className="space-y-2">
          {habits.map(habit => (
            <HabitRow
              key={habit.id}
              habit={habit}
              completed={completed.has(habit.id)}
              onToggle={() => toggle(habit.id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <CreateModal
          prefillName={prefill?.name}
          prefillIcon={prefill?.icon}
          prefillColor={prefill?.color}
          onClose={() => { setModal(false); setPrefill(null); }}
          onCreated={() => { setModal(false); setPrefill(null); router.refresh(); }}
        />
      )}
    </div>
  );
}
