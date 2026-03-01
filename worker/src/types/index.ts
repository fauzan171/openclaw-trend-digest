// ============================================
// OpenClaw Trend Digest — Worker Environment Types
// Cloudflare Workers + D1 Edition
// ============================================

/**
 * Cloudflare Worker Environment Bindings.
 * Ini adalah "kontrak" antara wrangler.toml dan TypeScript.
 */
export interface Env {
  // D1 Database binding
  DB: D1Database;

  // Secrets (set via `wrangler secret put`)
  GROQ_API_KEY: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  DISCORD_WEBHOOK_URL: string;

  // Variables (set di wrangler.toml [vars])
  MAX_TOPICS: string;
  MIN_RELEVANCE_SCORE: string;
  LOG_LEVEL: string;
  ENVIRONMENT: string;
}

/**
 * Raw article dari scraper — sama dengan versi sebelumnya.
 */
export interface RawArticle {
  readonly title: string;
  readonly url: string;
  readonly source: string;
  readonly score?: number;
  readonly commentCount?: number;
  readonly description?: string;
  readonly publishedAt?: string;
  readonly category?: string;
}

/**
 * Output dari AI curation.
 */
export interface DigestOutput {
  readonly date: string;
  readonly topics: DigestTopic[];
  readonly totalRawProcessed: number;
  readonly totalDiscarded: number;
}

export interface DigestTopic {
  readonly category: TopicCategory;
  readonly headline: string;
  readonly summary: string;
  readonly sentiment: Sentiment;
  readonly relevanceScore: number;
  readonly sources: string[];
  readonly emoji: string;
}

export type TopicCategory =
  | 'Technology'
  | 'Business'
  | 'Science'
  | 'National'
  | 'Global'
  | 'Security'
  | 'AI & Machine Learning';

export type Sentiment = 'Positive' | 'Negative' | 'Neutral' | 'Mixed';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Hasil dari satu scraper.
 */
export interface ScraperResult {
  readonly source: string;
  readonly articles: RawArticle[];
  readonly fetchedAt: string;
  readonly error?: string;
}

/**
 * Hasil gabungan dari semua scrapers.
 */
export interface AggregatedData {
  readonly results: ScraperResult[];
  readonly totalArticles: number;
  readonly fetchedAt: string;
}

/**
 * Status delivery ke setiap channel.
 */
export interface DeliveryResult {
  readonly channel: 'telegram' | 'discord' | 'd1';
  readonly success: boolean;
  readonly message: string;
  readonly timestamp: string;
}

/**
 * Hasil keseluruhan pipeline run.
 */
export interface PipelineResult {
  readonly startedAt: string;
  readonly completedAt: string;
  readonly scraping: AggregatedData;
  readonly digest: DigestOutput;
  readonly deliveries: DeliveryResult[];
  readonly success: boolean;
}

/**
 * D1 Row types — mapping ke SQLite schema.
 */
export interface D1DigestRow {
  id: string;
  publish_date: string;
  raw_markdown: string;
  raw_json: string; // JSON string, bukan object (SQLite = TEXT)
  created_at: string;
}

export interface D1TopicRow {
  id: string;
  digest_id: string;
  category: string;
  title: string;
  summary: string;
  sentiment: string;
  relevance_score: number;
  source_links: string; // JSON string array
  emoji: string;
  created_at: string;
}
