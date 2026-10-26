ALTER TABLE auction_news_preferences ADD COLUMN IF NOT EXISTS whatsapp_number TEXT NOT NULL DEFAULT '';
ALTER TABLE auction_news_preferences ADD COLUMN IF NOT EXISTS telegram_username TEXT NOT NULL DEFAULT '';
