-- Run once with a migration-capable database role. The application runtime role
-- should only receive SELECT/INSERT/UPDATE/DELETE on the tables it needs.

ALTER TABLE staff
  ADD COLUMN IF NOT EXISTS company_code TEXT NOT NULL DEFAULT 'marajo_group';

UPDATE staff
SET company_code = 'marajo_group'
WHERE company_code IS NULL OR company_code = '';

CREATE TABLE IF NOT EXISTS visitor_presence (
  session_id TEXT PRIMARY KEY,
  path TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visitor_presence_last_seen
ON visitor_presence (last_seen);

CREATE TABLE IF NOT EXISTS security_rate_limits (
  key TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 0,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_rate_limits_updated_at
ON security_rate_limits (updated_at);
