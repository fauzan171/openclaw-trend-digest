// ============================================
// OpenClaw Trend Digest — HackerNews Scraper (Worker Edition)
// Menggunakan native fetch() — tanpa axios
// ============================================

import type { RawArticle, ScraperResult } from "../types/index.js";
import type { Logger } from "../utils/logger.js";

const HN_BASE_URL = "https://hacker-news.firebaseio.com/v0";
const MAX_STORIES = 15;
const BATCH_SIZE = 3;

interface HNItem {
  id: number;
  title?: string;
  url?: string;
  score?: number;
  descendants?: number;
  time?: number;
  type?: string;
}

async function fetchStoryDetail(id: number): Promise<HNItem | null> {
  try {
    const res = await fetch(`${HN_BASE_URL}/item/${id}.json`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return (await res.json()) as HNItem;
  } catch {
    return null;
  }
}

export async function fetchHackerNews(logger: Logger): Promise<ScraperResult> {
  const endTimer = logger.startTimer("HackerNews", "Fetching top stories");

  try {
    const res = await fetch(`${HN_BASE_URL}/topstories.json`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const storyIds = ((await res.json()) as number[]).slice(0, MAX_STORIES);
    logger.info("HackerNews", `Fetching top ${storyIds.length} stories`);

    const articles: RawArticle[] = [];

    // Batch fetch untuk menghindari rate limiting
    for (let i = 0; i < storyIds.length; i += BATCH_SIZE) {
      const batch = storyIds.slice(i, i + BATCH_SIZE);
      const items = await Promise.all(batch.map((id) => fetchStoryDetail(id)));

      for (const item of items) {
        if (item?.title && item.url) {
          articles.push({
            title: item.title,
            url: item.url,
            source: "HackerNews",
            score: item.score ?? 0,
            commentCount: item.descendants ?? 0,
            publishedAt: item.time
              ? new Date(item.time * 1000).toISOString()
              : undefined,
          });
        }
      }
    }

    endTimer();
    logger.info("HackerNews", `✅ Fetched ${articles.length} articles`);

    return {
      source: "HackerNews",
      articles,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    logger.error("HackerNews", `Failed: ${msg}`);
    endTimer();
    return {
      source: "HackerNews",
      articles: [],
      fetchedAt: new Date().toISOString(),
      error: msg,
    };
  }
}
