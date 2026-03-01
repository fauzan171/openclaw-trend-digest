-- ============================================
-- OpenClaw Trend Digest — Database Schema (Supabase/PostgreSQL)
-- Tim 4: Database & Archive Team
-- ============================================
-- 
-- CARA PENGGUNAAN:
-- 1. Buka Supabase Dashboard → SQL Editor
-- 2. Copy-paste seluruh isi file ini
-- 3. Klik "Run"
--
-- Atau via CLI: psql -h <host> -U postgres -d postgres -f schema.sql
-- ============================================

-- Enable UUID extension (biasanya sudah enabled di Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: daily_digests
-- Menyimpan rangkuman harian secara utuh
-- ============================================
CREATE TABLE IF NOT EXISTS daily_digests (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  publish_date DATE NOT NULL,
  raw_markdown TEXT NOT NULL,
  raw_json     JSONB NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraint: satu digest per hari
  CONSTRAINT unique_daily_digest UNIQUE (publish_date)
);

-- Index untuk query by date range (digunakan di frontend)
CREATE INDEX IF NOT EXISTS idx_digests_publish_date 
  ON daily_digests (publish_date DESC);

-- ============================================
-- Table: digest_topics
-- Menyimpan item berita spesifik per digest
-- ============================================
CREATE TABLE IF NOT EXISTS digest_topics (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  digest_id       UUID NOT NULL REFERENCES daily_digests(id) ON DELETE CASCADE,
  category        VARCHAR(50) NOT NULL,
  title           TEXT NOT NULL,
  summary         TEXT NOT NULL,
  sentiment       VARCHAR(20) NOT NULL DEFAULT 'Neutral',
  relevance_score INTEGER NOT NULL DEFAULT 5 CHECK (relevance_score BETWEEN 1 AND 10),
  source_links    JSONB NOT NULL DEFAULT '[]',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk filter by category (digunakan di frontend)
CREATE INDEX IF NOT EXISTS idx_topics_category 
  ON digest_topics (category);

-- Index untuk join query
CREATE INDEX IF NOT EXISTS idx_topics_digest_id 
  ON digest_topics (digest_id);

-- Index untuk full-text search pada judul (bonus feature)
CREATE INDEX IF NOT EXISTS idx_topics_title_search 
  ON digest_topics USING GIN (to_tsvector('english', title));

-- ============================================
-- Row Level Security (RLS) — Best Practice Supabase
-- ============================================

-- Enable RLS
ALTER TABLE daily_digests ENABLE ROW LEVEL SECURITY;
ALTER TABLE digest_topics ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access (untuk frontend)
CREATE POLICY "Public read access for digests" 
  ON daily_digests FOR SELECT 
  USING (true);

CREATE POLICY "Public read access for topics" 
  ON digest_topics FOR SELECT 
  USING (true);

-- Policy: Allow service role insert (untuk backend/cron job)
CREATE POLICY "Service role insert for digests" 
  ON daily_digests FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Service role insert for topics" 
  ON digest_topics FOR INSERT 
  WITH CHECK (true);

-- ============================================
-- Useful Views (untuk frontend queries)
-- ============================================

-- View: latest digest with topic count
CREATE OR REPLACE VIEW latest_digest AS
SELECT 
  dd.id,
  dd.publish_date,
  dd.raw_markdown,
  dd.created_at,
  COUNT(dt.id) AS topic_count,
  ARRAY_AGG(DISTINCT dt.category) AS categories
FROM daily_digests dd
LEFT JOIN digest_topics dt ON dt.digest_id = dd.id
GROUP BY dd.id, dd.publish_date, dd.raw_markdown, dd.created_at
ORDER BY dd.publish_date DESC
LIMIT 1;

-- View: topic statistics
CREATE OR REPLACE VIEW topic_stats AS
SELECT 
  category,
  sentiment,
  COUNT(*) AS count,
  AVG(relevance_score) AS avg_relevance
FROM digest_topics
GROUP BY category, sentiment
ORDER BY count DESC;
