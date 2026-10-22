
CREATE TABLE IF NOT EXISTS users (
 id text PRIMARY KEY, email text UNIQUE NOT NULL, name text NOT NULL,
 password_hash text NOT NULL, role text NOT NULL CHECK (role IN ('seller','bidder')),
 alias text UNIQUE NOT NULL, balance bigint NOT NULL DEFAULT 0 CHECK(balance >= 0)
);
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_balance_check;
ALTER TABLE users ADD CONSTRAINT users_balance_check CHECK(balance >= 0);
CREATE TABLE IF NOT EXISTS sessions (
 token_hash text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id), expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS lots (
 id text PRIMARY KEY, seller_id text NOT NULL REFERENCES users(id), item jsonb NOT NULL,
 initial bigint NOT NULL CHECK(initial > 0), increment bigint NOT NULL CHECK(increment > 0),
 starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL CHECK(ends_at > starts_at),
 status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','closed','cancelled')),
 current_amount bigint NOT NULL DEFAULT 0, leader_id text REFERENCES users(id),
 bid_count integer NOT NULL DEFAULT 0, head_hash text NOT NULL, checkpoint text NOT NULL,
 receipt jsonb, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS bids (
 id text PRIMARY KEY, lot_id text NOT NULL REFERENCES lots(id), bidder_id text NOT NULL REFERENCES users(id),
 alias text NOT NULL, amount bigint NOT NULL CHECK(amount > 0), sequence integer NOT NULL,
 placed_at timestamptz NOT NULL, previous_hash text NOT NULL, hash text NOT NULL,
 UNIQUE(lot_id, sequence)
);
CREATE INDEX IF NOT EXISTS bids_lot ON bids(lot_id, sequence);
CREATE INDEX IF NOT EXISTS bids_user ON bids(bidder_id, lot_id);
CREATE INDEX IF NOT EXISTS lots_due ON lots(status, ends_at);
CREATE TABLE IF NOT EXISTS ledger (
 id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id), lot_id text REFERENCES lots(id),
 amount bigint NOT NULL, kind text NOT NULL, created_at timestamptz NOT NULL,
 UNIQUE(user_id, lot_id, kind)
);
CREATE TABLE IF NOT EXISTS rate_limits (key text PRIMARY KEY, hits integer NOT NULL, resets_at timestamptz NOT NULL);
