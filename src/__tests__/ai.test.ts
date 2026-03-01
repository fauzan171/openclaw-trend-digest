// ============================================
// OpenClaw Trend Digest — AI Module Unit Tests
// Tim 7: QA & Testing Team
// ============================================

import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, formatRawDataForAI } from '../ai/prompts.js';
import { parseAIResponse } from '../ai/parser.js';

// ===== Test: Prompt Builder =====
describe('AI Prompt Builder', () => {
  it('should build system prompt with correct max topics', () => {
    const prompt = buildSystemPrompt(7, 5);

    expect(prompt).toContain('Editor-in-Chief');
    expect(prompt).toContain('7');
    expect(prompt).toContain('5');
    expect(prompt).toContain('JSON');
  });

  it('should include category options in prompt', () => {
    const prompt = buildSystemPrompt(5, 3);

    expect(prompt).toContain('Technology');
    expect(prompt).toContain('Business');
    expect(prompt).toContain('Science');
    expect(prompt).toContain('Security');
    expect(prompt).toContain('AI & Machine Learning');
  });

  it('should include negative instructions', () => {
    const prompt = buildSystemPrompt(5, 3);

    expect(prompt).toContain('MUST NOT');
    expect(prompt).toContain('gossip');
    expect(prompt).toContain('clickbait');
  });
});

// ===== Test: Raw Data Formatter =====
describe('Raw Data Formatter', () => {
  it('should format articles into numbered list', () => {
    const articles = [
      {
        title: 'React 19 Released',
        url: 'https://reactjs.org/blog',
        source: 'HackerNews',
        score: 500,
        description: 'React 19 introduces new features...',
      },
      {
        title: 'Node.js 22 LTS',
        url: 'https://nodejs.org/blog',
        source: 'TechCrunch',
      },
    ];

    const formatted = formatRawDataForAI(articles);

    expect(formatted).toContain('[1]');
    expect(formatted).toContain('[2]');
    expect(formatted).toContain('React 19 Released');
    expect(formatted).toContain('Node.js 22 LTS');
    expect(formatted).toContain('2 articles');
  });

  it('should handle empty articles array', () => {
    const formatted = formatRawDataForAI([]);
    expect(formatted).toContain('0 articles');
  });

  it('should truncate long descriptions to save tokens', () => {
    const longDesc = 'A'.repeat(500);
    const articles = [
      {
        title: 'Test',
        url: 'https://test.com',
        source: 'Test',
        description: longDesc,
      },
    ];

    const formatted = formatRawDataForAI(articles);
    // Description should be truncated to 200 chars
    expect(formatted.length).toBeLessThan(longDesc.length + 200);
  });
});

// ===== Test: AI Response Parser =====
describe('AI Response Parser', () => {
  it('should parse valid JSON response', () => {
    const validResponse = JSON.stringify({
      date: '1 Maret 2026',
      topics: [
        {
          category: 'Technology',
          headline: 'React 19 Released',
          summary: 'React 19 introduces new features including server components.',
          sentiment: 'Positive',
          relevanceScore: 9,
          sources: ['https://reactjs.org/blog'],
          emoji: '⚛️',
        },
      ],
      totalRawProcessed: 150,
      totalDiscarded: 149,
    });

    const result = parseAIResponse(validResponse, 150);

    expect(result).not.toBeNull();
    expect(result!.topics).toHaveLength(1);
    expect(result!.topics[0]!.headline).toBe('React 19 Released');
    expect(result!.topics[0]!.category).toBe('Technology');
    expect(result!.topics[0]!.sentiment).toBe('Positive');
    expect(result!.topics[0]!.relevanceScore).toBe(9);
  });

  it('should handle JSON wrapped in markdown code blocks', () => {
    const wrappedResponse = '```json\n{"date":"1 Maret 2026","topics":[{"category":"Technology","headline":"Test","summary":"Test summary","sentiment":"Neutral","relevanceScore":7,"sources":[],"emoji":"💻"}],"totalRawProcessed":10,"totalDiscarded":9}\n```';

    const result = parseAIResponse(wrappedResponse, 10);

    expect(result).not.toBeNull();
    expect(result!.topics).toHaveLength(1);
  });

  it('should return null for completely invalid JSON', () => {
    const result = parseAIResponse('this is not json at all', 10);
    expect(result).toBeNull();
  });

  it('should filter out topics with missing required fields', () => {
    const response = JSON.stringify({
      date: '1 Maret 2026',
      topics: [
        {
          category: 'Technology',
          headline: 'Valid Topic',
          summary: 'This is valid.',
          sentiment: 'Neutral',
          relevanceScore: 7,
          sources: [],
          emoji: '💻',
        },
        {
          // Missing headline and summary
          category: 'Business',
          sources: [],
        },
      ],
      totalRawProcessed: 10,
      totalDiscarded: 8,
    });

    const result = parseAIResponse(response, 10);

    expect(result).not.toBeNull();
    expect(result!.topics).toHaveLength(1); // Invalid topic filtered out
    expect(result!.topics[0]!.headline).toBe('Valid Topic');
  });

  it('should clamp relevance scores to valid range', () => {
    const response = JSON.stringify({
      date: '1 Maret 2026',
      topics: [
        {
          category: 'Technology',
          headline: 'Test',
          summary: 'Test',
          sentiment: 'Neutral',
          relevanceScore: 15, // Over max
          sources: [],
          emoji: '💻',
        },
      ],
      totalRawProcessed: 1,
      totalDiscarded: 0,
    });

    const result = parseAIResponse(response, 1);
    expect(result!.topics[0]!.relevanceScore).toBe(10); // Clamped to 10
  });

  it('should fallback invalid categories to Technology', () => {
    const response = JSON.stringify({
      date: '1 Maret 2026',
      topics: [
        {
          category: 'InvalidCategory',
          headline: 'Test',
          summary: 'Test',
          sentiment: 'Neutral',
          relevanceScore: 5,
          sources: [],
          emoji: '💻',
        },
      ],
      totalRawProcessed: 1,
      totalDiscarded: 0,
    });

    const result = parseAIResponse(response, 1);
    expect(result!.topics[0]!.category).toBe('Technology');
  });

  it('should sort topics by relevance score descending', () => {
    const response = JSON.stringify({
      date: '1 Maret 2026',
      topics: [
        { category: 'Technology', headline: 'Low', summary: 'Low score', sentiment: 'Neutral', relevanceScore: 3, sources: [], emoji: '💻' },
        { category: 'Technology', headline: 'High', summary: 'High score', sentiment: 'Positive', relevanceScore: 9, sources: [], emoji: '🚀' },
        { category: 'Business', headline: 'Mid', summary: 'Mid score', sentiment: 'Mixed', relevanceScore: 6, sources: [], emoji: '💼' },
      ],
      totalRawProcessed: 10,
      totalDiscarded: 7,
    });

    const result = parseAIResponse(response, 10);

    expect(result!.topics[0]!.headline).toBe('High');
    expect(result!.topics[1]!.headline).toBe('Mid');
    expect(result!.topics[2]!.headline).toBe('Low');
  });
});
