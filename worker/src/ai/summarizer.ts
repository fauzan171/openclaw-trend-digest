// ============================================
// OpenClaw Trend Digest — AI Summarizer (Worker Edition)
// Direct fetch ke Groq REST API — tanpa groq-sdk
// ============================================
//
// Kenapa tanpa SDK?
// → Cloudflare Workers memiliki native fetch yang super cepat.
// → Groq SDK menambah ~200KB bundle dan Node.js deps.
// → Direct fetch = lighter, faster, zero dependencies.
// ============================================

import type { RawArticle, DigestOutput, Env } from '../types/index.js';
import type { Logger } from '../utils/logger.js';
import { buildSystemPrompt, formatRawDataForAI } from './prompts.js';
import { parseAIResponse } from './parser.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const PRIMARY_MODEL = 'llama-3.3-70b-versatile';
const FALLBACK_MODEL = 'llama-3.1-8b-instant';

interface GroqResponse {
  choices: Array<{
    message: { content: string };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Panggil Groq API langsung via fetch.
 */
async function callGroqAPI(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userMessage: string,
  logger: Logger
): Promise<string | null> {
  logger.info('AI', `🤖 Calling Groq: ${model}`);

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 4096,
      top_p: 0.9,
      response_format: { type: 'json_object' },
    }),
    signal: AbortSignal.timeout(60000), // 60s timeout
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Groq API ${res.status}: ${errorBody}`);
  }

  const data = await res.json() as GroqResponse;

  if (data.usage) {
    logger.info('AI', `📊 Tokens: ${data.usage.prompt_tokens} prompt + ${data.usage.completion_tokens} completion = ${data.usage.total_tokens} total`);
  }

  return data.choices[0]?.message?.content ?? null;
}

/**
 * Menjalankan AI curation pipeline.
 */
export async function runAICuration(
  articles: RawArticle[],
  env: Env,
  logger: Logger
): Promise<DigestOutput> {
  logger.separator('PHASE 2: AI CURATION');

  if (articles.length === 0) {
    logger.error('AI', 'No articles to process');
    return {
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      topics: [],
      totalRawProcessed: 0,
      totalDiscarded: 0,
    };
  }

  const endTimer = logger.startTimer('AI', `Processing ${articles.length} articles`);

  const maxTopics = parseInt(env.MAX_TOPICS ?? '7', 10);
  const minRelevance = parseInt(env.MIN_RELEVANCE_SCORE ?? '5', 10);

  const systemPrompt = buildSystemPrompt(maxTopics, minRelevance);

  // Mencegah melebihi batas limit Groq API (Free Tier = 6000 TPM)
  // Memotong menjadi 75 artikel akan menghasilkan ~5500 token.
  // Ini cukup untuk menghasilkan lebih dari 10 topik (seperti yang diminta user)
  const limitedArticles = articles.slice(0, 75);
  const userMessage = formatRawDataForAI(limitedArticles);

  logger.info('AI', `Prompt: ${systemPrompt.length} chars | Data: ${userMessage.length} chars (~${Math.ceil(userMessage.length / 4)} tokens)`);

  // Try primary model, then fallback
  for (const model of [PRIMARY_MODEL, FALLBACK_MODEL]) {
    try {
      const rawResponse = await callGroqAPI(env.GROQ_API_KEY, model, systemPrompt, userMessage, logger);

      if (!rawResponse) {
        logger.warn('AI', `Empty response from ${model}`);
        continue;
      }

      const digest = parseAIResponse(rawResponse, articles.length, logger);

      if (digest) {
        logger.info('AI', `✅ Curated ${digest.topics.length} topics using ${model}`);
        endTimer();
        return digest;
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown';
      logger.error('AI', `Failed ${model}: ${msg}`);

      if (model === FALLBACK_MODEL) {
        throw new Error(`All AI models failed. Last: ${msg}`);
      }
      logger.info('AI', `Retrying with ${FALLBACK_MODEL}...`);
    }
  }

  endTimer();
  throw new Error('AI curation produced no valid output');
}
