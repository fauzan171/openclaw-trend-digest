// ============================================
// OpenClaw Trend Digest — Reddit Scraper
// Tim 1: Data Engineering Team
// ============================================

import axios from 'axios';
import type { RawArticle, ScraperResult } from '../types/index.js';
import { logger } from '../utils/logger.js';

/**
 * Subreddits yang akan di-scrape.
 * Fokus pada tech, programming, dan Indonesia.
 */
const SUBREDDITS = [
  'programming',
  'technology',
  'webdev',
  'javascript',
  'indonesia',
];

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
  data: {
    children: RedditPost[];
  };
}

/**
 * Mengambil top/hot posts dari satu subreddit.
 */
async function fetchSubreddit(subreddit: string): Promise<RawArticle[]> {
  try {
    const response = await axios.get<RedditListing>(
      `${REDDIT_BASE_URL}/r/${subreddit}/hot.json`,
      {
        params: {
          limit: MAX_POSTS_PER_SUB,
          t: 'day',
        },
        headers: {
          'User-Agent': 'OpenClaw-Trend-Digest/1.0 (by /u/openclaw-bot)',
        },
        timeout: 10000,
      }
    );

    const articles: RawArticle[] = [];

    for (const post of response.data.data.children) {
      const { data } = post;

      // Skip stickied posts, NSFW, dan self-posts tanpa konten
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
        description: data.selftext
          ? data.selftext.slice(0, 500)
          : undefined,
        publishedAt: new Date(data.created_utc * 1000).toISOString(),
        category: data.link_flair_text ?? undefined,
      });
    }

    logger.debug('Reddit', `r/${subreddit}: fetched ${articles.length} posts`);
    return articles;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.warn('Reddit', `Failed to fetch r/${subreddit}: ${errorMessage}`);
    return [];
  }
}

/**
 * Mengambil posts dari semua subreddits secara paralel.
 */
export async function fetchReddit(): Promise<ScraperResult> {
  const endTimer = logger.startTimer('Reddit', `Fetching ${SUBREDDITS.length} subreddits`);

  try {
    const subredditPromises = SUBREDDITS.map((sub) => fetchSubreddit(sub));
    const results = await Promise.allSettled(subredditPromises);

    const articles: RawArticle[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        articles.push(...result.value);
      }
    }

    // Sort by score descending — ambil yang paling populer
    articles.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    endTimer();
    logger.info('Reddit', `✅ Total ${articles.length} posts from ${SUBREDDITS.length} subreddits`);

    return {
      source: 'Reddit',
      articles,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Reddit', `Failed to fetch Reddit: ${errorMessage}`);
    endTimer();

    return {
      source: 'Reddit',
      articles: [],
      fetchedAt: new Date().toISOString(),
      error: errorMessage,
    };
  }
}
