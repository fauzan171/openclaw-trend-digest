-- ============================================
-- OpenClaw Trend Digest — D1 Database Schema (SQLite)
-- Cloudflare D1 Migration
-- ============================================
--
-- CARA PENGGUNAAN:
--   Development (lokal):
--     npx wrangler d1 execute openclaw-digest-db --local --file=./schema.sql
--
--   Production:
--     npx wrangler d1 execute openclaw-digest-db --file=./schema.sql
--
-- PERBEDAAN DARI POSTGRESQL:
--   - UUID  → TEXT (generate manual via crypto.randomUUID())
--   - JSONB → TEXT (simpan JSON string, parse di application layer)
--   - TIMESTAMPTZ → TEXT (ISO 8601 string)
--   - Tidak ada EXTENSION, RLS, atau GIN Index
-- ============================================

-- ============================================
-- Table: daily_digests
-- Menyimpan rangkuman harian secara utuh
-- ============================================
CREATE TABLE IF NOT EXISTS daily_digests (
  id            TEXT PRIMARY KEY,
  publish_date  TEXT NOT NULL,
  raw_markdown  TEXT NOT NULL,
  raw_json      TEXT NOT NULL DEFAULT '{}',
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Satu digest per hari
CREATE UNIQUE INDEX IF NOT EXISTS idx_digests_unique_date
  ON daily_digests (publish_date);

-- Query by date range (digunakan di frontend & API)
CREATE INDEX IF NOT EXISTS idx_digests_publish_date
  ON daily_digests (publish_date DESC);

-- ============================================
-- Table: digest_topics
-- Menyimpan item berita spesifik per digest
-- ============================================
CREATE TABLE IF NOT EXISTS digest_topics (
  id              TEXT PRIMARY KEY,
  digest_id       TEXT NOT NULL,
  category        TEXT NOT NULL,
  title           TEXT NOT NULL,
  summary         TEXT NOT NULL,
  sentiment       TEXT NOT NULL DEFAULT 'Neutral',
  relevance_score INTEGER NOT NULL DEFAULT 5,
  source_links    TEXT NOT NULL DEFAULT '[]',
  emoji           TEXT NOT NULL DEFAULT '📰',
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  
  FOREIGN KEY (digest_id) REFERENCES daily_digests(id) ON DELETE CASCADE
);

-- Filter by category
CREATE INDEX IF NOT EXISTS idx_topics_category
  ON digest_topics (category);

-- Join query optimization
CREATE INDEX IF NOT EXISTS idx_topics_digest_id
  ON digest_topics (digest_id);

-- Filter by sentiment
CREATE INDEX IF NOT EXISTS idx_topics_sentiment
  ON digest_topics (sentiment);

-- Relevance score filter
CREATE INDEX IF NOT EXISTS idx_topics_relevance
  ON digest_topics (relevance_score DESC);
