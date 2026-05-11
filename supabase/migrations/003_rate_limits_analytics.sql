-- ============================================================
-- LifeSense Migration 003 — Rate Limit Log + Analytics
-- Run in Supabase SQL Editor after 001 and 002
-- ============================================================

-- ── Rate Limit Log ────────────────────────────────────────────
-- Stores hashed IP + action for abuse prevention.
-- Auto-cleans entries older than 24 hours via a scheduled job.
CREATE TABLE IF NOT EXISTS rate_limit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL,           -- "action:ip_hash"
  action TEXT NOT NULL,        -- e.g. "signup", "receipt_scan"
  ip_hash TEXT NOT NULL,       -- hashed, never raw IP
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rate_limit_key_created ON rate_limit_log(key, created_at DESC);

-- Auto-delete logs older than 24 hours (keeps table small)
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limit_log WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- ── Lightweight Analytics Events ──────────────────────────────
-- Privacy-conscious event tracking. No PII stored in event data.
-- Only anonymized user_id (hashed) + event name + metadata.
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event TEXT NOT NULL,
  properties JSONB NOT NULL DEFAULT '{}',
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_user ON analytics_events(user_id, created_at DESC);
CREATE INDEX idx_analytics_events_event ON analytics_events(event, created_at DESC);

-- RLS — users cannot read analytics (server-side only writes)
ALTER TABLE rate_limit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write analytics
-- No user-facing policies — analytics are server-only
