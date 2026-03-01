// ============================================
// OpenClaw Trend Digest — Supabase Archive
// Tim 4: Database & Archive Team
// ============================================

import { createClient } from '@supabase/supabase-js';
import type { DigestOutput, DeliveryResult, AppConfig } from '../types/index.js';
import { logger } from '../utils/logger.js';

/**
 * Menyimpan digest ke Supabase untuk ditampilkan di Web Archive.
 *
 * Arsitektur:
 * 1. Insert ke `daily_digests` (parent record)
 * 2. Insert batch ke `digest_topics` (child records)
 * 3. Menggunakan transaction-like approach (insert parent dulu, baru children)
 */
export async function archiveToSupabase(
  digest: DigestOutput,
  rawMarkdown: string,
  config: AppConfig
): Promise<DeliveryResult> {
  const endTimer = logger.startTimer('Supabase', 'Archiving digest');

  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    logger.info('Supabase', 'Supabase not configured, skipping archive');
    return {
      channel: 'supabase',
      success: false,
      message: 'Supabase credentials not configured',
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);

    // Step 1: Insert daily digest record
    const publishDate = new Date().toISOString().split('T')[0]!; // YYYY-MM-DD

    const { data: digestRecord, error: digestError } = await supabase
      .from('daily_digests')
      .insert({
        publish_date: publishDate,
        raw_markdown: rawMarkdown,
        raw_json: digest,
      })
      .select('id')
      .single();

    if (digestError) {
      throw new Error(`Failed to insert daily_digest: ${digestError.message}`);
    }

    if (!digestRecord?.id) {
      throw new Error('No ID returned from daily_digests insert');
    }

    logger.info('Supabase', `Inserted daily_digest with ID: ${digestRecord.id}`);

    // Step 2: Insert topic records
    if (digest.topics.length > 0) {
      const topicRecords = digest.topics.map((topic) => ({
        digest_id: digestRecord.id,
        category: topic.category,
        title: topic.headline,
        summary: topic.summary,
        sentiment: topic.sentiment,
        relevance_score: topic.relevanceScore,
        source_links: topic.sources,
      }));

      const { error: topicsError } = await supabase
        .from('digest_topics')
        .insert(topicRecords);

      if (topicsError) {
        logger.warn('Supabase', `Topics insert warning: ${topicsError.message}`);
        // Non-fatal — parent record sudah masuk
      } else {
        logger.info('Supabase', `Inserted ${topicRecords.length} topic records`);
      }
    }

    endTimer();
    logger.info('Supabase', '✅ Digest archived successfully!');

    return {
      channel: 'supabase',
      success: true,
      message: `Archived digest (${digest.topics.length} topics) to Supabase`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Supabase', `Archive failed: ${errorMessage}`);
    endTimer();

    return {
      channel: 'supabase',
      success: false,
      message: `Supabase archive failed: ${errorMessage}`,
      timestamp: new Date().toISOString(),
    };
  }
}
