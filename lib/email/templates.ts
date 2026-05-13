import { Resend } from 'resend';
import { BRAND } from '@/lib/brand';

/**
 * AethLife Email System — Resend
 *
 * IMPORTANT — FREE TIER LIMITATION:
 * onboarding@resend.dev only delivers to YOUR OWN verified email.
 * To send to any user's email, you MUST verify a domain in Resend.
 *
 * Current setup: emails deliver correctly to ememzyvisuals@gmail.com
 * (owner notifications work). User welcome/confirmation emails will
 * only work after you verify aethlife.xyz in Resend → Domains.
 *
 * Setup steps for full delivery:
 * 1. resend.com → Domains → Add Domain → type aethlife.xyz
 * 2. Add the 3 DNS records they show to your domain registrar
 * 3. Wait 10 mins → verified
 * 4. Change FROM below to: AethLife <info@aethlife.xyz>
 */

function getResendClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('RESEND_API_KEY is not set in environment variables');
  }
  return new Resend(key);
}

// Change to info@aethlife.xyz after verifying domain in Resend
const FROM = `${BRAND.name} <onboarding@resend.dev>`;

// ── Shared HTML shell ─────────────────────────────────────────
function emailShell(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${BRAND.name}</title>
<style>
  body{margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif}
  .wrap{max-width:560px;margin:40px auto;padding:0 20px 40px}
  .card{background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden}
  .header{background:linear-gradient(135deg,#0f766e,#14b8a6);padding:28px 32px}
  .logo{color:white;font-size:22px;font-weight:700;letter-spacing:-0.02em;margin:0}
  .logo span{opacity:0.75}
  .body{padding:32px}
  h1{margin:0 0 8px;font-size:22px;font-weight:600;color:#0f172a;letter-spacing:-0.02em}
  p{margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569}
  .btn{display:inline-block;background:#14b8a6;color:#ffffff!important;text-decoration:none;font-size:15px;font-weight:600;padding:14px 28px;border-radius:12px;margin:8px 0 20px}
  .divider{border:none;border-top:1px solid #e2e8f0;margin:24px 0}
  .highlight{background:#f0fdfa;border-left:3px solid #14b8a6;padding:12px 16px;border-radius:0 8px 8px 0;margin:16px 0}
  .highlight p{margin:0;font-size:14px;color:#0f766e}
  .footer{padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0}
  .footer p{font-size:12px;color:#94a3b8;margin:0;line-height:1.5}
  .footer a{color:#14b8a6;text-decoration:none}
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="header">
      <p class="logo">Aeth<span>Life</span></p>
    </div>
    <div class="body">
      ${body}
    </div>
    <div class="footer">
      <p>${BRAND.name} · ${BRAND.company}<br/>
      <a href="${BRAND.url}">${BRAND.url}</a> ·
      <a href="${BRAND.url}/legal/privacy">Privacy</a> ·
      <a href="${BRAND.url}/legal/terms">Terms</a></p>
    </div>
  </div>
</div>
</body>
</html>`;
}

// ── Welcome email ─────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string) {
  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from:    FROM,
      to,
      subject: `Welcome to ${BRAND.name}`,
      html:    emailShell(`
        <h1>Welcome, ${name} 👋</h1>
        <p>Your account is ready. Here's what you can do right now:</p>
        <div class="highlight">
          <p>Log your first workout, add an expense, or build a habit.
          AI insights start appearing after a few days of data.</p>
        </div>
        <a class="btn" href="${BRAND.url}/dashboard">Open Dashboard</a>
        <hr class="divider"/>
        <p style="font-size:13px;color:#94a3b8">
          Questions? Reply to this email — we read every one.
        </p>
      `),
    });
    if (error) console.error('[AethLife] Welcome email error:', error);
  } catch (err) {
    console.error('[AethLife] sendWelcomeEmail failed:', err);
    // Never throw — email failure should never break the user flow
  }
}

// ── Subscription confirmation ─────────────────────────────────
export async function sendSubscriptionConfirmation({
  to, name, plan, amount, currency,
}: {
  to: string; name: string;
  plan: 'monthly' | 'annual' | 'lifetime';
  amount: string; currency: string;
}) {
  const planLabel = plan === 'lifetime' ? 'Lifetime' : plan === 'annual' ? 'Annual' : 'Monthly';
  const expiry    = plan === 'lifetime'
    ? 'Never — you own it forever'
    : plan === 'annual'
      ? 'Renews in 12 months'
      : 'Renews in 1 month';

  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from:    FROM,
      to,
      subject: `${BRAND.name} Premium activated — ${planLabel}`,
      html:    emailShell(`
        <h1>Premium activated! 🎉</h1>
        <p>Hi ${name}, your payment was confirmed.</p>
        <div class="highlight">
          <p><strong>Plan:</strong> ${planLabel}<br/>
          <strong>Amount:</strong> ${amount} ${currency}<br/>
          <strong>Access:</strong> ${expiry}</p>
        </div>
        <p>You now have access to unlimited AI insights, receipt scanning, and advanced analytics.</p>
        <a class="btn" href="${BRAND.url}/dashboard">Go to Dashboard</a>
        <hr class="divider"/>
        <p style="font-size:13px;color:#94a3b8">
          Keep this email as your payment receipt.
          Contact us at <a href="mailto:${BRAND.supportEmail}">${BRAND.supportEmail}</a> for any issues.
        </p>
      `),
    });
    if (error) console.error('[AethLife] Subscription email error:', error);
  } catch (err) {
    console.error('[AethLife] sendSubscriptionConfirmation failed:', err);
  }
}

// ── Password reset (backup — Supabase handles this by default) ──
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from:    FROM,
      to,
      subject: `Reset your ${BRAND.name} password`,
      html:    emailShell(`
        <h1>Reset your password</h1>
        <p>We received a request to reset your password. Click below to set a new one.</p>
        <a class="btn" href="${resetUrl}">Reset Password</a>
        <hr class="divider"/>
        <p style="font-size:13px;color:#94a3b8">
          This link expires in 1 hour. If you didn't request this, ignore this email.
        </p>
      `),
    });
    if (error) console.error('[AethLife] Password reset email error:', error);
  } catch (err) {
    console.error('[AethLife] sendPasswordResetEmail failed:', err);
  }
}
