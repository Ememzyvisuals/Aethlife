import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PRICING_PLANS } from '@/lib/pricing';
import { BRAND } from '@/lib/brand';
import { checkIPRateLimit, rateLimitResponse } from '@/lib/utils/rate-limit';
import type { SubscriptionPlan } from '@/types';

/**
 * AethLife — NOWPayments Invoice Creation (FIXED)
 *
 * FIXED ISSUES:
 * 1. Removed pay_currency — was invalid format, causing 422 rejection
 * 2. Removed is_fixed_rate & is_fee_paid_by_user — not valid invoice fields
 * 3. Now logs the exact NOWPayments error so it's visible in Vercel logs
 * 4. Let user choose their crypto on NOWPayments page (better UX)
 *
 * NOWPayments invoice endpoint:
 *   POST https://api.nowpayments.io/v1/invoice
 *   Header: x-api-key: YOUR_API_KEY
 *   Required: price_amount, price_currency
 *   Optional: ipn_callback_url, success_url, cancel_url, order_id, order_description
 */

const NOWPAYMENTS_API = 'https://api.nowpayments.io/v1';

export async function POST(request: NextRequest) {
  const { allowed, resetAt } = await checkIPRateLimit(request, 'checkout', 10, 60);
  if (!allowed) return rateLimitResponse(resetAt);

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });
    }

    let body: { plan?: unknown };
    try { body = await request.json(); }
    catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }

    const { plan: rawPlan } = body;
    const validPlans: SubscriptionPlan[] = ['monthly', 'annual', 'lifetime'];
    if (!rawPlan || !validPlans.includes(rawPlan as SubscriptionPlan)) {
      return NextResponse.json({ error: 'Select a valid plan.' }, { status: 400 });
    }
    const plan     = rawPlan as SubscriptionPlan;
    const planData = PRICING_PLANS.find(p => p.id === plan);
    if (!planData) return NextResponse.json({ error: 'Plan not found.' }, { status: 404 });

    // Block double-purchase
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status')
      .eq('user_id', user.id)
      .single();

    if (
      profile?.subscription_tier === 'premium' &&
      profile?.subscription_status === 'active' &&
      plan !== 'lifetime'
    ) {
      return NextResponse.json(
        { error: 'You already have an active Premium subscription.' },
        { status: 409 }
      );
    }

    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    if (!apiKey) {
      console.error('[AethLife] NOWPAYMENTS_API_KEY not set in environment variables');
      return NextResponse.json(
        { error: 'Payment system not configured. Please contact support.' },
        { status: 503 }
      );
    }

    const usdPrice = planData.prices['USD'];
    const orderRef = `AE-${user.id.slice(0, 8).toUpperCase()}-${plan.slice(0, 3).toUpperCase()}-${Date.now()}`;

    // Encode user context into webhook URL query params
    const webhookUrl = new URL(`${BRAND.url}/api/webhooks/payment`);
    webhookUrl.searchParams.set('user_id', user.id);
    webhookUrl.searchParams.set('plan', plan);
    webhookUrl.searchParams.set('ref', orderRef);

    // FIXED: Only send valid NOWPayments invoice fields
    // Removed: pay_currency, is_fixed_rate, is_fee_paid_by_user (all caused 422)
    const invoiceBody = {
      price_amount:      usdPrice,
      price_currency:    'usd',
      ipn_callback_url:  webhookUrl.toString(),
      success_url:       `${BRAND.url}/billing?payment=success&plan=${plan}`,
      cancel_url:        `${BRAND.url}/billing?payment=cancelled`,
      order_id:          orderRef,
      order_description: `AethLife ${planData.name} — ${plan}`,
    };

    console.info('[AethLife] Creating NOWPayments invoice:', {
      plan,
      amount: usdPrice,
      ref:    orderRef,
    });

    const response = await fetch(`${NOWPAYMENTS_API}/invoice`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key':    apiKey,
      },
      body:   JSON.stringify(invoiceBody),
      signal: AbortSignal.timeout(15_000),
    });

    // Log exact response for debugging in Vercel logs
    const rawResponse = await response.text();
    console.info('[AethLife] NOWPayments response:', response.status, rawResponse);

    if (!response.ok) {
      let errMessage = 'Payment gateway error. Please try again.';
      try {
        const errData = JSON.parse(rawResponse);
        errMessage = errData.message ?? errData.error ?? errMessage;
      } catch { /* use default */ }
      return NextResponse.json({ error: errMessage }, { status: 502 });
    }

    let data: { invoice_url?: string; id?: string };
    try {
      data = JSON.parse(rawResponse);
    } catch {
      return NextResponse.json({ error: 'Invalid response from payment gateway.' }, { status: 502 });
    }

    if (!data.invoice_url) {
      console.error('[AethLife] NOWPayments: no invoice_url. Full response:', rawResponse);
      return NextResponse.json({ error: 'No payment URL received. Please try again.' }, { status: 502 });
    }

    // Analytics — non-blocking
    supabase.from('analytics_events').insert({
      user_id:    user.id,
      event:      'checkout_initiated',
      properties: { plan, provider: 'nowpayments', amount_usd: usdPrice, order_ref: orderRef },
    }).catch(() => {});

    return NextResponse.json({
      checkoutUrl: data.invoice_url,
      invoiceId:   data.id,
      orderRef,
      provider:    'nowpayments',
      plan:        planData.name,
      amount_usd:  usdPrice,
    });

  } catch (error) {
    console.error('[AethLife] Checkout unexpected error:', error);
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        { error: 'Payment gateway timed out. Please try again.' },
        { status: 504 }
      );
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
