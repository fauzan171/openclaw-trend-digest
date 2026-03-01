// ============================================
// OpenClaw Trend Digest — Main Pipeline Orchestrator
// Tim 8: System Architect
// ============================================
//
// Ini adalah ENTRY POINT utama aplikasi.
// Mengorkestrasi seluruh pipeline: Scrape → AI → Deliver
//
// Usage:
//   npm run dev      → Jalankan sekali untuk development
//   npm run start    → Jalankan di production (setelah build)
//   GitHub Actions   → Dijalankan otomatis setiap hari
// ============================================

import { runAllScrapers } from './scrapers/index.js';
import { runAICuration } from './ai/summarizer.js';
import { deliverDigest } from './delivery/index.js';
import { loadConfig } from './utils/config.js';
import { logger } from './utils/logger.js';
import type { PipelineResult, RawArticle } from './types/index.js';

/**
 * Main pipeline function.
 *
 * Alur:
 * 1. Load & validate config
 * 2. Scrape data dari semua sumber (paralel)
 * 3. Gabungkan semua artikel menjadi satu array
 * 4. Kirim ke AI untuk kurasi
 * 5. Deliver hasil ke semua channel (paralel)
 * 6. Report final status
 */
async function main(): Promise<PipelineResult> {
  const startedAt = new Date().toISOString();

  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   ☀️  OPENCLAW TREND DIGEST — AI News Curator Agent       ║
  ║                                                           ║
  ║   🤖 Your Personal Editor-in-Chief                        ║
  ║   📡 Scrape → Curate → Deliver                            ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);

  // ===== STEP 0: Load Configuration =====
  logger.separator('INITIALIZATION');
  let config;
  try {
    config = loadConfig();
  } catch (error) {
    logger.error('Main', 'Configuration error. Aborting pipeline.', error);
    process.exit(1);
  }

  // ===== STEP 1: Data Collection =====
  const scrapingResult = await runAllScrapers();

  if (scrapingResult.totalArticles === 0) {
    logger.error('Main', '🚨 No articles collected. Nothing to process.');
    return {
      startedAt,
      completedAt: new Date().toISOString(),
      scraping: scrapingResult,
      digest: {
        date: new Date().toLocaleDateString('id-ID'),
        topics: [],
        totalRawProcessed: 0,
        totalDiscarded: 0,
      },
      deliveries: [],
      success: false,
    };
  }

  // ===== STEP 2: Merge & Deduplicate Basic =====
  const allArticles: RawArticle[] = scrapingResult.results.flatMap((r) => r.articles);

  // Basic deduplication by URL (AI akan melakukan dedup lebih cerdas nanti)
  const uniqueUrls = new Set<string>();
  const deduplicatedArticles = allArticles.filter((article) => {
    const normalizedUrl = article.url.toLowerCase().replace(/\/$/, '');
    if (uniqueUrls.has(normalizedUrl)) {
      return false;
    }
    uniqueUrls.add(normalizedUrl);
    return true;
  });

  logger.info(
    'Main',
    `📊 Pre-processing: ${allArticles.length} total → ${deduplicatedArticles.length} unique articles`
  );

  // ===== STEP 3: AI Curation =====
  const digest = await runAICuration(deduplicatedArticles, config);

  // ===== STEP 4: Multi-Channel Delivery =====
  const deliveries = await deliverDigest(digest, config);

  // ===== STEP 5: Final Report =====
  const completedAt = new Date().toISOString();
  const durationMs = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  const allDeliveriesSucceeded = deliveries.every((d) => d.success);

  logger.separator('PIPELINE COMPLETE');
  logger.info('Main', `⏱️  Total duration: ${(durationMs / 1000).toFixed(1)}s`);
  logger.info('Main', `📰 Articles scraped: ${scrapingResult.totalArticles}`);
  logger.info('Main', `🧠 Topics curated: ${digest.topics.length}`);
  logger.info('Main', `📡 Deliveries: ${deliveries.filter((d) => d.success).length}/${deliveries.length} succeeded`);
  logger.info('Main', allDeliveriesSucceeded ? '✅ Pipeline SUCCESS' : '⚠️ Pipeline completed with some delivery failures');

  const result: PipelineResult = {
    startedAt,
    completedAt,
    scraping: scrapingResult,
    digest,
    deliveries,
    success: digest.topics.length > 0 && deliveries.some((d) => d.success),
  };

  return result;
}

// ===== ENTRY POINT =====
main()
  .then((result) => {
    if (!result.success) {
      process.exit(1);
    }
  })
  .catch((error) => {
    logger.error('Main', '💀 Fatal pipeline error', error);
    process.exit(1);
  });
