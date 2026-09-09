-- 0004_worker_sessions.sql
-- Align session storage with the worker auth flow (token-based, like Tolk).
-- The app has not shipped, so the previous token_hash table is safe to
-- replace with a plain random-token cookie store used by the Worker OAuth.

PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS sessions;

CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);

PRAGMA foreign_keys = ON;
