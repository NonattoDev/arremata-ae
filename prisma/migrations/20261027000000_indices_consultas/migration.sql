-- A restrição UNIQUE já fornece o índice (lot_id, sequence).
DROP INDEX IF EXISTS bids_lot;
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS lots_leader_status ON lots(leader_id, status);
CREATE INDEX IF NOT EXISTS lots_seller_created ON lots(seller_id, created_at);
CREATE INDEX IF NOT EXISTS auction_news_preferences_lot ON auction_news_preferences(lot_id);
