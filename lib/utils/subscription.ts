import { createClient } from '@/lib/supabase/server';

export interface SubscriptionStatus {
  isPremium: boolean;
  tier: 'free' | 'premium';
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  expiresAt: string | null;
  isLifetime: boolean;
}

export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status, subscription_expires_at')
    .eq('user_id', userId)
    .single();

  if (!profile) {
    return { isPremium: false, tier: 'free', status: 'inactive', expiresAt: null, isLifetime: false };
  }

  // Check lifetime
  const { data: lifetimeSub } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('is_lifetime', true)
    .eq('status', 'active')
    .single();

  const isLifetime = !!lifetimeSub;
  const isPremium = profile.subscription_tier === 'premium' && profile.subscription_status === 'active';

  // Check if subscription expired
  if (profile.subscription_expires_at && !isLifetime) {
    const expiresAt = new Date(profile.subscription_expires_at);
    if (expiresAt < new Date()) {
      // Mark as expired
      await supabase.from('profiles').update({
        subscription_tier: 'free',
        subscription_status: 'expired',
      }).eq('user_id', userId);

      return {
        isPremium: false,
        tier: 'free',
        status: 'expired',
        expiresAt: profile.subscription_expires_at,
        isLifetime: false,
      };
    }
  }

  return {
    isPremium,
    tier: profile.subscription_tier as 'free' | 'premium',
    status: profile.subscription_status as SubscriptionStatus['status'],
    expiresAt: profile.subscription_expires_at,
    isLifetime,
  };
}

export async function requirePremium(userId: string): Promise<boolean> {
  const status = await getSubscriptionStatus(userId);
  return status.isPremium || status.isLifetime;
}
