// ============================================
// OpenClaw Trend Digest — Scraper Unit Tests
// Tim 7: QA & Testing Team
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { RawArticle, ScraperResult } from '../types/index.js';

// ===== Test: HackerNews Scraper =====
describe('HackerNews Scraper', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return ScraperResult with correct source name', async () => {
    // Mock axios to avoid real API calls
    const mockAxios = await import('axios');
    vi.spyOn(mockAxios.default, 'get')
      .mockResolvedValueOnce({
        data: [1, 2, 3],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      })
      .mockResolvedValue({
        data: {
          id: 1,
          title: 'Test Article',
          url: 'https://example.com',
          score: 100,
          descendants: 50,
          time: Math.floor(Date.now() / 1000),
          type: 'story',
          by: 'testuser',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      });

    const { fetchHackerNews } = await import('../scrapers/hackernews.js');
    const result: ScraperResult = await fetchHackerNews();

    expect(result.source).toBe('HackerNews');
    expect(result.fetchedAt).toBeDefined();
    expect(Array.isArray(result.articles)).toBe(true);
  });

  it('should handle API errors gracefully', async () => {
    const mockAxios = await import('axios');
    vi.spyOn(mockAxios.default, 'get').mockRejectedValue(new Error('Network error'));

    const { fetchHackerNews } = await import('../scrapers/hackernews.js');
    const result = await fetchHackerNews();

    expect(result.source).toBe('HackerNews');
    expect(result.articles).toHaveLength(0);
    expect(result.error).toBeDefined();
  });
});

// ===== Test: RawArticle Type Validation =====
describe('RawArticle Type Conformance', () => {
  it('should create a valid RawArticle', () => {
    const article: RawArticle = {
      title: 'Test Title',
      url: 'https://example.com',
      source: 'TestSource',
      score: 100,
      commentCount: 50,
      description: 'Test description',
      publishedAt: '2026-03-01T00:00:00Z',
      category: 'Technology',
    };

    expect(article.title).toBe('Test Title');
    expect(article.url).toContain('https://');
    expect(article.source).toBe('TestSource');
  });

  it('should allow optional fields to be undefined', () => {
    const article: RawArticle = {
      title: 'Minimal Article',
      url: 'https://example.com',
      source: 'TestSource',
    };

    expect(article.score).toBeUndefined();
    expect(article.commentCount).toBeUndefined();
    expect(article.description).toBeUndefined();
  });
});

// ===== Test: Scraper Orchestrator =====
describe('Scraper Orchestrator', () => {
  it('should aggregate results from multiple scrapers', async () => {
    // Mock all scrapers
    vi.doMock('../scrapers/hackernews.js', () => ({
      fetchHackerNews: vi.fn().mockResolvedValue({
        source: 'HackerNews',
        articles: [
          { title: 'HN Article', url: 'https://hn.com/1', source: 'HackerNews' },
        ],
        fetchedAt: new Date().toISOString(),
      } satisfies ScraperResult),
    }));

    vi.doMock('../scrapers/rss-feed.js', () => ({
      fetchRSSFeeds: vi.fn().mockResolvedValue({
        source: 'RSS Feeds',
        articles: [
          { title: 'RSS Article', url: 'https://rss.com/1', source: 'TechCrunch' },
        ],
        fetchedAt: new Date().toISOString(),
      } satisfies ScraperResult),
    }));

    vi.doMock('../scrapers/reddit.js', () => ({
      fetchReddit: vi.fn().mockResolvedValue({
        source: 'Reddit',
        articles: [],
        fetchedAt: new Date().toISOString(),
      } satisfies ScraperResult),
    }));

    const { runAllScrapers } = await import('../scrapers/index.js');
    const result = await runAllScrapers();

    expect(result.totalArticles).toBeGreaterThanOrEqual(0);
    expect(result.results).toHaveLength(3);
    expect(result.fetchedAt).toBeDefined();
  });
});
