import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export interface PremiumGuardResult {
  allowed: boolean;
  isPremium: boolean;
  isLifetime: boolean;
  tier: 'free' | 'premium';
  reason?: string;
}

/**
 * AUTHORITATIVE server-side premium check.
 * This is the single source of truth for subscription status.
 * Never trust client-side subscription data for access control.
 */
export async function serverPremiumGuard(userId: string): Promise<PremiumGuardResult> {
  const supabase = await createClient();

  // Always re-query fresh from DB — never trust cached/client state
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status, subscription_expires_at')
    .eq('user_id', userId)
    .single();

  if (error || !profile) {
    return { allowed: false, isPremium: false, isLifetime: false, tier: 'free', reason: 'profile_not_found' };
  }

  // Lifetime check — separate query, tamper-proof
  const { data: lifetimeSub } = await supabase
    .from('subscriptions')
    .select('id, status')
    .eq('user_id', userId)
    .eq('is_lifetime', true)
    .eq('status', 'active')
    .maybeSingle();

  const isLifetime = !!lifetimeSub;

  // Auto-expire check for time-limited subs
  if (profile.subscription_expires_at && !isLifetime) {
    const expiresAt = new Date(profile.subscription_expires_at);
    if (expiresAt < new Date()) {
      // Atomically expire in DB
      await supabase
        .from('profiles')
        .update({ subscription_tier: 'free', subscription_status: 'expired' })
        .eq('user_id', userId);

      return { allowed: false, isPremium: false, isLifetime: false, tier: 'free', reason: 'subscription_expired' };
    }
  }

  const isPremium =
    (profile.subscription_tier === 'premium' && profile.subscription_status === 'active') || isLifetime;

  return {
    allowed: isPremium,
    isPremium,
    isLifetime,
    tier: isPremium ? 'premium' : 'free',
  };
}

/**
 * Rate limiter using Supabase — free tier safe.
 * Uses a simple count-based approach per user per time window.
 */
export async function checkRateLimit(
  userId: string,
  action: string,
  maxCount: number,
  windowHours: number
): Promise<{ allowed: boolean; remaining: number }> {
  const supabase = await createClient();
  const windowStart = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();

  const table =
    action === 'receipt_scan' ? 'expenses'
    : action === 'ai_insight' ? 'ai_insights'
    : null;

  if (!table) return { allowed: true, remaining: maxCount };

  const whereColumn = action === 'receipt_scan' ? 'ai_scanned' : null;

  let query = supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', windowStart);

  if (whereColumn) {
    query = query.eq(whereColumn, true);
  }

  const { count } = await query;
  const used = count ?? 0;
  const remaining = Math.max(0, maxCount - used);

  return { allowed: used < maxCount, remaining };
}

/**
 * Returns a standardized 403 JSON response for premium-gated API routes.
 */
export function premiumRequired(feature: string) {
  return NextResponse.json(
    {
      error: 'premium_required',
      message: `${feature} requires a AethLife Premium subscription.`,
      upgrade_url: '/billing',
    },
    { status: 403 }
  );
}

/**
 * Returns a standardized 429 JSON response for rate-limited routes.
 */
export function rateLimitExceeded(feature: string, resetHours: number) {
  return NextResponse.json(
    {
      error: 'rate_limit_exceeded',
      message: `Free tier limit reached for ${feature}. Resets in ${resetHours}h or upgrade to Premium.`,
      upgrade_url: '/billing',
    },
    { status: 429 }
  );
}
