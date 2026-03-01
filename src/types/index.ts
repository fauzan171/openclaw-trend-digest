// ============================================
// OpenClaw Trend Digest — Shared Type Definitions
// Tim 1: Data Engineering Team
// ============================================

/**
 * Raw article data dari berbagai sumber sebelum diproses AI.
 * Ini adalah "kontrak" antar tim — semua scraper HARUS mengembalikan format ini.
 */
export interface RawArticle {
  /** Judul asli artikel */
  readonly title: string;
  /** URL sumber asli */
  readonly url: string;
  /** Nama sumber (e.g., "HackerNews", "Kompas Tekno") */
  readonly source: string;
  /** Skor popularitas (upvotes, score, dll). Opsional karena RSS tidak punya */
  readonly score?: number;
  /** Jumlah komentar. Opsional */
  readonly commentCount?: number;
  /** Ringkasan/deskripsi singkat dari sumber asli */
  readonly description?: string;
  /** Waktu publikasi asli */
  readonly publishedAt?: string;
  /** Kategori dari sumber (jika ada) */
  readonly category?: string;
}

/**
 * Output terstruktur dari AI setelah proses kurasi.
 * Ini adalah kontrak antara Tim 2 (AI) dan Tim 3 (Delivery).
 */
export interface DigestOutput {
  /** Tanggal digest dalam format human-readable */
  readonly date: string;
  /** Array topik yang sudah dikurasi AI */
  readonly topics: DigestTopic[];
  /** Jumlah artikel mentah yang diproses */
  readonly totalRawProcessed: number;
  /** Jumlah artikel yang dibuang (noise) */
  readonly totalDiscarded: number;
}

/**
 * Satu topik individual dalam digest.
 */
export interface DigestTopic {
  /** Kategori topik */
  readonly category: TopicCategory;
  /** Headline yang ditulis ulang oleh AI */
  readonly headline: string;
  /** Ringkasan 1-2 paragraf dari AI */
  readonly summary: string;
  /** Analisis sentimen publik */
  readonly sentiment: Sentiment;
  /** Skor relevansi (1-10) dari AI */
  readonly relevanceScore: number;
  /** Array URL sumber asli */
  readonly sources: string[];
  /** Emoji yang sesuai dengan kategori */
  readonly emoji: string;
}

/**
 * Kategori topik yang diizinkan.
 */
export type TopicCategory =
  | 'Technology'
  | 'Business'
  | 'Science'
  | 'National'
  | 'Global'
  | 'Security'
  | 'AI & Machine Learning';

/**
 * Sentimen publik.
 */
export type Sentiment = 'Positive' | 'Negative' | 'Neutral' | 'Mixed';

/**
 * Konfigurasi environment yang sudah divalidasi.
 */
export interface AppConfig {
  // AI / LLM
  readonly groqApiKey: string;

  // Telegram
  readonly telegramBotToken: string;
  readonly telegramChatId: string;

  // Discord
  readonly discordWebhookUrl: string;

  // Supabase
  readonly supabaseUrl?: string;
  readonly supabaseAnonKey?: string;

  // App Configuration
  readonly maxTopics: number;
  readonly minRelevanceScore: number;
  readonly logLevel: LogLevel;
}

/**
 * Level logging.
 */
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
 * Record untuk Supabase table `daily_digests`.
 */
export interface DailyDigestRecord {
  readonly id?: string;
  readonly publish_date: string;
  readonly raw_markdown: string;
  readonly raw_json: DigestOutput;
  readonly created_at?: string;
}

/**
 * Record untuk Supabase table `digest_topics`.
 */
export interface DigestTopicRecord {
  readonly id?: string;
  readonly digest_id: string;
  readonly category: string;
  readonly title: string;
  readonly summary: string;
  readonly sentiment: string;
  readonly relevance_score: number;
  readonly source_links: string[];
}

/**
 * Status delivery ke setiap channel.
 */
export interface DeliveryResult {
  readonly channel: 'telegram' | 'discord' | 'supabase';
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
