// ============================================
// OpenClaw Trend Digest — RSS Feed Parser
// Tim 1: Data Engineering Team
// ============================================

import Parser from 'rss-parser';
import type { RawArticle, ScraperResult } from '../types/index.js';
import { logger } from '../utils/logger.js';

const rssParser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'OpenClaw-Trend-Digest/1.0 (RSS Reader)',
    'Accept': 'application/rss+xml, application/xml, text/xml',
  },
});

/**
 * Daftar RSS Feeds yang akan di-scrape.
 * Mudah di-extend — cukup tambah entry baru.
 */
const RSS_FEEDS: Array<{ name: string; url: string; category?: string }> = [
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'Technology',
  },
  {
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    category: 'Technology',
  },
  {
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    category: 'Technology',
  },
  {
    name: 'Wired',
    url: 'https://www.wired.com/feed/rss',
    category: 'Technology',
  },
  {
    name: 'Dev.to',
    url: 'https://dev.to/feed',
    category: 'Technology',
  },
];

/**
 * Membersihkan HTML tags dari description RSS.
 */
function stripHtmlTags(html: string | undefined): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500); // Limit description to 500 chars to save AI tokens
}

/**
 * Mengambil dan mem-parse satu RSS feed.
 */
async function fetchSingleFeed(
  name: string,
  url: string,
  category?: string
): Promise<RawArticle[]> {
  try {
    const feed = await rssParser.parseURL(url);
    const articles: RawArticle[] = [];

    const items = feed.items.slice(0, 15); // Max 15 per feed

    for (const item of items) {
      if (item.title && item.link) {
        articles.push({
          title: item.title.trim(),
          url: item.link,
          source: name,
          description: stripHtmlTags(item.contentSnippet ?? item.content ?? item.summary),
          publishedAt: item.pubDate ?? item.isoDate ?? undefined,
          category: category ?? (Array.isArray(item.categories) ? item.categories[0] : undefined),
        });
      }
    }

    logger.debug('RSS', `${name}: fetched ${articles.length} articles`);
    return articles;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.warn('RSS', `Failed to fetch ${name} (${url}): ${errorMessage}`);
    return [];
  }
}

/**
 * Mengambil semua RSS feeds secara paralel.
 */
export async function fetchRSSFeeds(): Promise<ScraperResult> {
  const endTimer = logger.startTimer('RSS', `Fetching ${RSS_FEEDS.length} RSS feeds`);

  try {
    const feedPromises = RSS_FEEDS.map((feed) =>
      fetchSingleFeed(feed.name, feed.url, feed.category)
    );

    const results = await Promise.allSettled(feedPromises);
    const articles: RawArticle[] = [];

    for (const result of results) {
      if (result.status === 'fulfilled') {
        articles.push(...result.value);
      }
    }

    endTimer();
    logger.info('RSS', `✅ Total ${articles.length} articles from ${RSS_FEEDS.length} feeds`);

    return {
      source: 'RSS Feeds',
      articles,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('RSS', `Failed to fetch RSS feeds: ${errorMessage}`);
    endTimer();

    return {
      source: 'RSS Feeds',
      articles: [],
      fetchedAt: new Date().toISOString(),
      error: errorMessage,
    };
  }
}
