// ============================================
// OpenClaw Trend Digest — Cloudflare D1 Database Layer
// Tim 4: Database Engineer (Cloudflare Edition)
// ============================================
//
// PERBEDAAN UTAMA DARI SUPABASE:
// 1. D1 menggunakan binding langsung — tidak perlu URL/Key
// 2. D1 = SQLite — JSONB → TEXT, UUID → crypto.randomUUID()
// 3. Query langsung via D1 API, bukan Supabase client
// 4. Lebih cepat karena di-edge (same location as worker)
// ============================================

import type { DigestOutput, DeliveryResult } from '../types/index.js';
import type { Logger } from '../utils/logger.js';

/**
 * Simpan digest ke D1 database.
 *
 * Alur:
 * 1. Generate UUID manual (D1 tidak punya uuid_generate_v4())
 * 2. INSERT ke daily_digests
 * 3. Batch INSERT ke digest_topics
 * 4. Menggunakan D1 batch API untuk atomicity
 */
export async function archiveToD1(
  digest: DigestOutput,
  rawMarkdown: string,
  db: D1Database,
  logger: Logger
): Promise<DeliveryResult> {
  const endTimer = logger.startTimer('D1', 'Archiving digest');

  try {
    const digestId = crypto.randomUUID();
    const publishDate = new Date().toISOString().split('T')[0]!;
    const now = new Date().toISOString();

    // Batch statements untuk atomicity
    const statements: D1PreparedStatement[] = [];

    // 1. Insert daily digest
    statements.push(
      db.prepare(
        `INSERT OR REPLACE INTO daily_digests (id, publish_date, raw_markdown, raw_json, created_at)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(
        digestId,
        publishDate,
        rawMarkdown,
        JSON.stringify(digest),
        now
      )
    );

    // 2. Insert topics
    for (const topic of digest.topics) {
      const topicId = crypto.randomUUID();
      statements.push(
        db.prepare(
          `INSERT INTO digest_topics (id, digest_id, category, title, summary, sentiment, relevance_score, source_links, emoji, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          topicId,
          digestId,
          topic.category,
          topic.headline,
          topic.summary,
          topic.sentiment,
          topic.relevanceScore,
          JSON.stringify(topic.sources),
          topic.emoji,
          now
        )
      );
    }

    // Execute batch — D1 batch is atomic (all or nothing)
    const results = await db.batch(statements);

    const allSuccess = results.every(r => r.success);

    if (!allSuccess) {
      logger.warn('D1', 'Some batch statements failed', results);
    }

    endTimer();
    logger.info('D1', `✅ Archived: digest ${digestId} with ${digest.topics.length} topics`);

    return {
      channel: 'd1',
      success: true,
      message: `Archived ${digest.topics.length} topics to D1`,
      timestamp: now,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown';
    logger.error('D1', `Archive failed: ${msg}`);
    endTimer();

    return {
      channel: 'd1',
      success: false,
      message: `D1 archive failed: ${msg}`,
      timestamp: new Date().toISOString(),
    };
  }
}

// ============================================
// READ OPERATIONS — digunakan oleh API routes
// ============================================

/**
 * Ambil semua digests (untuk frontend).
 */
export async function getDigests(db: D1Database, limit = 30) {
  const { results } = await db.prepare(
    `SELECT id, publish_date, raw_json, created_at
     FROM daily_digests
     ORDER BY publish_date DESC
     LIMIT ?`
  ).bind(limit).all();

  return results.map(row => ({
    ...row,
    raw_json: typeof row['raw_json'] === 'string' ? JSON.parse(row['raw_json'] as string) : row['raw_json'],
  }));
}

/**
 * Ambil digest by date.
 */
export async function getDigestByDate(db: D1Database, date: string) {
  const result = await db.prepare(
    `SELECT id, publish_date, raw_markdown, raw_json, created_at
     FROM daily_digests
     WHERE publish_date = ?`
  ).bind(date).first();

  if (!result) return null;

  return {
    ...result,
    raw_json: typeof result['raw_json'] === 'string' ? JSON.parse(result['raw_json'] as string) : result['raw_json'],
  };
}

/**
 * Ambil topics by category (filter).
 */
export async function getTopicsByCategory(db: D1Database, category: string, limit = 50) {
  const { results } = await db.prepare(
    `SELECT dt.*, dd.publish_date
     FROM digest_topics dt
     JOIN daily_digests dd ON dd.id = dt.digest_id
     WHERE dt.category = ?
     ORDER BY dd.publish_date DESC, dt.relevance_score DESC
     LIMIT ?`
  ).bind(category, limit).all();

  return results.map(row => ({
    ...row,
    source_links: typeof row['source_links'] === 'string'
      ? JSON.parse(row['source_links'] as string)
      : row['source_links'],
  }));
}

/**
 * Statistik keseluruhan.
 */
export async function getStats(db: D1Database) {
  const digestCount = await db.prepare('SELECT COUNT(*) as count FROM daily_digests').first();
  const topicCount = await db.prepare('SELECT COUNT(*) as count FROM digest_topics').first();
  const categories = await db.prepare(
    `SELECT category, COUNT(*) as count
     FROM digest_topics
     GROUP BY category
     ORDER BY count DESC`
  ).all();
  const sentiments = await db.prepare(
    `SELECT sentiment, COUNT(*) as count
     FROM digest_topics
     GROUP BY sentiment
     ORDER BY count DESC`
  ).all();

  return {
    totalDigests: (digestCount as Record<string, unknown>)?.['count'] ?? 0,
    totalTopics: (topicCount as Record<string, unknown>)?.['count'] ?? 0,
    categories: categories.results,
    sentiments: sentiments.results,
  };
}
