// ============================================
// OpenClaw Trend Digest — Scraper Orchestrator
// Tim 1: Data Engineering Team
// ============================================

import type { AggregatedData, ScraperResult } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { fetchHackerNews } from './hackernews.js';
import { fetchRSSFeeds } from './rss-feed.js';
import { fetchReddit } from './reddit.js';

/**
 * Menjalankan SEMUA scrapers secara paralel menggunakan Promise.allSettled.
 *
 * Mengapa allSettled dan bukan all?
 * → Karena jika satu sumber gagal (misal Reddit down),
 *   kita tetap mau melanjutkan dengan data dari sumber lain.
 *   Ini adalah prinsip "graceful degradation".
 */
export async function runAllScrapers(): Promise<AggregatedData> {
  logger.separator('PHASE 1: DATA COLLECTION (All Scrapers)');

  const endTimer = logger.startTimer('Scrapers', 'Running all scrapers in parallel');

  const scraperTasks = [
    { name: 'HackerNews', fn: fetchHackerNews },
    { name: 'RSS Feeds', fn: fetchRSSFeeds },
    { name: 'Reddit', fn: fetchReddit },
  ];

  logger.info('Scrapers', `Launching ${scraperTasks.length} scrapers in parallel...`);

  const settledResults = await Promise.allSettled(
    scraperTasks.map((task) => task.fn())
  );

  const results: ScraperResult[] = [];
  let totalArticles = 0;

  settledResults.forEach((settled, index) => {
    const taskName = scraperTasks[index]!.name;

    if (settled.status === 'fulfilled') {
      results.push(settled.value);
      totalArticles += settled.value.articles.length;

      if (settled.value.error) {
        logger.warn('Scrapers', `${taskName} completed with warning: ${settled.value.error}`);
      }
    } else {
      logger.error('Scrapers', `${taskName} FAILED: ${settled.reason}`);
      results.push({
        source: taskName,
        articles: [],
        fetchedAt: new Date().toISOString(),
        error: String(settled.reason),
      });
    }
  });

  endTimer();

  // Summary
  logger.info('Scrapers', `📊 Collection Summary:`, {
    totalArticles,
    bySource: results.map((r) => ({
      source: r.source,
      count: r.articles.length,
      hasError: !!r.error,
    })),
  });

  if (totalArticles === 0) {
    logger.error('Scrapers', '🚨 No articles collected from any source! Pipeline cannot continue.');
  }

  return {
    results,
    totalArticles,
    fetchedAt: new Date().toISOString(),
  };
}
