// ============================================================
// AethLife - Pricing & Subscription Constants
// Updated pricing: NGN-primary, multi-currency support
// ============================================================

import type { PricingPlan, Currency } from '@/types';

// Exchange rate multipliers relative to NGN base
export const CURRENCY_RATES: Record<Currency, number> = {
  NGN: 1,
  USD: 0.00065,   // ~₦1 = $0.00065
  EUR: 0.00060,
  GBP: 0.00052,
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  NGN: '₦',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  NGN: 'Nigerian Naira (₦)',
  USD: 'US Dollar ($)',
  EUR: 'Euro (€)',
  GBP: 'British Pound (£)',
};

// Base prices in NGN — source of truth
export const BASE_PRICES_NGN = {
  monthly: 5000,
  annual: 50000,
  lifetime: 45000,
} as const;

// Derived USD equivalents for display (approximate)
export const BASE_PRICES_USD = {
  monthly: 4,
  annual: 40,
  lifetime: 35,
} as const;

// Crypto discount percentage
export const CRYPTO_DISCOUNT_PERCENT = 6;

export function getPriceInCurrency(baseNGN: number, currency: Currency): number {
  if (currency === 'NGN') return baseNGN;
  return Math.round(baseNGN * CURRENCY_RATES[currency] * 100) / 100;
}

export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  if (currency === 'NGN') {
    return `${symbol}${amount.toLocaleString('en-NG')}`;
  }
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: currency === 'USD' ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function applyCryptoDiscount(amount: number): number {
  return Math.round(amount * (1 - CRYPTO_DISCOUNT_PERCENT / 100) * 100) / 100;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    prices: {
      NGN: 5000,
      USD: 4,
      EUR: 3.70,
      GBP: 3.20,
    },
    billing_period: 'per month',
    description: 'Full premium access, billed monthly.',
    features: [
      'Unlimited AI coaching & insights',
      'Advanced behavioral correlations',
      'Unlimited receipt scanning',
      'Advanced budgeting intelligence',
      'Deeper analytics & reports',
      'Enhanced smart notifications',
      'Priority support',
    ],
    is_popular: false,
  },
  {
    id: 'annual',
    name: 'Yearly',
    prices: {
      NGN: 50000,
      USD: 40,
      EUR: 37,
      GBP: 32,
    },
    billing_period: 'per year',
    description: 'Best value — save 2 months vs monthly.',
    features: [
      'Everything in Monthly',
      'Save 2 months vs monthly billing',
      'Annual performance review',
      'Year-in-review AI summary',
      'Priority support',
      'Early access to new features',
    ],
    is_popular: true,
    discount_crypto: 6,
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    prices: {
      NGN: 45000,
      USD: 35,
      EUR: 32,
      GBP: 28,
    },
    billing_period: 'one-time',
    description: 'Pay once. Access forever.',
    features: [
      'Everything in Yearly',
      'Permanent premium access',
      'All future features included',
      'Lifetime data retention',
      'Dedicated support access',
      'Founding member badge',
    ],
    is_popular: false,
  },
];

export const FREE_TIER_LIMITS = {
  ai_insights_per_week: 3,
  receipt_scans_per_month: 5,
  behavioral_correlations: false,
  advanced_analytics: false,
  ai_coaching: false,
  advanced_notifications: false,
} as const;

export const PREMIUM_FEATURES = [
  {
    title: 'Advanced AI Coaching',
    description: 'Personalized recommendations that adapt to your lifestyle patterns.',
    icon: 'Brain',
    free: false,
  },
  {
    title: 'Behavioral Correlations',
    description: 'Understand exactly how your habits, spending, and workouts interact.',
    icon: 'GitBranch',
    free: false,
  },
  {
    title: 'Unlimited Receipt Scanning',
    description: 'Scan every receipt automatically with Groq Vision AI.',
    icon: 'ScanLine',
    free: 'Up to 5/month',
  },
  {
    title: 'Advanced Budgeting Intelligence',
    description: 'Smart allocation that learns from your spending behavior.',
    icon: 'PieChart',
    free: false,
  },
  {
    title: 'Deep Analytics',
    description: 'Full historical data, trend analysis, and performance benchmarks.',
    icon: 'TrendingUp',
    free: 'Basic only',
  },
  {
    title: 'Enhanced Smart Notifications',
    description: 'Proactive alerts based on predicted behavior — not just reminders.',
    icon: 'Bell',
    free: 'Basic reminders',
  },
  {
    title: 'AI Insights',
    description: 'Unlimited cross-system insights connecting all your life metrics.',
    icon: 'Sparkles',
    free: 'Up to 3/week',
  },
  {
    title: 'Priority Support',
    description: 'Direct access to the team when you need help.',
    icon: 'Headphones',
    free: false,
  },
] as const;
