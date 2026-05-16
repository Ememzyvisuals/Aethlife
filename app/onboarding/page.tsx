'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, CheckCircle2, Loader2,
  Brain, Dumbbell, Wallet, Flame, TrendingUp,
  Zap, Shield, BarChart3,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Logo } from '@/components/shared/logo';
import { CURRENCY_SYMBOLS, formatCurrency } from '@/lib/pricing';
import type { Currency } from '@/types';

const TOTAL_STEPS = 6;

const GOALS = [
  { id: 'fitness',  label: 'Improve fitness',         desc: 'Track workouts and build consistency' },
  { id: 'finance',  label: 'Manage money better',      desc: 'Track expenses and hit budget goals' },
  { id: 'habits',   label: 'Build lasting habits',     desc: 'Create routines that actually stick' },
  { id: 'energy',   label: 'Boost energy',             desc: 'Understand what affects how you feel' },
  { id: 'insights', label: 'Understand my patterns',   desc: 'See how my life systems connect' },
  { id: 'all',      label: 'All of the above',         desc: 'I want the complete picture' },
];

const JOIN_REASONS = [
  'I want to control my spending',
  'I want to build better habits',
  'I want to get fitter',
  'I want to understand my behavior',
  'A friend recommended it',
  'I found it online',
];

const FITNESS_GOALS = [
  { id: 'strength',    label: 'Build strength' },
  { id: 'cardio',      label: 'Improve cardio' },
  { id: 'weight_loss', label: 'Lose weight' },
  { id: 'consistency', label: 'Stay consistent' },
  { id: 'flexibility', label: 'Improve flexibility' },
];

const BUDGET_GOALS = [
  { id: 'save',        label: 'Save more money' },
  { id: 'track',       label: 'Know where money goes' },
  { id: 'reduce_debt', label: 'Pay off debt' },
  { id: 'invest',      label: 'Invest regularly' },
  { id: 'emergency',   label: 'Build emergency fund' },
];

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: 'NGN', label: 'Nigerian Naira (₦)' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
];

const INSIGHTS = [
  { tag: 'Behavior', title: 'Workouts predict spending', desc: 'Weeks with 4+ sessions show 18% lower impulse spending.', color: 'text-violet-500', bg: 'bg-violet-500/8', icon: Brain },
  { tag: 'Energy',   title: 'Low energy = high spend',   desc: 'On days energy ≤ 2/5, next-day spending is 2× baseline.', color: 'text-amber-500',  bg: 'bg-amber-500/8',  icon: Zap },
  { tag: 'Streak',   title: '9-day habit streak',        desc: "Your best streak is 9 days. You're 1 day away from beating it.", color: 'text-teal-500', bg: 'bg-teal-500/8', icon: Flame },
];

// ── Right-panel feature visual (desktop only) ─────────────────
function RightPanel({ step }: { step: number }) {
  const [insight, setInsight] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setInsight(i => (i + 1) % INSIGHTS.length), 3200);
    return () => clearInterval(t);
  }, []);
  const cur = INSIGHTS[insight];

  return (
    <div className="hidden lg:flex flex-col justify-center px-12 py-12 bg-muted/20 border-l border-border relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      {/* Feature grid */}
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-6">
          What you get
        </p>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { icon: Dumbbell,  label: 'Fitness',  desc: 'Log workouts, steps, energy', color: 'text-blue-400',   bg: 'bg-blue-500/10' },
            { icon: Wallet,    label: 'Expenses', desc: 'AI receipt scanning + budgets', color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { icon: Flame,     label: 'Habits',   desc: 'Daily streaks + reminders',   color: 'text-orange-400', bg: 'bg-orange-500/10' },
            { icon: Brain,     label: 'AI Insights', desc: 'Cross-domain pattern analysis', color: 'text-primary', bg: 'bg-primary/10' },
          ].map(({ icon: Icon, label, desc, color, bg }) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-4">
              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Rotating insight preview */}
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Sample insight
        </p>
        <AnimatePresence mode="wait">
          <motion.div
            key={insight}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className={`border rounded-2xl p-4 ${cur.bg}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <cur.icon className={`w-3.5 h-3.5 ${cur.color}`} />
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${cur.color}`}>
                {cur.tag}
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">{cur.title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{cur.desc}</p>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-1 mt-3">
          {INSIGHTS.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === insight ? 'w-5 bg-primary' : 'w-1.5 bg-muted-foreground/20'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MultiSelect ────────────────────────────────────────────────
function MultiSelect({ options, selected, onChange }: {
  options: { id: string; label: string; desc?: string }[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter(i => i !== id) : [...selected, id]);
  }
  return (
    <div className="space-y-2">
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => toggle(opt.id)}
          className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${
            selected.includes(opt.id)
              ? 'border-primary bg-primary/8'
              : 'border-border hover:border-primary/30 hover:bg-muted/40'
          }`}
        >
          <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
            selected.includes(opt.id) ? 'border-primary bg-primary' : 'border-muted-foreground/30'
          }`}>
            {selected.includes(opt.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{opt.label}</p>
            {opt.desc && <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>}
          </div>
        </button>
      ))}
    </div>
  );
}

// ── Budget simulator ───────────────────────────────────────────
function BudgetSim({ currency }: { currency: Currency }) {
  const [income, setIncome]   = useState(currency === 'NGN' ? 300000 : 3000);
  const [savePct, setSavePct] = useState(20);
  const fmt = (n: number) => formatCurrency(Math.round(n), currency);
  const slices = [
    { label: 'Savings',   pct: savePct, color: 'bg-primary' },
    { label: 'Housing',   pct: 25,      color: 'bg-blue-500' },
    { label: 'Food',      pct: 28,      color: 'bg-amber-500' },
    { label: 'Transport', pct: 10,      color: 'bg-violet-500' },
  ];
  const used = slices.reduce((s, x) => s + x.pct, 0);

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3 mt-3">
      <p className="text-xs font-semibold text-foreground">Budget simulator</p>
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Monthly income</span>
          <span className="font-medium text-foreground">{fmt(income)}</span>
        </div>
        <input type="range"
          min={currency === 'NGN' ? 50000 : 500}
          max={currency === 'NGN' ? 2000000 : 15000}
          step={currency === 'NGN' ? 10000 : 100}
          value={income}
          onChange={e => setIncome(Number(e.target.value))}
          className="w-full h-1.5 accent-teal-500"
        />
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Savings</span>
          <span className="font-medium text-primary">{savePct}% · {fmt(income * savePct / 100)}</span>
        </div>
        <input type="range" min={5} max={50} step={5} value={savePct}
          onChange={e => setSavePct(Number(e.target.value))}
          className="w-full h-1.5 accent-teal-500"
        />
      </div>
      {slices.map(s => (
        <div key={s.label} className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground w-16 flex-shrink-0">{s.label}</span>
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className={`h-full ${s.color} rounded-full`} style={{ width: `${Math.min(s.pct * 1.8, 100)}%` }} />
          </div>
          <span className="text-[10px] text-foreground w-16 text-right flex-shrink-0">{fmt(income * s.pct / 100)}</span>
        </div>
      ))}
      <p className={`text-[11px] text-center ${used <= 100 ? 'text-primary' : 'text-red-500'}`}>
        {used <= 100
          ? `${fmt(income * (100 - used) / 100)} remaining`
          : 'Over budget — AethLife will alert you'}
      </p>
    </div>
  );
}

const sv = {
  enter: (d: number) => ({ x: d > 0 ? 32 : -32, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (d: number) => ({ x: d > 0 ? -32 : 32, opacity: 0 }),
};

const TITLES = [
  'What are you here for?',
  'Why did you join?',
  "Your AI life OS",
  'Your preferred currency',
  'Fitness goals',
  'Budget goals',
];

const SUBS = [
  'Select all that apply.',
  'This shapes your experience from day one.',
  'AethLife connects your workouts, spending, and habits.',
  'Used for expense tracking and budgeting.',
  'What do you want to achieve physically?',
  'What financial outcomes matter most?',
];

export default function OnboardingPage() {
  const router   = useRouter();
  const supabase = createClient();
  const [step, setStep]       = useState(1);
  const [dir, setDir]         = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [goals, setGoals]                 = useState<string[]>([]);
  const [joinReason, setJoinReason]       = useState('');
  const [currency, setCurrency]           = useState<Currency>('NGN');
  const [fitnessGoals, setFitnessGoals]   = useState<string[]>([]);
  const [budgetGoals, setBudgetGoals]     = useState<string[]>([]);

  function next() { setDir(1);  setStep(s => Math.min(s + 1, TOTAL_STEPS)); }
  function back() { setDir(-1); setStep(s => Math.max(s - 1, 1)); }

  const canProceed = [
    goals.length > 0,
    joinReason.length > 0,
    true,
    !!currency,
    fitnessGoals.length > 0,
    budgetGoals.length > 0,
  ][step - 1];

  async function finish() {
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }

    const [{ error: oe }, { error: pe }] = await Promise.all([
      supabase.from('onboarding_preferences').upsert({
        user_id: user.id, goals, join_reason: joinReason,
        fitness_goals: fitnessGoals, budget_goals: budgetGoals,
        completed_steps: ['goals','reason','preview','currency','fitness','budget'],
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id' }),
      supabase.from('profiles')
        .update({ currency, onboarding_completed: true })
        .eq('user_id', user.id),
    ]);

    if (oe || pe) { toast.error('Setup failed. Please try again.'); setIsSaving(false); return; }
    toast.success('Welcome to AethLife!');
    router.push('/dashboard');
  }

  return (
    // ── Two-column on desktop, single column on mobile ────────
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">

      {/* ── Left: form ──────────────────────────────────────── */}
      <div className="flex flex-col min-h-screen lg:min-h-0">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center px-5 flex-shrink-0">
          <Logo wordmarkSize="sm" />
        </header>

        {/* Step progress */}
        <div className="px-5 sm:px-8 pt-6 pb-4 flex-shrink-0">
          <div className="flex gap-1 mb-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                  i < step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-right">
            Step {step} of {TOTAL_STEPS}
          </p>
        </div>

        {/* Step content — scrollable on mobile */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 pb-6">
          <div className="max-w-md mx-auto lg:max-w-none">
            <AnimatePresence custom={dir} mode="wait">
              <motion.div
                key={step}
                custom={dir}
                variants={sv}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: 'easeInOut' }}
              >
                <div className="mb-6">
                  <h2
                    className="text-xl font-semibold text-foreground mb-1 tracking-tight"
                    style={{ fontFamily: "'Clash Display', sans-serif" }}
                  >
                    {TITLES[step - 1]}
                  </h2>
                  <p className="text-sm text-muted-foreground">{SUBS[step - 1]}</p>
                </div>

                {step === 1 && (
                  <MultiSelect options={GOALS} selected={goals} onChange={setGoals} />
                )}

                {step === 2 && (
                  <div className="space-y-2">
                    {JOIN_REASONS.map(r => (
                      <button
                        key={r}
                        onClick={() => setJoinReason(r)}
                        className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-all ${
                          joinReason === r
                            ? 'border-primary bg-primary/8 text-primary'
                            : 'border-border hover:border-primary/30 text-foreground hover:bg-muted/40'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                    <input
                      value={!JOIN_REASONS.includes(joinReason) ? joinReason : ''}
                      onChange={e => setJoinReason(e.target.value)}
                      placeholder="Something else…"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                )}

                {step === 3 && (
                  /* On mobile show a simple feature list; on desktop the right panel shows the preview */
                  <div className="lg:hidden space-y-3">
                    {[
                      { icon: Dumbbell, label: 'Track workouts, steps, and energy',    color: 'text-blue-400',   bg: 'bg-blue-500/10' },
                      { icon: Wallet,   label: 'Scan receipts and track expenses',     color: 'text-amber-400',  bg: 'bg-amber-500/10' },
                      { icon: Flame,    label: 'Build habits with daily streaks',       color: 'text-orange-400', bg: 'bg-orange-500/10' },
                      { icon: Brain,    label: 'AI reveals patterns across your life', color: 'text-primary',    bg: 'bg-primary/10' },
                    ].map(({ icon: Icon, label, color, bg }) => (
                      <div key={label} className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card">
                        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-4.5 h-4.5 ${color}`} />
                        </div>
                        <p className="text-sm font-medium text-foreground">{label}</p>
                      </div>
                    ))}
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {CURRENCIES.map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => setCurrency(value)}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            currency === value
                              ? 'border-primary bg-primary/8'
                              : 'border-border hover:border-primary/30 hover:bg-muted/40'
                          }`}
                        >
                          <p className="text-base font-bold text-foreground">
                            {CURRENCY_SYMBOLS[value]} {value}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                        </button>
                      ))}
                    </div>
                    <BudgetSim currency={currency} />
                  </div>
                )}

                {step === 5 && (
                  <MultiSelect options={FITNESS_GOALS} selected={fitnessGoals} onChange={setFitnessGoals} />
                )}
                {step === 6 && (
                  <MultiSelect options={BUDGET_GOALS} selected={budgetGoals} onChange={setBudgetGoals} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Nav buttons — pinned to bottom on mobile */}
        <div className="px-5 sm:px-8 py-5 border-t border-border flex-shrink-0 safe-bottom">
          <div className="max-w-md mx-auto lg:max-w-none flex gap-3">
            {step > 1 && (
              <button
                onClick={back}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border hover:bg-muted text-foreground text-sm font-medium transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            {step < TOTAL_STEPS ? (
              <button
                onClick={next}
                disabled={!canProceed}
                className="flex-1 flex items-center justify-center gap-2 gradient-teal text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm hover:brightness-110 active:scale-95"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={finish}
                disabled={!canProceed || isSaving}
                className="flex-1 flex items-center justify-center gap-2 gradient-teal text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm hover:brightness-110 active:scale-95"
              >
                {isSaving
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><CheckCircle2 className="w-4 h-4" /> Enter AethLife</>
                }
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Right: feature panel (desktop only) ──────────────── */}
      <RightPanel step={step} />
    </div>
  );
}
