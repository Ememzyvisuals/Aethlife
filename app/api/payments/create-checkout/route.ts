import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PRICING_PLANS } from '@/lib/pricing';
import { BRAND } from '@/lib/brand';
import { checkIPRateLimit, rateLimitResponse } from '@/lib/utils/rate-limit';
import type { SubscriptionPlan } from '@/types';

/**
 * AethLife — NOWPayments Invoice Creation
 *
 * NOWPayments is non-custodial, no-KYC, 0.5% fee.
 * Price is set in USD — NOWPayments handles crypto conversion automatically.
 *
 * Setup:
 *   1. nowpayments.io → sign up with email
 *   2. Payment Settings → add your USDT TRC20 wallet address
 *   3. API Keys → Generate API Key → add as NOWPAYMENTS_API_KEY
 *   4. Store Settings → IPN Secret → Generate → add as NOWPAYMENTS_IPN_SECRET
 *
 * Docs: https://documenter.getpostman.com/view/7907941/2s93JusNJt
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
    const plan = rawPlan as SubscriptionPlan;
    const planData = PRICING_PLANS.find(p => p.id === plan);
    if (!planData) return NextResponse.json({ error: 'Plan not found.' }, { status: 404 });

    // Block double-purchase
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status')
      .eq('user_id', user.id)
      .single();

    if (profile?.subscription_tier === 'premium' && profile?.subscription_status === 'active' && plan !== 'lifetime') {
      return NextResponse.json({ error: 'You already have an active Premium subscription.' }, { status: 409 });
    }

    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Payment system not configured. Please contact support.' },
        { status: 503 }
      );
    }

    const usdPrice = planData.prices['USD'];
    const orderRef = `AE-${user.id.slice(0, 8).toUpperCase()}-${plan.slice(0, 3).toUpperCase()}-${Date.now()}`;

    // Webhook URL carries user context so we know who to grant premium to
    const webhookUrl =
      `${BRAND.url}/api/webhooks/payment` +
      `?user_id=${encodeURIComponent(user.id)}` +
      `&plan=${plan}` +
      `&ref=${encodeURIComponent(orderRef)}`;

    const invoiceBody = {
      price_amount:      usdPrice,
      price_currency:    'usd',           // NOWPayments converts to crypto automatically
      pay_currency:      'usdttrc20',     // Default: USDT on TRON (cheapest fees, fastest)
      ipn_callback_url:  webhookUrl,
      success_url:       `${BRAND.url}/billing?payment=success&plan=${plan}`,
      cancel_url:        `${BRAND.url}/billing?payment=cancelled`,
      order_id:          orderRef,
      order_description: `AethLife ${planData.name} — ${plan} subscription`,
      is_fixed_rate:     false,           // Allows user to pay in any available currency
      is_fee_paid_by_user: false,
    };

    const response = await fetch(`${NOWPAYMENTS_API}/invoice`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key':    apiKey,
      },
      body:   JSON.stringify(invoiceBody),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('[AethLife] NOWPayments error:', response.status, errText);
      return NextResponse.json(
        { error: `Payment gateway error (${response.status}). Please try again.` },
        { status: 502 }
      );
    }

    const data = await response.json();

    if (!data.invoice_url) {
      console.error('[AethLife] NOWPayments: no invoice_url in response:', JSON.stringify(data));
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
    console.error('[AethLife] Checkout error:', error);
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json({ error: 'Payment gateway timed out. Please try again.' }, { status: 504 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
