// ============================================
// OpenClaw Trend Digest — RSS Feed Parser (Worker Edition)
// Lightweight XML parsing tanpa rss-parser library
// ============================================
//
// Workers tidak bisa pakai `rss-parser` (Node.js streams/sax).
// Solusi: parse XML secara manual menggunakan regex + string ops.
// Ini JAUH lebih ringan dan sesuai untuk Workers environment.
// ============================================

import type { RawArticle, ScraperResult } from '../types/index.js';
import type { Logger } from '../utils/logger.js';

const RSS_FEEDS: Array<{ name: string; url: string; category?: string }> = [
  // Twitter / Viral Trends Indonesia
  { name: 'Twitter Trends ID', url: 'https://news.google.com/rss/search?q=twitter+indonesia+viral+OR+trending&hl=id&gl=ID&ceid=ID:id', category: 'Twitter Trends' },
  // Underground/Hacking/Cybersecurity news
  { name: 'BleepingComputer', url: 'https://www.bleepingcomputer.com/feed/', category: 'Underground/Security' },
  { name: 'The Hacker News', url: 'https://feeds.feedburner.com/TheHackersNews', category: 'Underground/Security' },
  // AI Trends
  { name: 'AI News', url: 'https://artificialintelligence-news.com/feed/', category: 'AI Trends' },
  // Football/Soccer
  { name: 'Goal Indonesia', url: 'https://www.goal.com/feeds/id/news', category: 'Football' },
  { name: 'SkySports Football', url: 'https://www.skysports.com/rss/12040', category: 'Football' },
];

/**
 * Ekstrak nilai dari XML tag.
 * Contoh: extractTag('<title>Hello</title>', 'title') → 'Hello'
 */
function extractTag(xml: string, tag: string): string {
  // Handle CDATA sections: <title><![CDATA[Hello World]]></title>
  const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i');
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch?.[1]) return cdataMatch[1].trim();

  // Handle regular text: <title>Hello World</title>
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(regex);
  return match?.[1]?.trim() ?? '';
}

/**
 * Ekstrak semua <item> atau <entry> dari RSS/Atom feed.
 */
function extractItems(xml: string): string[] {
  // RSS uses <item>, Atom uses <entry>
  const itemRegex = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/gi;
  const items: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    if (match[1]) items.push(match[1]);
  }

  return items;
}

/**
 * Ekstrak link dari Atom feed (beda format dari RSS).
 * Atom: <link href="https://..." /> atau <link rel="alternate" href="..." />
 */
function extractLink(xml: string): string {
  // RSS: <link>https://...</link>
  const rssLink = extractTag(xml, 'link');
  if (rssLink && rssLink.startsWith('http')) return rssLink;

  // Atom: <link href="https://..." />
  const atomRegex = /<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i;
  const atomMatch = xml.match(atomRegex);
  return atomMatch?.[1] ?? '';
}

/**
 * Strip HTML tags dan decode entities.
 */
function stripHtml(html: string): string {
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
    .slice(0, 500);
}

/**
 * Fetch dan parse satu RSS feed.
 */
async function fetchSingleFeed(
  name: string,
  url: string,
  category: string | undefined,
  logger: Logger
): Promise<RawArticle[]> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'OpenClaw-Trend-Digest/1.0 (Cloudflare Worker)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const xml = await res.text();
    const items = extractItems(xml).slice(0, 15);
    const articles: RawArticle[] = [];

    for (const item of items) {
      const title = stripHtml(extractTag(item, 'title'));
      const link = extractLink(item);
      const description = stripHtml(
        extractTag(item, 'description') ||
        extractTag(item, 'summary') ||
        extractTag(item, 'content')
      );
      const pubDate = extractTag(item, 'pubDate') || extractTag(item, 'published') || extractTag(item, 'updated');

      if (title && link) {
        articles.push({
          title,
          url: link,
          source: name,
          description: description || undefined,
          publishedAt: pubDate || undefined,
          category,
        });
      }
    }

    logger.debug('RSS', `${name}: ${articles.length} articles`);
    return articles;
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown';
    logger.warn('RSS', `Failed ${name}: ${msg}`);
    return [];
  }
}

/**
 * Fetch semua RSS feeds secara paralel.
 */
export async function fetchRSSFeeds(logger: Logger): Promise<ScraperResult> {
  const endTimer = logger.startTimer('RSS', `Fetching ${RSS_FEEDS.length} feeds`);

  const results = await Promise.allSettled(
    RSS_FEEDS.map(feed => fetchSingleFeed(feed.name, feed.url, feed.category, logger))
  );

  const articles: RawArticle[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      articles.push(...result.value);
    }
  }

  endTimer();
  logger.info('RSS', `✅ Total ${articles.length} articles from ${RSS_FEEDS.length} feeds`);

  return { source: 'RSS Feeds', articles, fetchedAt: new Date().toISOString() };
}
