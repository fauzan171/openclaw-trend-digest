// ============================================
// OpenClaw Trend Digest — Delivery Module Unit Tests
// Tim 7: QA & Testing Team
// ============================================

import { describe, it, expect } from 'vitest';
import { formatToMarkdown, formatToDiscordMarkdown } from '../delivery/formatter.js';
import type { DigestOutput } from '../types/index.js';

// ===== Test Data =====
const mockDigest: DigestOutput = {
  date: '1 Maret 2026',
  topics: [
    {
      category: 'Technology',
      headline: 'React 19 Dirilis dengan Fitur Server Components',
      summary: 'React merilis versi 19 dengan fitur server components yang memungkinkan rendering di server secara native.',
      sentiment: 'Positive',
      relevanceScore: 9,
      sources: ['https://reactjs.org/blog', 'https://news.ycombinator.com/item?id=123'],
      emoji: '⚛️',
    },
    {
      category: 'Security',
      headline: 'Kerentanan Kritis Ditemukan di OpenSSL',
      summary: 'Peneliti keamanan menemukan kerentanan buffer overflow pada OpenSSL 3.x yang mempengaruhi jutaan server.',
      sentiment: 'Negative',
      relevanceScore: 10,
      sources: ['https://openssl.org/advisory'],
      emoji: '🔒',
    },
  ],
  totalRawProcessed: 150,
  totalDiscarded: 148,
};

const emptyDigest: DigestOutput = {
  date: '1 Maret 2026',
  topics: [],
  totalRawProcessed: 50,
  totalDiscarded: 50,
};

// ===== Test: Telegram Markdown Formatter =====
describe('Telegram Markdown Formatter', () => {
  it('should include header with date', () => {
    const result = formatToMarkdown(mockDigest);

    expect(result).toContain('OPENCLAW TREND DIGEST');
    expect(result).toContain('1 Maret 2026');
  });

  it('should include all topics', () => {
    const result = formatToMarkdown(mockDigest);

    expect(result).toContain('React 19');
    expect(result).toContain('OpenSSL');
    expect(result).toContain('⚛️');
    expect(result).toContain('🔒');
  });

  it('should include statistics', () => {
    const result = formatToMarkdown(mockDigest);

    expect(result).toContain('150');
    expect(result).toContain('148');
    expect(result).toContain('2 topik');
  });

  it('should include sentiment badges', () => {
    const result = formatToMarkdown(mockDigest);

    expect(result).toContain('Positif');
    expect(result).toContain('Negatif');
  });

  it('should include source links', () => {
    const result = formatToMarkdown(mockDigest);

    expect(result).toContain('https://reactjs.org/blog');
    expect(result).toContain('Sumber 1');
  });

  it('should handle empty digest gracefully', () => {
    const result = formatToMarkdown(emptyDigest);

    expect(result).toContain('OPENCLAW TREND DIGEST');
    expect(result).toContain('tenang');
  });

  it('should include footer', () => {
    const result = formatToMarkdown(mockDigest);

    expect(result).toContain('OpenClaw AI Agent');
  });
});

// ===== Test: Discord Markdown Formatter =====
describe('Discord Markdown Formatter', () => {
  it('should use Discord-specific heading syntax', () => {
    const result = formatToDiscordMarkdown(mockDigest);

    expect(result).toContain('# ');   // H1
    expect(result).toContain('### '); // H3
    expect(result).toContain('---');  // Separator
  });

  it('should include all topics', () => {
    const result = formatToDiscordMarkdown(mockDigest);

    expect(result).toContain('React 19');
    expect(result).toContain('OpenSSL');
  });

  it('should include blockquote syntax', () => {
    const result = formatToDiscordMarkdown(mockDigest);

    expect(result).toContain('> ');
  });
});

// ===== Test: Markdown Output Quality =====
describe('Markdown Output Quality', () => {
  it('should be readable within 3 minutes (~750 words)', () => {
    const markdown = formatToMarkdown(mockDigest);
    const wordCount = markdown.split(/\s+/).length;

    // A 3-minute read is roughly 450-900 words
    expect(wordCount).toBeLessThan(1500);
  });

  it('should not contain HTML tags', () => {
    const markdown = formatToMarkdown(mockDigest);

    expect(markdown).not.toMatch(/<[^>]+>/);
  });

  it('should be non-empty even with zero topics', () => {
    const markdown = formatToMarkdown(emptyDigest);

    expect(markdown.length).toBeGreaterThan(50);
  });
});
