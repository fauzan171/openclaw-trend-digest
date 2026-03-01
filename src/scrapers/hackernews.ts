// ============================================
// OpenClaw Trend Digest — HackerNews API Scraper
// Tim 1: Data Engineering Team
// ============================================

import axios from 'axios';
import type { RawArticle, ScraperResult } from '../types/index.js';
import { logger } from '../utils/logger.js';

const HN_BASE_URL = 'https://hacker-news.firebaseio.com/v0';
const MAX_STORIES = 50;
const CONCURRENT_BATCH_SIZE = 10;

interface HNItem {
  id: number;
  title?: string;
  url?: string;
  score?: number;
  descendants?: number;
  time?: number;
  type?: string;
  by?: string;
  text?: string;
}

/**
 * Mengambil detail satu story dari HackerNews API.
 */
async function fetchStoryDetail(id: number): Promise<HNItem | null> {
  try {
    const response = await axios.get<HNItem>(`${HN_BASE_URL}/item/${id}.json`, {
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    logger.warn('HackerNews', `Failed to fetch story ${id}`, error);
    return null;
  }
}

/**
 * Mengambil top stories dari HackerNews secara batch paralel.
 * Menggunakan pattern "batch parallel" untuk menghindari rate limiting.
 */
export async function fetchHackerNews(): Promise<ScraperResult> {
  const endTimer = logger.startTimer('HackerNews', 'Fetching top stories');

  try {
    // Step 1: Ambil list top story IDs
    const { data: storyIds } = await axios.get<number[]>(
      `${HN_BASE_URL}/topstories.json`,
      { timeout: 10000 }
    );

    const topIds = storyIds.slice(0, MAX_STORIES);
    logger.info('HackerNews', `Found ${storyIds.length} stories, fetching top ${topIds.length}`);

    // Step 2: Fetch details secara batch paralel
    const articles: RawArticle[] = [];

    for (let i = 0; i < topIds.length; i += CONCURRENT_BATCH_SIZE) {
      const batch = topIds.slice(i, i + CONCURRENT_BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map((id) => fetchStoryDetail(id))
      );

      for (const item of batchResults) {
        if (item?.title && item.url) {
          articles.push({
            title: item.title,
            url: item.url,
            source: 'HackerNews',
            score: item.score ?? 0,
            commentCount: item.descendants ?? 0,
            description: item.text ?? undefined,
            publishedAt: item.time
              ? new Date(item.time * 1000).toISOString()
              : undefined,
          });
        }
      }
    }

    endTimer();
    logger.info('HackerNews', `✅ Successfully fetched ${articles.length} articles`);

    return {
      source: 'HackerNews',
      articles,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('HackerNews', `Failed to fetch stories: ${errorMessage}`);
    endTimer();

    return {
      source: 'HackerNews',
      articles: [],
      fetchedAt: new Date().toISOString(),
      error: errorMessage,
    };
  }
}
