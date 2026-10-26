CREATE TABLE IF NOT EXISTS deposit_simulations (
 id text PRIMARY KEY,
 user_id text NOT NULL REFERENCES users(id),
 amount bigint NOT NULL CHECK (amount > 0 AND amount <= 1000000000),
 method text NOT NULL CHECK (method IN ('pix','card')),
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','expired')),
 created_at timestamptz NOT NULL,
 ready_at timestamptz NOT NULL,
 expires_at timestamptz NOT NULL,
 confirmed_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS deposit_simulations_pending_user ON deposit_simulations(user_id) WHERE status='pending';
CREATE INDEX IF NOT EXISTS deposit_simulations_user ON deposit_simulations(user_id,created_at);

