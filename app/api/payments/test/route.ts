import { NextResponse } from 'next/server';

/**
 * AethLife — NOWPayments Connection Test
 * Visit: https://aethlife.vercel.app/api/payments/test
 * DELETE this file after confirming payments work.
 */
export async function GET() {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      ok: false,
      problem: 'NOWPAYMENTS_API_KEY not found in environment',
      fix: 'Vercel → Project → Settings → Environment Variables → add NOWPAYMENTS_API_KEY → redeploy',
    });
  }

  try {
    const invoiceRes = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        price_amount:     1.00,
        price_currency:   'usd',
        order_id:         `test-${Date.now()}`,
        order_description:'AethLife test',
        success_url:      'https://aethlife.vercel.app/billing',
        cancel_url:       'https://aethlife.vercel.app/billing',
        ipn_callback_url: 'https://aethlife.vercel.app/api/webhooks/payment',
      }),
    });

    const body = await invoiceRes.text();
    let parsed: unknown;
    try { parsed = JSON.parse(body); } catch { parsed = body; }

    const msg = typeof parsed === 'object' && parsed !== null
      ? (parsed as Record<string, string>).message ?? ''
      : String(parsed);

    let fix = '';
    if (invoiceRes.status === 401) fix = 'Wrong API key. Copy it again from nowpayments.io → Store Settings → API Keys.';
    else if (invoiceRes.status === 403) fix = 'Account not verified. Check your email from NOWPayments and verify.';
    else if (msg.toLowerCase().includes('wallet') || msg.toLowerCase().includes('payout'))
      fix = 'No payout wallet set. Go to nowpayments.io → Payment Settings → add your USDT wallet address.';
    else if (invoiceRes.ok) fix = 'All good! Payment system is working.';
    else fix = `NOWPayments said: ${msg}`;

    return NextResponse.json({
      ok: invoiceRes.ok,
      http_status: invoiceRes.status,
      api_key_starts_with: apiKey.slice(0, 8),
      nowpayments_response: parsed,
      diagnosis: fix,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) });
  }
}
