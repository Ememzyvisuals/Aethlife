/**
 * AethLife Analytics — Lightweight, Privacy-First
 *
 * What we track (server-side only):
 * - Feature usage counts (which modules users engage with)
 * - Onboarding step completion rates
 * - Conversion funnel (free → premium)
 * - Retention signals (daily active pattern)
 *
 * What we NEVER track:
 * - Raw IP addresses
 * - Personal content (expense descriptions, workout names)
 * - Third-party behavior
 * - Cross-site tracking
 */

import { createClient } from '@/lib/supabase/server';

type AnalyticsEvent =
  | 'onboarding_step_completed'
  | 'onboarding_completed'
  | 'workout_logged'
  | 'expense_logged'
  | 'receipt_scanned'
  | 'habit_completed'
  | 'insight_generated'
  | 'insight_dismissed'
  | 'upgrade_page_viewed'
  | 'checkout_initiated'
  | 'premium_activated'
  | 'daily_active'
  | 'feature_used';

interface EventProperties {
  [key: string]: string | number | boolean | null;
}

export async function trackEvent(
  userId: string | null,
  event: AnalyticsEvent,
  properties: EventProperties = {}
): Promise<void> {
  try {
    const supabase = await createClient();

    await supabase.from('analytics_events').insert({
      user_id: userId,
      event,
      properties: sanitizeProperties(properties),
      created_at: new Date().toISOString(),
    });
  } catch {
    // Analytics must never break the main flow
  }
}

/** Remove any sensitive strings from properties before storing */
function sanitizeProperties(props: EventProperties): EventProperties {
  const safe: EventProperties = {};
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'string' && value.length > 100) continue; // Skip long strings
    if (key.toLowerCase().includes('email')) continue;
    if (key.toLowerCase().includes('password')) continue;
    if (key.toLowerCase().includes('name')) continue;
    safe[key] = value;
  }
  return safe;
}

/** Track onboarding funnel drop-off */
export async function trackOnboardingStep(userId: string, step: number, stepName: string) {
  await trackEvent(userId, 'onboarding_step_completed', { step, step_name: stepName });
}

/** Track daily active user (called from dashboard load) */
export async function trackDailyActive(userId: string) {
  await trackEvent(userId, 'daily_active', {
    hour_of_day: new Date().getHours(),
    day_of_week: new Date().getDay(),
  });
}

/** Track feature engagement */
export async function trackFeatureUsed(userId: string, feature: string) {
  await trackEvent(userId, 'feature_used', { feature });
}
