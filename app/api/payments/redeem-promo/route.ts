import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkIPRateLimit, rateLimitResponse } from '@/lib/utils/rate-limit';

/**
 * AethLife Promo Code System
 *
 * How it works:
 * 1. Add PROMO_CODE=YOUR_SECRET_CODE to .env
 * 2. Add PROMO_CODE_EXPIRES=2025-12-31T23:59:59Z to .env (ISO date)
 * 3. Any user who enters that code gets Lifetime Premium instantly
 * 4. Remove the env vars to invalidate the code permanently
 * 5. Change the code value to create a new valid code
 *
 * Security:
 * - Code is never stored in the database (only in env)
 * - Rate limited to 5 attempts per IP per hour
 * - Expiry enforced server-side
 * - Timing-safe comparison to prevent brute force
 */

import crypto from 'crypto';

function timingSafeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a.toLowerCase().trim());
    const bufB = Buffer.from(b.toLowerCase().trim());
    if (bufA.length !== bufB.length) {
      // Still do the compare to prevent timing attacks via length
      crypto.timingSafeEqual(bufA, bufA);
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: max 5 promo attempts per IP per hour
    const { allowed, resetAt } = await checkIPRateLimit(request, 'promo_code', 5, 60);
    if (!allowed) return rateLimitResponse(resetAt);

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Please sign in to use a promo code.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Enter a valid promo code.' }, { status: 400 });
    }

    // Read promo code from environment
    const validCode = process.env.PROMO_CODE;
    const expiresAt = process.env.PROMO_CODE_EXPIRES;

    // No promo code configured → always invalid
    if (!validCode || validCode.trim() === '') {
      return NextResponse.json({ error: 'This promo code is invalid or has expired.' }, { status: 400 });
    }

    // Check expiry
    if (expiresAt) {
      const expiryDate = new Date(expiresAt);
      if (isNaN(expiryDate.getTime()) || expiryDate < new Date()) {
        return NextResponse.json({ error: 'This promo code has expired.' }, { status: 400 });
      }
    }

    // Timing-safe code comparison
    const isValid = timingSafeCompare(code, validCode);
    if (!isValid) {
      // Small delay to further slow brute force
      await new Promise((r) => setTimeout(r, 300 + Math.random() * 200));
      return NextResponse.json({ error: 'This promo code is invalid or has expired.' }, { status: 400 });
    }

    // Check if this user already used a promo code
    const { data: existingPromo } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('payment_provider', 'promo')
      .maybeSingle();

    if (existingPromo) {
      return NextResponse.json({ error: 'You have already used a promo code on this account.' }, { status: 409 });
    }

    // Grant Lifetime Premium
    const now = new Date().toISOString();

    const [{ error: subError }, { error: profileError }] = await Promise.all([
      supabase.from('subscriptions').insert({
        user_id: user.id,
        plan: 'lifetime',
        status: 'active',
        payment_provider: 'promo',
        payment_reference: `PROMO-${Date.now()}`,
        currency: 'NGN',
        amount_paid: 0,
        is_lifetime: true,
        expires_at: null,
        started_at: now,
      }),
      supabase.from('profiles').update({
        subscription_tier: 'premium',
        subscription_status: 'active',
        subscription_expires_at: null,
      }).eq('user_id', user.id),
    ]);

    if (subError || profileError) {
      console.error('[AethLife] Promo grant error:', subError ?? profileError);
      return NextResponse.json({ error: 'Failed to activate promo. Please try again.' }, { status: 500 });
    }

    // Track analytics
    supabase.from('analytics_events').insert({
      user_id: user.id,
      event: 'premium_activated',
      properties: { method: 'promo_code', plan: 'lifetime' },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Promo code accepted. Lifetime Premium is now active on your account.',
      plan: 'lifetime',
    });

  } catch (error) {
    console.error('[AethLife] Promo code error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
