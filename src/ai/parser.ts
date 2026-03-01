// ============================================
// OpenClaw Trend Digest — AI Response Parser & Validator
// Tim 2: AI Engineering Team
// ============================================

import type { DigestOutput, DigestTopic, TopicCategory, Sentiment } from '../types/index.js';
import { logger } from '../utils/logger.js';

/**
 * Kategori yang valid sesuai type definition.
 */
const VALID_CATEGORIES: TopicCategory[] = [
  'Technology',
  'Business',
  'Science',
  'National',
  'Global',
  'Security',
  'AI & Machine Learning',
];

/**
 * Sentimen yang valid sesuai type definition.
 */
const VALID_SENTIMENTS: Sentiment[] = ['Positive', 'Negative', 'Neutral', 'Mixed'];

/**
 * Parse dan validasi response JSON dari AI.
 *
 * Kenapa manual parsing + validasi dan bukan Zod?
 * → Untuk menjaga zero-dependency approach pada modul ini.
 *   Tapi kita tetap melakukan validasi ketat secara manual.
 *   Di production, bisa upgrade ke Zod jika project makin besar.
 */
export function parseAIResponse(
  rawResponse: string,
  totalRawArticles: number
): DigestOutput | null {
  try {
    // Step 1: Parse JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawResponse);
    } catch {
      // Kadang AI menambahkan markdown code block wrapping
      const jsonMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch?.[1]) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse JSON from AI response');
      }
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('AI response is not a valid object');
    }

    const data = parsed as Record<string, unknown>;

    // Step 2: Validate top-level fields
    const date = typeof data['date'] === 'string' ? data['date'] : new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    if (!Array.isArray(data['topics'])) {
      throw new Error('Missing or invalid "topics" array in AI response');
    }

    // Step 3: Validate each topic
    const validatedTopics: DigestTopic[] = [];

    for (const rawTopic of data['topics'] as unknown[]) {
      const topic = validateTopic(rawTopic);
      if (topic) {
        validatedTopics.push(topic);
      }
    }

    if (validatedTopics.length === 0) {
      logger.warn('Parser', 'AI returned topics but none passed validation');
      return null;
    }

    // Step 4: Sort by relevance score descending
    validatedTopics.sort((a, b) => b.relevanceScore - a.relevanceScore);

    const totalRawProcessed = typeof data['totalRawProcessed'] === 'number'
      ? data['totalRawProcessed']
      : totalRawArticles;

    const totalDiscarded = typeof data['totalDiscarded'] === 'number'
      ? data['totalDiscarded']
      : totalRawArticles - validatedTopics.length;

    logger.info('Parser', `✅ Validated ${validatedTopics.length} topics from AI response`);

    return {
      date,
      topics: validatedTopics,
      totalRawProcessed,
      totalDiscarded,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
    logger.error('Parser', `Failed to parse AI response: ${errorMessage}`);
    logger.debug('Parser', 'Raw response:', rawResponse.slice(0, 500));
    return null;
  }
}

/**
 * Validasi satu topic individual.
 */
function validateTopic(raw: unknown): DigestTopic | null {
  if (!raw || typeof raw !== 'object') return null;

  const topic = raw as Record<string, unknown>;

  // Required fields
  const headline = typeof topic['headline'] === 'string' ? topic['headline'].trim() : null;
  const summary = typeof topic['summary'] === 'string' ? topic['summary'].trim() : null;

  if (!headline || !summary) {
    logger.debug('Parser', 'Skipping topic: missing headline or summary');
    return null;
  }

  // Category with fallback
  const rawCategory = typeof topic['category'] === 'string' ? topic['category'] : 'Technology';
  const category: TopicCategory = VALID_CATEGORIES.includes(rawCategory as TopicCategory)
    ? (rawCategory as TopicCategory)
    : 'Technology';

  // Sentiment with fallback
  const rawSentiment = typeof topic['sentiment'] === 'string' ? topic['sentiment'] : 'Neutral';
  const sentiment: Sentiment = VALID_SENTIMENTS.includes(rawSentiment as Sentiment)
    ? (rawSentiment as Sentiment)
    : 'Neutral';

  // Relevance score with bounds
  const rawScore = typeof topic['relevanceScore'] === 'number'
    ? topic['relevanceScore']
    : (typeof topic['relevance_score'] === 'number' ? topic['relevance_score'] : 5);
  const relevanceScore = Math.min(10, Math.max(1, Math.round(rawScore)));

  // Sources array
  const rawSources = Array.isArray(topic['sources']) ? topic['sources'] : [];
  const sources = rawSources
    .filter((s): s is string => typeof s === 'string' && s.startsWith('http'))
    .slice(0, 5); // Max 5 sources per topic

  // Emoji with fallback based on category
  const emoji = typeof topic['emoji'] === 'string'
    ? topic['emoji']
    : getCategoryEmoji(category);

  return {
    category,
    headline,
    summary,
    sentiment,
    relevanceScore,
    sources,
    emoji,
  };
}

/**
 * Fallback emoji berdasarkan kategori.
 */
function getCategoryEmoji(category: TopicCategory): string {
  const emojiMap: Record<TopicCategory, string> = {
    'Technology': '💻',
    'Business': '💼',
    'Science': '🔬',
    'National': '🇮🇩',
    'Global': '🌍',
    'Security': '🔒',
    'AI & Machine Learning': '🤖',
  };
  return emojiMap[category] ?? '📰';
}
