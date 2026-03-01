// ============================================
// OpenClaw Trend Digest — Scraper Orchestrator (Worker Edition)
// ============================================

import type { AggregatedData, ScraperResult } from '../types/index.js';
import type { Logger } from '../utils/logger.js';
import { fetchHackerNews } from './hackernews.js';
import { fetchRSSFeeds } from './rss-feed.js';
import { fetchReddit } from './reddit.js';

/**
 * Jalankan semua scrapers secara paralel.
 * Menggunakan Promise.allSettled — satu gagal tidak menghentikan yang lain.
 */
export async function runAllScrapers(logger: Logger): Promise<AggregatedData> {
  logger.separator('PHASE 1: DATA COLLECTION');

  const endTimer = logger.startTimer('Scrapers', 'Running all scrapers in parallel');

  const scraperTasks = [
    { name: 'HackerNews', fn: () => fetchHackerNews(logger) },
    { name: 'RSS Feeds', fn: () => fetchRSSFeeds(logger) },
    { name: 'Reddit', fn: () => fetchReddit(logger) },
  ];

  const settled = await Promise.allSettled(scraperTasks.map(t => t.fn()));

  const results: ScraperResult[] = [];
  let totalArticles = 0;

  settled.forEach((s, i) => {
    const taskName = scraperTasks[i]!.name;
    if (s.status === 'fulfilled') {
      results.push(s.value);
      totalArticles += s.value.articles.length;
      if (s.value.error) {
        logger.warn('Scrapers', `${taskName} warning: ${s.value.error}`);
      }
    } else {
      logger.error('Scrapers', `${taskName} FAILED: ${s.reason}`);
      results.push({
        source: taskName,
        articles: [],
        fetchedAt: new Date().toISOString(),
        error: String(s.reason),
      });
    }
  });

  endTimer();

  logger.info('Scrapers', `📊 Total: ${totalArticles} articles`, {
    bySource: results.map(r => ({ source: r.source, count: r.articles.length })),
  });

  return { results, totalArticles, fetchedAt: new Date().toISOString() };
}
