-- FINTRACE production PostgreSQL schema.
-- This schema is original project infrastructure; demo market observations are synthetic.
CREATE TABLE IF NOT EXISTS securities (
  id TEXT PRIMARY KEY,
  symbol TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  exchange TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('EQUITY','INDEX','GSEC')),
  sector TEXT,
  isin TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS price_history (
  id BIGSERIAL PRIMARY KEY,
  security_id TEXT NOT NULL REFERENCES securities(id) ON DELETE CASCADE,
  observed_at TIMESTAMPTZ NOT NULL,
  open NUMERIC(20,6), high NUMERIC(20,6), low NUMERIC(20,6), close NUMERIC(20,6) NOT NULL,
  volume BIGINT NOT NULL DEFAULT 0,
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  UNIQUE(security_id, observed_at)
);
CREATE INDEX IF NOT EXISTS idx_price_history_security_time ON price_history(security_id, observed_at DESC);
CREATE TABLE IF NOT EXISTS quotes (
  id BIGSERIAL PRIMARY KEY,
  security_id TEXT NOT NULL REFERENCES securities(id) ON DELETE CASCADE,
  observed_at TIMESTAMPTZ NOT NULL,
  price NUMERIC(20,6) NOT NULL,
  bid NUMERIC(20,6), ask NUMERIC(20,6), volume BIGINT NOT NULL DEFAULT 0,
  source TEXT NOT NULL, status TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_quotes_security_time ON quotes(security_id, observed_at DESC);
CREATE TABLE IF NOT EXISTS watchlists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS watchlist_items (
  watchlist_id TEXT NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
  security_id TEXT NOT NULL REFERENCES securities(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(watchlist_id, security_id)
);
CREATE TABLE IF NOT EXISTS snapshots (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  watchlist_id TEXT NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS snapshot_items (
  snapshot_id UUID NOT NULL REFERENCES snapshots(id) ON DELETE CASCADE,
  security_id TEXT NOT NULL REFERENCES securities(id) ON DELETE CASCADE,
  price NUMERIC(20,6), bid NUMERIC(20,6), ask NUMERIC(20,6), volume BIGINT, benchmark_value NUMERIC(20,6),
  PRIMARY KEY(snapshot_id, security_id)
);
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  security_id TEXT REFERENCES securities(id) ON DELETE CASCADE,
  metric TEXT NOT NULL,
  operator TEXT NOT NULL,
  threshold NUMERIC(20,6) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  triggered_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS change_events (
  id BIGSERIAL PRIMARY KEY,
  snapshot_id UUID REFERENCES snapshots(id) ON DELETE CASCADE,
  security_id TEXT REFERENCES securities(id) ON DELETE CASCADE,
  price_change NUMERIC(12,6),
  relative_performance NUMERIC(12,6),
  volume_ratio NUMERIC(12,6),
  volatility_change NUMERIC(12,6),
  spread_change NUMERIC(12,6),
  attention_score INTEGER,
  attention_level TEXT,
  explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
