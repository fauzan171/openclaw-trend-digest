// ============================================
// OpenClaw Trend Digest — Integration Tests
// Tim 7: QA & Testing Team
// ============================================

import { describe, it, expect } from 'vitest';
import type {
  RawArticle,
  DigestOutput,
  DigestTopic,
  AppConfig,
  ScraperResult,
  AggregatedData,
  DeliveryResult,
  PipelineResult,
} from '../types/index.js';

/**
 * Integration tests memastikan semua type definitions
 * dan kontrak antar modul berjalan harmonis.
 *
 * Ini bukan end-to-end test yang memanggil API sungguhan,
 * tapi memastikan "kontrak" antar tim sudah benar.
 */

// ===== Test: Data Flow Contract =====
describe('Data Flow Contract (Type Integration)', () => {
  it('RawArticle → AI → DigestOutput → DeliveryResult flow', () => {
    // Step 1: Tim 1 produces RawArticles
    const rawArticles: RawArticle[] = [
      {
        title: 'Next.js 16 Released',
        url: 'https://nextjs.org/blog',
        source: 'HackerNews',
        score: 500,
        commentCount: 200,
        description: 'Next.js 16 ships with Turbopack',
        publishedAt: '2026-03-01T00:00:00Z',
        category: 'Technology',
      },
    ];

    // Step 2: Tim 1 wraps in ScraperResult
    const scraperResult: ScraperResult = {
      source: 'HackerNews',
      articles: rawArticles,
      fetchedAt: new Date().toISOString(),
    };

    // Step 3: Tim 1 aggregates
    const aggregated: AggregatedData = {
      results: [scraperResult],
      totalArticles: rawArticles.length,
      fetchedAt: new Date().toISOString(),
    };

    // Step 4: Tim 2 produces DigestOutput
    const topic: DigestTopic = {
      category: 'Technology',
      headline: 'Next.js 16 Rilis dengan Turbopack Final',
      summary: 'Vercel merilis Next.js 16 dengan Turbopack yang stabil.',
      sentiment: 'Positive',
      relevanceScore: 9,
      sources: ['https://nextjs.org/blog'],
      emoji: '🚀',
    };

    const digest: DigestOutput = {
      date: '1 Maret 2026',
      topics: [topic],
      totalRawProcessed: aggregated.totalArticles,
      totalDiscarded: aggregated.totalArticles - 1,
    };

    // Step 5: Tim 3 produces DeliveryResults
    const deliveryResult: DeliveryResult = {
      channel: 'telegram',
      success: true,
      message: 'Sent 1 message to Telegram',
      timestamp: new Date().toISOString(),
    };

    // Step 6: Tim 8 assembles PipelineResult
    const pipelineResult: PipelineResult = {
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      scraping: aggregated,
      digest,
      deliveries: [deliveryResult],
      success: true,
    };

    // Assertions
    expect(pipelineResult.success).toBe(true);
    expect(pipelineResult.scraping.totalArticles).toBe(1);
    expect(pipelineResult.digest.topics).toHaveLength(1);
    expect(pipelineResult.deliveries[0]!.success).toBe(true);
  });
});

// ===== Test: AppConfig Validation =====
describe('AppConfig Contract', () => {
  it('should have all required fields', () => {
    const config: AppConfig = {
      groqApiKey: 'gsk_test',
      telegramBotToken: '123:ABC',
      telegramChatId: '456',
      discordWebhookUrl: 'https://discord.com/api/webhooks/test',
      maxTopics: 7,
      minRelevanceScore: 5,
      logLevel: 'info',
    };

    expect(config.groqApiKey).toBeTruthy();
    expect(config.telegramBotToken).toBeTruthy();
    expect(config.maxTopics).toBeGreaterThan(0);
    expect(config.maxTopics).toBeLessThanOrEqual(20);
    expect(config.minRelevanceScore).toBeGreaterThan(0);
    expect(config.minRelevanceScore).toBeLessThanOrEqual(10);
  });

  it('should allow optional Supabase fields', () => {
    const config: AppConfig = {
      groqApiKey: 'gsk_test',
      telegramBotToken: '123:ABC',
      telegramChatId: '456',
      discordWebhookUrl: 'https://discord.com/api/webhooks/test',
      maxTopics: 7,
      minRelevanceScore: 5,
      logLevel: 'info',
      // supabaseUrl and supabaseAnonKey are intentionally omitted
    };

    expect(config.supabaseUrl).toBeUndefined();
    expect(config.supabaseAnonKey).toBeUndefined();
  });
});

// ===== Test: Topic Categories & Sentiments =====
describe('Enum-like Type Validation', () => {
  it('should accept all valid categories', () => {
    const categories: DigestTopic['category'][] = [
      'Technology',
      'Business',
      'Science',
      'National',
      'Global',
      'Security',
      'AI & Machine Learning',
    ];

    expect(categories).toHaveLength(7);
  });

  it('should accept all valid sentiments', () => {
    const sentiments: DigestTopic['sentiment'][] = [
      'Positive',
      'Negative',
      'Neutral',
      'Mixed',
    ];

    expect(sentiments).toHaveLength(4);
  });
});
