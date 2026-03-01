// ============================================
// OpenClaw Trend Digest — Reddit Scraper (Worker Edition)
// Native fetch — tanpa axios
// ============================================

import type { RawArticle, ScraperResult } from '../types/index.js';
import type { Logger } from '../utils/logger.js';

const SUBREDDITS = ['programming', 'technology', 'webdev', 'javascript', 'indonesia'];
const REDDIT_BASE_URL = 'https://www.reddit.com';
const MAX_POSTS_PER_SUB = 15;

interface RedditPost {
  data: {
    title: string;
    url: string;
    permalink: string;
    score: number;
    num_comments: number;
    selftext?: string;
    created_utc: number;
    subreddit: string;
    link_flair_text?: string;
    is_self: boolean;
    over_18: boolean;
    stickied: boolean;
  };
}

interface RedditListing {
  data: { children: RedditPost[] };
}

async function fetchSubreddit(subreddit: string, logger: Logger): Promise<RawArticle[]> {
  try {
    const res = await fetch(
      `${REDDIT_BASE_URL}/r/${subreddit}/hot.json?limit=${MAX_POSTS_PER_SUB}&t=day`,
      {
        headers: { 'User-Agent': 'OpenClaw-Trend-Digest/1.0 (Cloudflare Worker)' },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const listing = await res.json() as RedditListing;
    const articles: RawArticle[] = [];

    for (const post of listing.data.children) {
      const { data } = post;
      if (data.stickied || data.over_18) continue;

      const url = data.is_self
        ? `${REDDIT_BASE_URL}${data.permalink}`
        : data.url;

      articles.push({
        title: data.title,
        url,
        source: `Reddit/r/${data.subreddit}`,
        score: data.score,
        commentCount: data.num_comments,
        description: data.selftext ? data.selftext.slice(0, 500) : undefined,
        publishedAt: new Date(data.created_utc * 1000).toISOString(),
        category: data.link_flair_text ?? undefined,
      });
    }

    logger.debug('Reddit', `r/${subreddit}: ${articles.length} posts`);
    return articles;
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown';
    logger.warn('Reddit', `Failed r/${subreddit}: ${msg}`);
    return [];
  }
}

export async function fetchReddit(logger: Logger): Promise<ScraperResult> {
  const endTimer = logger.startTimer('Reddit', `Fetching ${SUBREDDITS.length} subreddits`);

  const results = await Promise.allSettled(
    SUBREDDITS.map(sub => fetchSubreddit(sub, logger))
  );

  const articles: RawArticle[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      articles.push(...result.value);
    }
  }

  articles.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  endTimer();
  logger.info('Reddit', `✅ Total ${articles.length} posts from ${SUBREDDITS.length} subreddits`);

  return { source: 'Reddit', articles, fetchedAt: new Date().toISOString() };
}
