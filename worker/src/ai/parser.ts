// ============================================
// OpenClaw Trend Digest — AI Response Parser (Worker Edition)
// Sama dengan versi sebelumnya — parser tidak bergantung runtime
// ============================================

import type { DigestOutput, DigestTopic, TopicCategory, Sentiment } from '../types/index.js';
import type { Logger } from '../utils/logger.js';

const VALID_CATEGORIES: TopicCategory[] = [
  'Technology', 'Business', 'Science', 'National', 'Global', 'Security', 'AI & Machine Learning',
];

const VALID_SENTIMENTS: Sentiment[] = ['Positive', 'Negative', 'Neutral', 'Mixed'];

const CATEGORY_EMOJIS: Record<TopicCategory, string> = {
  'Technology': '💻', 'Business': '💼', 'Science': '🔬',
  'National': '🇮🇩', 'Global': '🌍', 'Security': '🔒',
  'AI & Machine Learning': '🤖',
};

export function parseAIResponse(
  rawResponse: string,
  totalRawArticles: number,
  logger: Logger
): DigestOutput | null {
  try {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawResponse);
    } catch {
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

    const date = typeof data['date'] === 'string'
      ? data['date']
      : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    if (!Array.isArray(data['topics'])) {
      throw new Error('Missing "topics" array');
    }

    const topics: DigestTopic[] = [];

    for (const raw of data['topics'] as unknown[]) {
      const topic = validateTopic(raw);
      if (topic) topics.push(topic);
    }

    if (topics.length === 0) {
      logger.warn('Parser', 'No valid topics after validation');
      return null;
    }

    topics.sort((a, b) => b.relevanceScore - a.relevanceScore);

    const totalRawProcessed = typeof data['totalRawProcessed'] === 'number'
      ? data['totalRawProcessed'] : totalRawArticles;
    const totalDiscarded = typeof data['totalDiscarded'] === 'number'
      ? data['totalDiscarded'] : totalRawArticles - topics.length;

    logger.info('Parser', `✅ Validated ${topics.length} topics`);

    return { date, topics, totalRawProcessed, totalDiscarded };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown';
    logger.error('Parser', `Parse failed: ${msg}`);
    return null;
  }
}

function validateTopic(raw: unknown): DigestTopic | null {
  if (!raw || typeof raw !== 'object') return null;
  const t = raw as Record<string, unknown>;

  const headline = typeof t['headline'] === 'string' ? t['headline'].trim() : null;
  const summary = typeof t['summary'] === 'string' ? t['summary'].trim() : null;
  if (!headline || !summary) return null;

  const rawCat = typeof t['category'] === 'string' ? t['category'] : 'Technology';
  const category: TopicCategory = VALID_CATEGORIES.includes(rawCat as TopicCategory)
    ? (rawCat as TopicCategory) : 'Technology';

  const rawSent = typeof t['sentiment'] === 'string' ? t['sentiment'] : 'Neutral';
  const sentiment: Sentiment = VALID_SENTIMENTS.includes(rawSent as Sentiment)
    ? (rawSent as Sentiment) : 'Neutral';

  const rawScore = typeof t['relevanceScore'] === 'number'
    ? t['relevanceScore']
    : (typeof t['relevance_score'] === 'number' ? t['relevance_score'] : 5);
  const relevanceScore = Math.min(10, Math.max(1, Math.round(rawScore)));

  const rawSources = Array.isArray(t['sources']) ? t['sources'] : [];
  const sources = rawSources
    .filter((s): s is string => typeof s === 'string' && s.startsWith('http'))
    .slice(0, 5);

  const emoji = typeof t['emoji'] === 'string' ? t['emoji'] : CATEGORY_EMOJIS[category];

  return { category, headline, summary, sentiment, relevanceScore, sources, emoji };
}
