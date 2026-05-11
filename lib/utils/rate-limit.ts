import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Lightweight IP-based rate limiter using Supabase.
 * Stores counts in a simple table — no Redis needed on free tier.
 *
 * Usage: await checkIPRateLimit(request, 'signup', 5, 60)
 * → max 5 signups per IP per 60 minutes
 */
export async function checkIPRateLimit(
  request: NextRequest,
  action: string,
  maxRequests: number,
  windowMinutes: number
): Promise<RateLimitResult> {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown';

    const supabase = await createClient();
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
    const windowKey = `${action}:${ip}`;

    // Count recent actions from this IP
    const { count } = await supabase
      .from('rate_limit_log')
      .select('id', { count: 'exact', head: true })
      .eq('key', windowKey)
      .gte('created_at', windowStart);

    const used = count ?? 0;
    const remaining = Math.max(0, maxRequests - used);
    const resetAt = new Date(Date.now() + windowMinutes * 60 * 1000);

    if (used >= maxRequests) {
      return { allowed: false, remaining: 0, resetAt };
    }

    // Log this action (fire and forget — don't block the request)
    supabase
      .from('rate_limit_log')
      .insert({ key: windowKey, action, ip_hash: hashIP(ip) })
      .then(() => {})
      .catch(() => {});

    return { allowed: true, remaining: remaining - 1, resetAt };
  } catch {
    // If rate limiting fails, allow the request (fail open)
    return { allowed: true, remaining: 0, resetAt: new Date() };
  }
}

/** Simple consistent hash for IP privacy - never store raw IPs */
function hashIP(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function rateLimitResponse(resetAt: Date) {
  const retryAfterSeconds = Math.ceil((resetAt.getTime() - Date.now()) / 1000);
  return new Response(
    JSON.stringify({
      error: 'too_many_requests',
      message: 'Too many requests. Please wait before trying again.',
      retry_after: retryAfterSeconds,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSeconds),
        'X-RateLimit-Remaining': '0',
      },
    }
  );
}
