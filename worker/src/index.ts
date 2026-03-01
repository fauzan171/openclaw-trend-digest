// ============================================
// OpenClaw Trend Digest — Cloudflare Worker Entry Point
// Tim 8: System Architect (Cloudflare Edition)
// ============================================
//
// Ini menggantikan:
//   - src/index.ts (main pipeline)
//   - GitHub Actions cron job
//   - Express/Hono API server
//
// Cloudflare Worker = 3 in 1:
//   1. scheduled() → Cron job (setiap hari 06:00 WIB)
//   2. fetch()     → REST API (untuk frontend)
//   3. D1 binding  → Database (tanpa external service)
// ============================================

import type { Env, RawArticle, PipelineResult } from './types/index.js';
import { createLogger } from './utils/logger.js';
import { runAllScrapers } from './scrapers/index.js';
import { runAICuration } from './ai/summarizer.js';
import { deliverDigest } from './delivery/index.js';
import { handleAPIRequest } from './api/routes.js';

/**
 * Main pipeline — sama logicnya dengan versi Node.js.
 * Dipanggil oleh scheduled() cron trigger.
 */
async function runPipeline(env: Env): Promise<PipelineResult> {
  const logger = createLogger(env.LOG_LEVEL);
  const startedAt = new Date().toISOString();

  logger.separator('☀️ OPENCLAW TREND DIGEST — Cloudflare Worker');
  logger.info('Pipeline', 'Starting daily digest pipeline...');

  // Phase 1: Scrape
  const scrapingResult = await runAllScrapers(logger);

  if (scrapingResult.totalArticles === 0) {
    logger.error('Pipeline', '🚨 No articles collected');
    return {
      startedAt,
      completedAt: new Date().toISOString(),
      scraping: scrapingResult,
      digest: { date: new Date().toLocaleDateString('id-ID'), topics: [], totalRawProcessed: 0, totalDiscarded: 0 },
      deliveries: [],
      success: false,
    };
  }

  // Phase 1.5: Deduplicate by URL
  const allArticles: RawArticle[] = scrapingResult.results.flatMap(r => r.articles);
  const seen = new Set<string>();
  const unique = allArticles.filter(a => {
    const norm = a.url.toLowerCase().replace(/\/$/, '');
    if (seen.has(norm)) return false;
    seen.add(norm);
    return true;
  });

  logger.info('Pipeline', `📊 ${allArticles.length} total → ${unique.length} unique articles`);

  // Phase 2: AI Curation
  const digest = await runAICuration(unique, env, logger);

  // Phase 3: Deliver
  const deliveries = await deliverDigest(digest, env, logger);

  // Report
  const completedAt = new Date().toISOString();
  const durationMs = new Date(completedAt).getTime() - new Date(startedAt).getTime();

  logger.separator('PIPELINE COMPLETE');
  logger.info('Pipeline', `⏱️ Duration: ${(durationMs / 1000).toFixed(1)}s`);
  logger.info('Pipeline', `📰 Scraped: ${scrapingResult.totalArticles}`);
  logger.info('Pipeline', `🧠 Curated: ${digest.topics.length} topics`);
  logger.info('Pipeline', `📡 Delivered: ${deliveries.filter(d => d.success).length}/${deliveries.length}`);

  return {
    startedAt,
    completedAt,
    scraping: scrapingResult,
    digest,
    deliveries,
    success: digest.topics.length > 0 && deliveries.some(d => d.success),
  };
}

// ============================================
// WORKER EXPORT — Cloudflare Workers entry point
// ============================================

export default {
  /**
   * HTTP Request Handler — REST API untuk frontend.
   *
   * Routes:
   *   GET /api/digests            → List digests
   *   GET /api/digests/:date      → Digest by date
   *   GET /api/topics?category=X  → Filter topics
   *   GET /api/stats              → Statistics
   *   GET /api/health             → Health check
   *   POST /api/trigger           → Manual trigger (development)
   */
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // API routes
    const apiResponse = await handleAPIRequest(request, env);
    if (apiResponse) return apiResponse;

    // POST /api/trigger — manual trigger untuk development
    if (request.method === 'POST' && url.pathname === '/api/trigger') {
      const logger = createLogger(env.LOG_LEVEL);
      logger.info('Trigger', '🔧 Manual pipeline trigger via HTTP');

      try {
        const result = await runPipeline(env);
        return new Response(JSON.stringify(result, null, 2), {
          status: result.success ? 200 : 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return new Response(JSON.stringify({ error: msg }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Default: Welcome page
    return new Response(
      JSON.stringify({
        name: 'OpenClaw Trend Digest',
        version: '2.0.0',
        description: 'AI-Powered Tech & News Curator',
        runtime: 'Cloudflare Workers',
        endpoints: {
          health: '/api/health',
          digests: '/api/digests',
          digest_by_date: '/api/digests/2026-03-01',
          topics: '/api/topics?category=Technology',
          stats: '/api/stats',
          trigger: 'POST /api/trigger',
        },
      }, null, 2),
      { headers: { 'Content-Type': 'application/json' } }
    );
  },

  /**
   * Cron Trigger Handler — berjalan otomatis setiap hari.
   *
   * Dikonfigurasi di wrangler.toml:
   *   [triggers]
   *   crons = ["0 23 * * *"]  → 06:00 WIB
   */
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    const logger = createLogger(env.LOG_LEVEL);
    logger.info('Cron', `⏰ Scheduled trigger at ${new Date(controller.scheduledTime).toISOString()}`);

    // waitUntil memastikan pipeline selesai meskipun response sudah dikirim
    ctx.waitUntil(
      runPipeline(env)
        .then(result => {
          logger.info('Cron', result.success ? '✅ Pipeline SUCCESS' : '⚠️ Pipeline completed with issues');
        })
        .catch(error => {
          logger.error('Cron', `💀 Fatal: ${error}`);
        })
    );
  },
} satisfies ExportedHandler<Env>;
