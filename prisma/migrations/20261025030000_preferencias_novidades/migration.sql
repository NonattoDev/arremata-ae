CREATE TABLE IF NOT EXISTS auction_news_preferences (
  user_id TEXT NOT NULL REFERENCES users(id),
  lot_id TEXT NOT NULL REFERENCES lots(id),
  whatsapp BOOLEAN NOT NULL DEFAULT false,
  telegram BOOLEAN NOT NULL DEFAULT false,
  email BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lot_id)
);
