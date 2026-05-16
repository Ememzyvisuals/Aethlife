'use client';

/**
 * AethLife — Premium Billing Page
 * - Plan selection with crypto payment via NOWPayments
 * - Promo code redemption (fixed: uses router.refresh() after success)
 * - Skeleton loading states
 */

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Crown, CheckCircle2, Zap, Infinity, Shield, ArrowRight,
  Tag, Loader2, Star, ChevronRight, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { PRICING_PLANS, CRYPTO_DISCOUNT_PERCENT } from '@/lib/pricing';

// ── Skeleton ──────────────────────────────────────────────────────────────────
function BillingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 bg-muted rounded-2xl w-48" />
      <div className="h-4 bg-muted rounded-xl w-72" />
      <div className="grid gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-36 bg-muted rounded-2xl" />
        ))}
      </div>
      <div className="h-14 bg-muted rounded-2xl" />
    </div>
  );
}

// ── Promo Code Block ──────────────────────────────────────────────────────────
function PromoCodeBlock({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode]       = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);

  async function redeem() {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res  = await fetch('/api/payments/redeem-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? 'Invalid promo code');
        return;
      }
      toast.success('Promo code applied! Premium activated.');
      setCode('');
      setOpen(false);
      // FIXED: call onSuccess to trigger router.refresh() from parent
      onSuccess();
    } catch {
      toast.error('Could not apply promo code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2.5 text-sm font-medium text-foreground">
          <Tag className="w-4 h-4 text-primary" />
          Have a promo code?
        </div>
        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-border/50 pt-3">
          <div className="flex gap-2">
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && redeem()}
              placeholder="ENTER CODE"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm font-mono tracking-widest placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all uppercase"
              maxLength={30}
            />
            <button
              onClick={redeem}
              disabled={loading || !code.trim()}
              className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Promo codes grant immediate premium access — no payment needed.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Plan Card ─────────────────────────────────────────────────────────────────
const PLAN_META = {
  monthly: {
    icon: Zap,
    label: 'Monthly',
    badge: null,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    description: 'Perfect for trying premium',
    perks: ['Unlimited AI insights', 'Unlimited receipt scanning', 'Advanced analytics', 'Priority support'],
  },
  annual: {
    icon: Star,
    label: 'Annual',
    badge: 'Best Value',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    description: 'Save vs monthly — most popular',
    perks: ['Everything in Monthly', '2 months free', 'Early access to features', 'Export data as CSV'],
  },
  lifetime: {
    icon: Infinity,
    label: 'Lifetime',
    badge: 'Forever',
    color: 'text-primary',
    bg: 'bg-primary/10',
    description: 'Pay once, own it forever',
    perks: ['Everything in Annual', 'All future features', 'No recurring payments', 'Lifetime support'],
  },
};

function PlanCard({
  plan,
  selected,
  onSelect,
  loading,
}: {
  plan: typeof PRICING_PLANS[0];
  selected: boolean;
  onSelect: () => void;
  loading: boolean;
}) {
  const meta  = PLAN_META[plan.id as keyof typeof PLAN_META];
  const Icon  = meta.icon;
  const usd   = plan.prices['USD'];
  const ngn   = plan.prices['NGN'];

  return (
    <button
      onClick={onSelect}
      disabled={loading}
      className={`w-full text-left rounded-2xl border p-5 transition-all duration-200 ${
        selected
          ? 'border-primary bg-primary/5 shadow-[0_0_0_1px_hsl(var(--primary)/0.3)]'
          : 'border-border hover:border-primary/30 hover:bg-muted/40'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
            <Icon className={`w-5 h-5 ${meta.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-foreground" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                {meta.label}
              </span>
              {meta.badge && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary uppercase tracking-wider">
                  {meta.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{meta.description}</p>

            <div className="mt-3 space-y-1.5">
              {meta.perks.map(perk => (
                <div key={perk} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">{perk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="text-xl font-bold text-foreground" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            ₦{ngn.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">${usd} USD</div>
          {plan.id !== 'lifetime' && (
            <div className="text-[10px] text-muted-foreground/60 mt-0.5">
              {plan.id === 'monthly' ? '/month' : '/year'}
            </div>
          )}
          {selected && (
            <div className="mt-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center ml-auto">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Main content ──────────────────────────────────────────────────────────────
function BillingContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const paymentOk    = searchParams.get('payment') === 'success';

  const [selected, setSelected] = useState<string>('lifetime');
  const [loading,  setLoading]  = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res  = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selected }),
      });
      const data = await res.json();

      if (!res.ok) {
        // Error — reset loading so user can try again
        toast.error(data.error ?? 'Could not initiate payment. Please try again.');
        setLoading(false);
        return;
      }

      if (!data.checkoutUrl) {
        toast.error('No payment URL received. Please try again.');
        setLoading(false);
        return;
      }

      // SUCCESS — show toast then redirect
      // Do NOT call setLoading(false) here — keep spinner showing during redirect
      // Calling it would trigger a React re-render that can cancel window.location navigation
      toast.success('Redirecting to payment page…');
      setTimeout(() => {
        window.location.href = data.checkoutUrl;
      }, 600);

    } catch {
      toast.error('Network error. Please check your connection and try again.');
      setLoading(false);
    }
    // No finally block — intentional. Loading stays true while redirecting.
  }

  function handlePromoSuccess() {
    router.refresh(); // FIXED: refreshes server data to pick up new premium status
    router.push('/dashboard');
  }

  const selectedPlan = PRICING_PLANS.find(p => p.id === selected);
  const discountedUSD = selectedPlan ? parseFloat((selectedPlan.prices['USD'] * 0.94).toFixed(2)) : 0;
  const discountedNGN = selectedPlan ? Math.round(selectedPlan.prices['NGN'] * 0.94) : 0;

  if (paymentOk) {
    return (
      <div className="max-w-md mx-auto text-center py-16 animate-fade-up">
        <div className="w-20 h-20 rounded-3xl gradient-teal flex items-center justify-center mx-auto mb-6 shadow-glow-teal">
          <Crown className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>
          You're Premium
        </h1>
        <p className="text-muted-foreground mb-8">
          Payment received. Premium is now active on your account.
        </p>
        <button
          onClick={() => { router.push('/dashboard'); router.refresh(); }}
          className="btn-primary px-8"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Crown className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            Go Premium
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Unlock unlimited insights, receipt scanning, and advanced analytics.
          Pay with crypto — get {CRYPTO_DISCOUNT_PERCENT}% off.
        </p>
      </div>

      {/* Crypto discount banner */}
      <div className="flex items-center gap-3 rounded-2xl bg-primary/8 border border-primary/20 px-4 py-3">
        <div className="w-8 h-8 rounded-xl gradient-teal flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {CRYPTO_DISCOUNT_PERCENT}% crypto discount automatically applied
          </p>
          <p className="text-xs text-muted-foreground">
            Pay securely with BTC, ETH, USDT, and 50+ cryptocurrencies
          </p>
        </div>
      </div>

      {/* Plan cards */}
      <div className="space-y-3">
        {PRICING_PLANS.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            selected={selected === plan.id}
            onSelect={() => setSelected(plan.id)}
            loading={loading}
          />
        ))}
      </div>

      {/* Checkout CTA */}
      {selectedPlan && (
        <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {PLAN_META[selected as keyof typeof PLAN_META]?.label} plan
              </p>
              <p className="text-xs text-muted-foreground">
                After {CRYPTO_DISCOUNT_PERCENT}% crypto discount
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-foreground" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                ₦{discountedNGN.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">${discountedUSD} USD</p>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Connecting to payment…</>
            ) : (
              <>Pay with Crypto <ArrowRight className="w-4 h-4" /></>
            )}
          </button>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            You will be redirected to a secure crypto payment page. Return here after completing payment.
          </div>
        </div>
      )}

      {/* Promo code — FIXED state refresh */}
      <PromoCodeBlock onSuccess={handlePromoSuccess} />

      {/* Trust signals */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Shield, label: 'Secure', sub: 'End-to-end encrypted' },
          { icon: CheckCircle2, label: 'Instant', sub: 'Access in minutes' },
          { icon: Crown, label: 'Permanent', sub: 'Lifetime never expires' },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="text-center p-3 rounded-2xl bg-muted/40 border border-border/50">
            <Icon className="w-4 h-4 text-primary mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-foreground">{label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page export ───────────────────────────────────────────────────────────────
export default function BillingPage() {
  return (
    <Suspense fallback={<BillingSkeleton />}>
      <BillingContent />
    </Suspense>
  );
}
