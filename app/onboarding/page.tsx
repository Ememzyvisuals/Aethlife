'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle2, Loader2, Brain, Dumbbell, Wallet, Flame, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Logo } from '@/components/shared/logo';
import { CURRENCY_SYMBOLS, formatCurrency } from '@/lib/pricing';
import type { Currency } from '@/types';

const TOTAL_STEPS = 6;

const GOALS = [
  { id: 'fitness', label: 'Improve fitness', desc: 'Track workouts and build consistency' },
  { id: 'finance', label: 'Manage money better', desc: 'Track expenses and hit budget goals' },
  { id: 'habits', label: 'Build lasting habits', desc: 'Create routines that actually stick' },
  { id: 'energy', label: 'Boost energy', desc: 'Understand what affects how you feel' },
  { id: 'insights', label: 'Understand my patterns', desc: 'See how my life systems connect' },
  { id: 'all', label: 'All of the above', desc: 'I want the complete picture' },
];

const JOIN_REASONS = [
  'I want to control my spending', 'I want to build better habits',
  'I want to get fitter', 'I want to understand my behavior',
  'A friend recommended it', 'I found it online',
];

const FITNESS_GOALS = [
  { id: 'strength', label: 'Build strength' }, { id: 'cardio', label: 'Improve cardio' },
  { id: 'weight_loss', label: 'Lose weight' }, { id: 'consistency', label: 'Stay consistent' },
  { id: 'flexibility', label: 'Improve flexibility' },
];

const BUDGET_GOALS = [
  { id: 'save', label: 'Save more money' }, { id: 'track', label: 'Know where money goes' },
  { id: 'reduce_debt', label: 'Pay off debt' }, { id: 'invest', label: 'Invest regularly' },
  { id: 'emergency', label: 'Build emergency fund' },
];

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: 'NGN', label: 'Nigerian Naira' },
  { value: 'USD', label: 'US Dollar' },
  { value: 'EUR', label: 'Euro' },
  { value: 'GBP', label: 'British Pound' },
];

// Live dashboard preview shown on Step 3
function LiveDashboardPreview({ currency }: { currency: Currency }) {
  const [insight, setInsight] = useState(0);
  const sym = CURRENCY_SYMBOLS[currency];

  const INSIGHTS = [
    { tag: 'Spending Pattern', title: 'You spend 2.3× more on low-energy days', desc: 'Impulse purchases cluster around days with energy ≤ 2/5.', icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
    { tag: 'Workout Insight', title: 'Workout streaks predict savings spikes', desc: 'Weeks with 4+ sessions show 18% lower discretionary spend.', icon: Dumbbell, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
    { tag: 'AI Correlation', title: 'Habit completion affects budget adherence', desc: 'High habit days correlate with on-budget spending 71% of the time.', icon: Brain, color: 'text-teal-500', bg: 'bg-teal-500/10 border-teal-500/20' },
  ];

  useEffect(() => {
    const t = setInterval(() => setInsight((i) => (i + 1) % INSIGHTS.length), 3200);
    return () => clearInterval(t);
  }, []);

  const cur = INSIGHTS[insight];

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Consistent logo header */}
      <header className="h-14 border-b border-border/50 flex items-center px-5 flex-shrink-0">
        <Logo wordmarkSize="sm" />
      </header>
      <div className="border-b border-border px-4 py-2.5 flex items-center gap-2">
        <div className="w-4 h-4 rounded overflow-hidden">
          <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
            <path d="M8 8 L20 32 L32 8" stroke="url(#tg-prev)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <defs><linearGradient id="tg-prev" x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#2dd4bf"/><stop offset="100%" stopColor="#0d9488"/></linearGradient></defs>
          </svg>
        </div>
        <span className="text-xs font-semibold text-foreground">AethLife Dashboard</span>
        <span className="ml-auto text-[10px] text-teal-500 bg-teal-500/10 px-1.5 py-0.5 rounded-full font-medium">Live preview</span>
      </div>

      <div className="grid grid-cols-4 border-b border-border">
        {[
          { label: 'Workouts', value: '4', icon: Dumbbell, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Spent', value: `${sym}42k`, icon: Wallet, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Streak', value: '12d', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Insights', value: '3', icon: Brain, color: 'text-teal-500', bg: 'bg-teal-500/10' },
        ].map((s) => (
          <div key={s.label} className="p-3 border-r border-border last:border-0 text-center">
            <div className={`w-6 h-6 ${s.bg} rounded-lg flex items-center justify-center mx-auto mb-1`}>
              <s.icon className={`w-3 h-3 ${s.color}`} />
            </div>
            <p className="text-sm font-bold text-foreground">{s.value}</p>
            <p className="text-[9px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">
          <motion.div key={insight} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.28 }}
            className={`border rounded-xl p-3.5 ${cur.bg}`}>
            <div className="flex items-center gap-2 mb-1.5">
              <cur.icon className={`w-3.5 h-3.5 ${cur.color}`} />
              <span className={`text-[10px] font-semibold ${cur.color}`}>{cur.tag}</span>
            </div>
            <p className="text-xs font-semibold text-foreground mb-1">{cur.title}</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{cur.desc}</p>
          </motion.div>
        </AnimatePresence>
        <div className="flex justify-center gap-1 mt-3">
          {INSIGHTS.map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === insight ? 'bg-teal-500' : 'bg-muted-foreground/20'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Interactive budget simulator shown alongside currency step
function BudgetSim({ currency }: { currency: Currency }) {
  const [income, setIncome] = useState(currency === 'NGN' ? 300000 : currency === 'USD' ? 3000 : 2500);
  const [savePct, setSavePct] = useState(20);

  // Convert to display currency
  const rates: Record<Currency, number> = { NGN: 1, USD: 0.00065, EUR: 0.0006, GBP: 0.00052 };
  const baseIncome = currency === 'NGN' ? income : income;
  const fmt = (n: number) => formatCurrency(Math.round(n), currency);

  const slices = [
    { label: 'Savings', pct: savePct, color: 'bg-teal-500' },
    { label: 'Housing', pct: 25, color: 'bg-blue-500' },
    { label: 'Food', pct: 28, color: 'bg-amber-500' },
    { label: 'Transport', pct: 10, color: 'bg-violet-500' },
  ];
  const used = slices.reduce((s, x) => s + x.pct, 0);

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-foreground">Budget simulator</p>
        <span className="text-[10px] text-teal-500">Drag to adjust</span>
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Monthly income</span>
          <span className="font-medium text-foreground">{fmt(income)}</span>
        </div>
        <input type="range" min={currency === 'NGN' ? 50000 : 500} max={currency === 'NGN' ? 2000000 : 15000}
          step={currency === 'NGN' ? 10000 : 100} value={income}
          onChange={(e) => setIncome(Number(e.target.value))} className="w-full accent-teal-500 h-1" />
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Savings target</span>
          <span className="font-medium text-teal-500">{savePct}% · {fmt(income * savePct / 100)}</span>
        </div>
        <input type="range" min={5} max={50} step={5} value={savePct}
          onChange={(e) => setSavePct(Number(e.target.value))} className="w-full accent-teal-500 h-1" />
      </div>

      <div className="space-y-1.5">
        {slices.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground w-16">{s.label}</span>
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
              <div className={`h-full ${s.color} rounded-full transition-all`} style={{ width: `${s.pct * 1.8}%` }} />
            </div>
            <span className="text-[10px] text-foreground w-16 text-right">{fmt(income * s.pct / 100)}</span>
          </div>
        ))}
      </div>

      {used <= 100 ? (
        <p className="text-[11px] text-teal-500 text-center">{fmt(income * (100 - used) / 100)} available for other spending</p>
      ) : (
        <p className="text-[11px] text-rose-500 text-center">Over budget — AethLife will warn you automatically</p>
      )}
    </div>
  );
}

function MultiSelect({ options, selected, onChange }: {
  options: { id: string; label: string; desc?: string }[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((i) => i !== id) : [...selected, id]);
  }
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <button key={opt.id} onClick={() => toggle(opt.id)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
            selected.includes(opt.id) ? 'border-teal-500 bg-teal-500/8' : 'border-border hover:border-teal-500/30'
          }`}>
          <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
            selected.includes(opt.id) ? 'border-teal-500 bg-teal-500' : 'border-muted-foreground/30'
          }`}>
            {selected.includes(opt.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{opt.label}</p>
            {opt.desc && <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>}
          </div>
        </button>
      ))}
    </div>
  );
}

const sv = {
  enter: (d: number) => ({ x: d > 0 ? 36 : -36, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -36 : 36, opacity: 0 }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const [goals, setGoals] = useState<string[]>([]);
  const [joinReason, setJoinReason] = useState('');
  const [currency, setCurrency] = useState<Currency>('NGN');
  const [fitnessGoals, setFitnessGoals] = useState<string[]>([]);
  const [budgetGoals, setBudgetGoals] = useState<string[]>([]);

  function next() { setDir(1); setStep((s) => Math.min(s + 1, TOTAL_STEPS)); }
  function back() { setDir(-1); setStep((s) => Math.max(s - 1, 1)); }

  const canProceed = [goals.length > 0, joinReason.length > 0, true, !!currency, fitnessGoals.length > 0, budgetGoals.length > 0][step - 1];

  async function finish() {
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }

    const [{ error: pe }, { error: prE }] = await Promise.all([
      supabase.from('onboarding_preferences').upsert({
        user_id: user.id, goals, join_reason: joinReason,
        fitness_goals: fitnessGoals, budget_goals: budgetGoals,
        completed_steps: ['goals', 'reason', 'preview', 'currency', 'fitness', 'budget'],
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id' }),
      supabase.from('profiles').update({ currency, onboarding_completed: true }).eq('user_id', user.id),
    ]);

    if (pe || prE) { toast.error('Setup failed. Please try again.'); setIsSaving(false); return; }
    toast.success('Setup complete! Welcome to AethLife.');
    router.push('/dashboard');
  }

  const titles = ["What are you here for?", "Why did you join?", "Here's your life OS", "Your preferred currency", "Fitness goals", "Budget goals"];
  const subs = ["Select all that apply.", "This shapes your experience from day one.", "This is what AethLife learns about you. AI insights rotate every few seconds.", "Used for expense tracking and budgeting.", "What do you want to achieve physically?", "What financial outcomes matter most?"];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-xl overflow-hidden">
          <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
            <path d="M8 8 L20 32 L32 8" stroke="url(#tg-on)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <defs><linearGradient id="tg-on" x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#2dd4bf"/><stop offset="100%" stopColor="#0d9488"/></linearGradient></defs>
          </svg>
        </div>
        <span className="font-sans font-semibold text-foreground">AethLife</span>
      </div>

      <div className="w-full max-w-md mb-5">
        <div className="flex gap-1 mb-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-400 ${i < step ? 'bg-teal-500' : 'bg-muted'}`} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-right">{step} / {TOTAL_STEPS}</p>
      </div>

      <div className="w-full max-w-md overflow-hidden">
        <AnimatePresence custom={dir} mode="wait">
          <motion.div key={step} custom={dir} variants={sv} initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.22, ease: 'easeInOut' }}>
            <div className="mb-5">
              <h2 className="font-sans text-xl font-semibold text-foreground mb-1">{titles[step - 1]}</h2>
              <p className="text-sm text-muted-foreground">{subs[step - 1]}</p>
            </div>

            {step === 1 && <MultiSelect options={GOALS} selected={goals} onChange={setGoals} />}

            {step === 2 && (
              <div className="space-y-2">
                {JOIN_REASONS.map((r) => (
                  <button key={r} onClick={() => setJoinReason(r)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      joinReason === r ? 'border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400' : 'border-border hover:border-teal-500/30 text-foreground'
                    }`}>{r}
                  </button>
                ))}
                <input value={!JOIN_REASONS.includes(joinReason) ? joinReason : ''} onChange={(e) => setJoinReason(e.target.value)} className="flex-1 px-3 py-2 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" 
                  placeholder="Something else..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all" />
              </div>
            )}

            {step === 3 && <LiveDashboardPreview currency={currency} />}

            {step === 4 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {CURRENCIES.map(({ value, label }) => (
                    <button key={value} onClick={() => setCurrency(value)}
                      className={`p-4 rounded-xl border text-left transition-all ${currency === value ? 'border-teal-500 bg-teal-500/10' : 'border-border hover:border-teal-500/30'}`}>
                      <p className="text-base font-bold text-foreground">{CURRENCY_SYMBOLS[value]} {value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                    </button>
                  ))}
                </div>
                <BudgetSim currency={currency} />
              </div>
            )}

            {step === 5 && <MultiSelect options={FITNESS_GOALS} selected={fitnessGoals} onChange={setFitnessGoals} />}
            {step === 6 && <MultiSelect options={BUDGET_GOALS} selected={budgetGoals} onChange={setBudgetGoals} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full max-w-md mt-6 flex gap-3">
        {step > 1 && (
          <button onClick={back} className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border hover:bg-muted text-foreground text-sm font-medium transition-all">
            <ArrowLeft className="w-4 h-4" />Back
          </button>
        )}
        {step < TOTAL_STEPS ? (
          <button onClick={next} disabled={!canProceed} className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed" 
            className="flex-1 flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-40 text-sm">
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={finish} disabled={!canProceed || isSaving} className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed" 
            className="flex-1 flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-40 text-sm">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (<><CheckCircle2 className="w-4 h-4" />Enter AethLife</>)}
          </button>
        )}
      </div>
    </div>
  );
}
