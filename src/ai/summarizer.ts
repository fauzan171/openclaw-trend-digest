// ============================================
// OpenClaw Trend Digest — AI Summarizer (Groq Integration)
// Tim 2: AI Engineering Team
// ============================================

import Groq from 'groq-sdk';
import type { RawArticle, DigestOutput, AppConfig } from '../types/index.js';
import { buildSystemPrompt, formatRawDataForAI } from './prompts.js';
import { parseAIResponse } from './parser.js';
import { logger } from '../utils/logger.js';

/**
 * Model yang digunakan — Groq menyediakan inference super cepat.
 * llama3-70b-8192 = model terbesar, paling akurat
 * llama-3.1-8b-instant = fallback yang lebih cepat
 */
const PRIMARY_MODEL = 'llama-3.3-70b-versatile';
const FALLBACK_MODEL = 'llama-3.1-8b-instant';

/**
 * Menjalankan AI curation pipeline.
 *
 * Flow:
 * 1. Format raw articles menjadi teks yang efisien token
 * 2. Kirim ke Groq API dengan system prompt yang ketat
 * 3. Parse response JSON dari AI
 * 4. Validasi struktur output
 * 5. Jika gagal, retry dengan fallback model
 */
export async function runAICuration(
  articles: RawArticle[],
  config: AppConfig
): Promise<DigestOutput> {
  logger.separator('PHASE 2: AI CURATION (The Brain)');

  if (articles.length === 0) {
    logger.error('AI', 'No articles to process! Returning empty digest.');
    return {
      date: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      topics: [],
      totalRawProcessed: 0,
      totalDiscarded: 0,
    };
  }

  const endTimer = logger.startTimer('AI', `Processing ${articles.length} articles through LLM`);

  // Step 1: Prepare input data
  const systemPrompt = buildSystemPrompt(config.maxTopics, config.minRelevanceScore);
  const userMessage = formatRawDataForAI(articles);

  logger.info('AI', `System prompt: ${systemPrompt.length} chars`);
  logger.info('AI', `User message: ${userMessage.length} chars (~${Math.ceil(userMessage.length / 4)} tokens est.)`);

  // Step 2: Try primary model, then fallback
  const groq = new Groq({ apiKey: config.groqApiKey });

  let digest: DigestOutput | null = null;

  for (const model of [PRIMARY_MODEL, FALLBACK_MODEL]) {
    try {
      logger.info('AI', `🤖 Calling Groq API with model: ${model}`);

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        model,
        temperature: 0.3, // Low temperature for consistent, factual output
        max_tokens: 4096,
        top_p: 0.9,
        response_format: { type: 'json_object' }, // Force JSON mode
      });

      const rawResponse = chatCompletion.choices[0]?.message?.content;

      if (!rawResponse) {
        logger.warn('AI', `Empty response from ${model}, trying next model...`);
        continue;
      }

      logger.debug('AI', `Raw response length: ${rawResponse.length} chars`);

      // Step 3: Parse and validate
      digest = parseAIResponse(rawResponse, articles.length);

      if (digest) {
        logger.info('AI', `✅ Successfully curated ${digest.topics.length} topics using ${model}`);
        logger.info('AI', `📊 Stats: ${digest.totalRawProcessed} processed, ${digest.totalDiscarded} discarded`);
        break;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('AI', `Failed with model ${model}: ${errorMessage}`);

      if (model === FALLBACK_MODEL) {
        throw new Error(`All AI models failed. Last error: ${errorMessage}`);
      }

      logger.info('AI', `Retrying with fallback model: ${FALLBACK_MODEL}`);
    }
  }

  endTimer();

  if (!digest) {
    throw new Error('AI curation produced no valid output after all attempts.');
  }

  return digest;
}
