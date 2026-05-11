import { Resend } from 'resend';
import { BRAND } from '@/lib/brand';

/**
 * AethLife Email System
 * ══════════════════════
 * Provider: Resend (free tier: 3,000 emails/month)
 * Sender:   onboarding@resend.dev (free default — change to info@aethlife.xyz after domain purchase)
 * Delivery: Ememzyvisuals@gmail.com (owner notifications)
 *
 * HOW IT WORKS:
 * 1. User action triggers an email (signup, feedback, reset)
 * 2. API route calls this module
 * 3. Resend delivers via their SMTP infrastructure
 * 4. Vercel serves the API routes via serverless functions
 *
 * EMAIL TYPES IMPLEMENTED:
 * - welcome:         Sent after successful signup
 * - password_reset:  Handled by Supabase Auth automatically
 * - feedback_notify: Owner notification for user feedback/bugs
 * - weekly_insight:  Optional weekly summary (premium)
 * - subscription:    Payment confirmation
 */

const resend = new Resend(process.env.RESEND_API_KEY!);

const FROM = `${BRAND.name} <onboarding@resend.dev>`; // TODO: change to info@aethlife.xyz after domain purchase

// ── Shared email template wrapper ─────────────────────────────
function emailShell(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${BRAND.name}</title>
<style>
  body { margin: 0; padding: 0; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; }
  .wrap { max-width: 560px; margin: 40px auto; padding: 0 20px 40px; }
  .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }
  .header { background: linear-gradient(135deg, #0f766e, #14b8a6); padding: 28px 32px; display: flex; align-items: center; gap: 12px; }
  .logo-text { color: white; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
  .body { padding: 32px; }
  h1 { margin: 0 0 8px; font-size: 22px; font-weight: 600; color: #0f172a; letter-spacing: -0.02em; }
  p { margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #475569; }
  .btn { display: inline-block; background: #14b8a6; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 28px; border-radius: 12px; margin: 8px 0 20px; }
  .divider { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
  .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
  .footer p { font-size: 12px; color: #94a3b8; margin: 0; line-height: 1.5; }
  .footer a { color: #14b8a6; text-decoration: none; }
  .highlight { background: #f0fdfa; border-left: 3px solid #14b8a6; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
  .highlight p { margin: 0; font-size: 14px; color: #0f766e; }
  @media (prefers-color-scheme: dark) {
    body { background: #0a0a0a; }
    .card { background: #111827; border-color: #1f2937; }
    h1 { color: #f1f5f9; }
    p { color: #94a3b8; }
    .footer { background: #0f172a; border-color: #1f2937; }
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="header">
      <div class="logo-text">AethLife</div>
    </div>
    <div class="body">
      ${body}
    </div>
    <div class="footer">
      <p>
        ${BRAND.name} by ${BRAND.company} ·
        <a href="${BRAND.url}/legal/privacy">Privacy</a> ·
        <a href="${BRAND.url}/legal/terms">Terms</a><br/>
        ${BRAND.supportEmail} · ${BRAND.url}
      </p>
    </div>
  </div>
</div>
</body>
</html>`;
}

// ── Welcome Email ─────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Welcome to ${BRAND.name} — your life OS is ready`,
    html: emailShell(`
      <h1>Welcome, ${name}.</h1>
      <p>Your ${BRAND.name} account is active. You're now on the free plan — start tracking your workouts, expenses, and habits right away.</p>
      <div class="highlight">
        <p>💡 <strong>First step:</strong> Complete your onboarding to personalize your dashboard and AI insights.</p>
      </div>
      <a href="${BRAND.url}/dashboard" class="btn">Open your dashboard →</a>
      <hr class="divider" />
      <p style="font-size:13px; color:#64748b;"><strong>What's included in your free account:</strong><br/>
      Full fitness tracking · Expense logging · Habit streaks · 3 AI insights/week · 5 receipt scans/month · Offline PWA</p>
      <p style="font-size:13px; color:#64748b;">Upgrade to Premium anytime for unlimited AI coaching, behavioral correlations, and unlimited receipt scanning from <a href="${BRAND.url}/billing" style="color:#14b8a6;">₦5,000/month</a>.</p>
    `),
  });
}

// ── Feedback Notification (to owner) ─────────────────────────
export async function sendFeedbackNotification(opts: {
  type: string;
  title: string;
  description: string;
  email?: string;
}) {
  const typeEmoji: Record<string, string> = {
    feedback: '💬',
    bug_report: '🐛',
    feature_request: '💡',
    rating: '⭐',
  };
  const emoji = typeEmoji[opts.type] ?? '📬';
  const label = opts.type.replace(/_/g, ' ');

  return resend.emails.send({
    from: FROM,
    to: BRAND.ownerEmail,
    subject: `[${BRAND.name}] ${emoji} ${label}: ${opts.title}`,
    html: emailShell(`
      <h1>${emoji} New ${label}</h1>
      <p style="font-size:12px; color:#94a3b8; margin-bottom:20px;">Submitted via ${BRAND.name} feedback form</p>
      <p><strong style="color:#0f172a;">${opts.title}</strong></p>
      <div class="highlight">
        <p style="white-space:pre-wrap; color:#334155;">${opts.description}</p>
      </div>
      ${opts.email ? `<p style="font-size:13px; color:#64748b;">Reply to: <a href="mailto:${opts.email}" style="color:#14b8a6;">${opts.email}</a></p>` : ''}
    `),
  });
}

// ── Subscription Confirmation ─────────────────────────────────
export async function sendSubscriptionConfirmation(opts: {
  to: string;
  name: string;
  plan: 'monthly' | 'annual' | 'lifetime';
  amount: string;
  currency: string;
}) {
  const planLabels = { monthly: 'Monthly Premium', annual: 'Yearly Premium', lifetime: 'Lifetime Premium' };
  const planLabel = planLabels[opts.plan];
  const isLifetime = opts.plan === 'lifetime';

  return resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `${BRAND.name} Premium is active — ${planLabel}`,
    html: emailShell(`
      <h1>You're now Premium, ${opts.name}.</h1>
      <p>Your <strong>${planLabel}</strong> subscription is active. Every premium feature is now unlocked.</p>
      <div class="highlight">
        <p>✅ <strong>${planLabel}</strong> · ${opts.amount} ${opts.currency}${isLifetime ? ' (one-time)' : ''}</p>
      </div>
      <p><strong>What you've unlocked:</strong><br/>
      Unlimited AI coaching · Advanced behavioral correlations · Unlimited receipt scanning · Advanced analytics · Enhanced smart notifications${isLifetime ? ' · All future features' : ''}</p>
      <a href="${BRAND.url}/insights" class="btn">Explore AI insights →</a>
      <hr class="divider" />
      <p style="font-size:13px; color:#64748b;">Manage your subscription anytime from <a href="${BRAND.url}/billing" style="color:#14b8a6;">Billing settings</a>. Questions? Email <a href="mailto:${BRAND.supportEmail}" style="color:#14b8a6;">${BRAND.supportEmail}</a></p>
    `),
  });
}

// ── Password Reset (supplementary — Supabase handles primary) ─
export async function sendPasswordResetInfo(to: string, name: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `${BRAND.name} — password reset requested`,
    html: emailShell(`
      <h1>Password reset requested</h1>
      <p>Hi ${name}, we received a request to reset your ${BRAND.name} password. Check your inbox for the reset link from our authentication system.</p>
      <p>If you didn't request this, you can safely ignore it — your account is secure.</p>
      <p style="font-size:13px; color:#64748b;">The reset link expires in 60 minutes. If it has expired, <a href="${BRAND.url}/auth/forgot-password" style="color:#14b8a6;">request a new one here</a>.</p>
    `),
  });
}
