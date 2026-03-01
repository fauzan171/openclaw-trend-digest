// ============================================
// OpenClaw Trend Digest — API Routes (Worker Edition)
// REST API yang bisa dikonsumsi oleh frontend
// ============================================
//
// Ini adalah BONUS dari migrasi ke Cloudflare Workers.
// Sebelumnya: frontend langsung query Supabase (expose anon key)
// Sekarang: frontend fetch API Worker (lebih aman, lebih cepat)
//
// ENDPOINTS:
//   GET /api/digests            → List semua digests
//   GET /api/digests/:date      → Digest by date
//   GET /api/topics?category=X  → Topics by category
//   GET /api/stats              → Dashboard statistics
//   GET /api/health             → Health check
// ============================================

import type { Env } from '../types/index.js';
import { getDigests, getDigestByDate, getTopicsByCategory, getStats } from '../database/d1.js';

/**
 * CORS headers — agar frontend bisa fetch dari domain berbeda.
 */
function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(),
  });
}

function errorResponse(message: string, status = 500): Response {
  return jsonResponse({ error: message, status }, status);
}

/**
 * Route handler — dipanggil dari Worker fetch handler.
 */
export async function handleAPIRequest(
  request: Request,
  env: Env
): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname;

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  // Only handle GET requests to /api/*
  if (request.method !== 'GET' || !path.startsWith('/api/')) {
    return null; // Not an API request
  }

  try {
    // GET /api/health
    if (path === '/api/health') {
      return jsonResponse({
        status: 'ok',
        service: 'OpenClaw Trend Digest',
        version: '2.0.0',
        runtime: 'Cloudflare Workers',
        timestamp: new Date().toISOString(),
      });
    }

    // GET /api/stats
    if (path === '/api/stats') {
      const stats = await getStats(env.DB);
      return jsonResponse(stats);
    }

    // GET /api/digests
    if (path === '/api/digests') {
      const limit = parseInt(url.searchParams.get('limit') ?? '30', 10);
      const digests = await getDigests(env.DB, Math.min(limit, 100));
      return jsonResponse({ data: digests, count: digests.length });
    }

    // GET /api/digests/:date (e.g., /api/digests/2026-03-01)
    const digestMatch = path.match(/^\/api\/digests\/(\d{4}-\d{2}-\d{2})$/);
    if (digestMatch?.[1]) {
      const digest = await getDigestByDate(env.DB, digestMatch[1]);
      if (!digest) return errorResponse('Digest not found', 404);
      return jsonResponse(digest);
    }

    // GET /api/topics?category=Technology
    if (path === '/api/topics') {
      const category = url.searchParams.get('category');
      if (!category) return errorResponse('Missing ?category= parameter', 400);
      const limit = parseInt(url.searchParams.get('limit') ?? '50', 10);
      const topics = await getTopicsByCategory(env.DB, category, Math.min(limit, 200));
      return jsonResponse({ data: topics, count: topics.length });
    }

    return errorResponse('Not Found', 404);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return errorResponse(msg, 500);
  }
}
