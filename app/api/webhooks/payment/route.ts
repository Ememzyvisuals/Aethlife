import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createHmac } from 'crypto';
import { sendSubscriptionConfirmation } from '@/lib/email/templates';

/**
 * AethLife — NOWPayments IPN Webhook Handler
 *
 * NOWPayments sends POST to ipn_callback_url when payment status changes.
 *
 * Verification:
 *   Header: x-nowpayments-sig
 *   Method: HMAC-SHA512 of sorted JSON body keys using IPN secret
 *
 * Payment statuses:
 *   waiting     → awaiting crypto from user
 *   confirming  → seen on blockchain, waiting for confirmations
 *   confirmed   → confirmed on blockchain
 *   sending     → being sent to your wallet
 *   finished    → ✅ GRANT PREMIUM — payment complete
 *   partially_paid → user paid less than required (do NOT grant)
 *   failed      → payment failed
 *   refunded    → payment refunded
 *   expired     → user didn't pay in time
 *
 * Env vars needed:
 *   NOWPAYMENTS_IPN_SECRET = ieqi6w1bv9e8oZWEgHgA4MPhBCQbvu1/
 */

// Verify NOWPayments IPN signature
// NOWPayments uses HMAC-SHA512 on the body with keys sorted alphabetically
function verifyIPNSignature(rawBody: string, signature: string, secret: string): boolean {
  if (!secret || !signature) return false;
  try {
    const parsed = JSON.parse(rawBody);
    // Sort keys alphabetically and re-stringify
    const sorted = JSON.stringify(parsed, Object.keys(parsed).sort());
    const expected = createHmac('sha512', secret).update(sorted).digest('hex');
    // Constant-time comparison
    if (expected.length !== signature.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
      diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

function getPlanFromOrderId(orderId: string): 'monthly' | 'annual' | 'lifetime' | null {
  if (!orderId) return null;
  const upper = orderId.toUpperCase();
  if (upper.includes('-MON-')) return 'monthly';
  if (upper.includes('-ANN-')) return 'annual';
  if (upper.includes('-LIF-')) return 'lifetime';
  return null;
}

function getExpiresAt(plan: 'monthly' | 'annual' | 'lifetime'): string | null {
  if (plan === 'lifetime') return null;
  const d = new Date();
  if (plan === 'monthly') d.setMonth(d.getMonth() + 1);
  if (plan === 'annual') d.setFullYear(d.getFullYear() + 1);
  return d.toISOString();
}

export async function POST(request: NextRequest) {
  // Read raw body for signature verification
  const rawBody = await request.text();
  const signature = request.headers.get('x-nowpayments-sig') ?? '';
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET ?? '';

  // Verify signature
  if (ipnSecret && !verifyIPNSignature(rawBody, signature, ipnSecret)) {
    console.warn('[AethLife] NOWPayments IPN: invalid signature — rejecting');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Parse body
  let payment: Record<string, unknown> = {};
  try {
    payment = JSON.parse(rawBody || '{}');
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const status  = String(payment.payment_status ?? '').toLowerCase();
  const orderId = String(payment.order_id ?? '');

  console.info('[AethLife] NOWPayments IPN received:', {
    status,
    orderId,
    paymentId: payment.payment_id,
    payCurrency: payment.pay_currency,
    priceAmount: payment.price_amount,
  });

  // Only grant premium on 'finished' status
  // 'confirmed' means blockchain confirmed but not yet sent to wallet
  // 'finished' means funds are in your wallet — this is the safe trigger
  if (status !== 'finished') {
    console.info(`[AethLife] Status "${status}" — not yet finished, skipping`);
    return NextResponse.json({ received: true, processed: false, status });
  }

  // Extract user context from query params (set when creating invoice)
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  const planParam = searchParams.get('plan');
  const ref = searchParams.get('ref') ?? orderId;

  if (!userId) {
    console.error('[AethLife] IPN: missing user_id in query params. order_id:', orderId);
    return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
  }

  const plan = (planParam as 'monthly' | 'annual' | 'lifetime') ??
    getPlanFromOrderId(orderId);

  if (!plan) {
    console.error('[AethLife] IPN: cannot determine plan from:', orderId, planParam);
    return NextResponse.json({ error: 'Cannot determine plan' }, { status: 400 });
  }

  const supabase = await createClient();

  // Idempotency — never process same payment twice
  const paymentRef = String(payment.payment_id ?? ref);
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('payment_reference', paymentRef)
    .maybeSingle();

  if (existing) {
    console.info('[AethLife] IPN: already processed payment', paymentRef);
    return NextResponse.json({ received: true, processed: false, reason: 'duplicate' });
  }

  const expiresAt  = getExpiresAt(plan);
  const amountPaid = Number(payment.actually_paid ?? payment.pay_amount ?? 0);
  const pricePaid  = Number(payment.price_amount ?? 0);

  // Grant premium — update both subscriptions table and profile
  const [{ error: subError }, { error: profError }] = await Promise.all([
    supabase.from('subscriptions').insert({
      user_id:           userId,
      plan,
      status:            'active',
      payment_provider:  'nowpayments',
      payment_reference: paymentRef,
      currency:          String(payment.pay_currency ?? 'usdttrc20').toUpperCase(),
      amount_paid:       amountPaid || pricePaid,
      is_lifetime:       plan === 'lifetime',
      expires_at:        expiresAt,
      started_at:        new Date().toISOString(),
    }),
    supabase.from('profiles').update({
      subscription_tier:       'premium',
      subscription_status:     'active',
      subscription_expires_at: expiresAt,
    }).eq('user_id', userId),
  ]);

  if (subError || profError) {
    console.error('[AethLife] IPN: failed to grant premium:', subError ?? profError);
    // Return 500 so NOWPayments retries
    return NextResponse.json({ error: 'Failed to activate subscription' }, { status: 500 });
  }

  // Confirmation email — non-blocking
  try {
    const { data: prof } = await supabase
      .from('profiles').select('full_name').eq('user_id', userId).single();
    const { data: authU } = await supabase.auth.admin.getUserById(userId)
      .catch(() => ({ data: null }));
    if (authU?.user?.email) {
      sendSubscriptionConfirmation({
        to:       authU.user.email,
        name:     prof?.full_name ?? 'there',
        plan,
        amount:   `$${pricePaid}`,
        currency: 'USD',
      }).catch(() => {});
    }
  } catch { /* never block the webhook response */ }

  // Analytics — non-blocking
  supabase.from('analytics_events').insert({
    user_id:    userId,
    event:      'premium_activated',
    properties: {
      plan,
      provider:    'nowpayments',
      payment_id:  paymentRef,
      pay_currency: payment.pay_currency,
      amount_paid:  amountPaid,
    },
  }).catch(() => {});

  console.info(`[AethLife] ✅ Premium granted: user=${userId} plan=${plan} payment=${paymentRef}`);

  // NOWPayments expects HTTP 200 — anything else triggers a retry
  return NextResponse.json({ received: true, processed: true, plan });
}

// NOWPayments sometimes sends a GET request to verify the URL is reachable
export async function GET() {
  return NextResponse.json({ status: 'AethLife payment webhook active' });
}
