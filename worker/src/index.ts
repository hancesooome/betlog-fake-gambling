/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * BETLOG Live Baccarat — Cloudflare Worker Entry Point
 *
 * Routes:
 *   GET  /api/live     → Full table state (polled every 2s by frontend)
 *   GET  /api/round/:n → Get any specific historical round by number
 *   GET  /api/health   → Health check
 *   OPTIONS *          → CORS preflight
 *
 * All responses are JSON with CORS headers, no-cache enforced.
 *
 * Architecture notes:
 *  - State is 100% deterministic from server time — no KV or DO needed for MVP.
 *  - This worker can be deployed to any number of Cloudflare PoPs and all
 *    edges will return identical state for the same second window.
 *  - Future: replace getCurrentState() call with a Durable Object to support
 *    persistent chat, per-user session bets, and multi-table management.
 */

import { generateRound } from './baccarat';
import { computeStats, generateHistory, generateRoadmap } from './roadmap';
import { getCurrentState } from './state';
import type { Env } from './types';

// ─── CORS ─────────────────────────────────────────────────────────────────────

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
  'Access-Control-Max-Age':       '86400',
};

const JSON_HEADERS: Record<string, string> = {
  'Content-Type':  'application/json; charset=utf-8',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma':        'no-cache',
  'Expires':       '0',
  ...CORS_HEADERS,
};

// ─── Response Helpers ─────────────────────────────────────────────────────────

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS,
  });
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message, status }, status);
}

// ─── Route Handlers ───────────────────────────────────────────────────────────

/**
 * GET /api/live
 * Returns the current live table state derived from server time.
 * Frontend polls this every 2 seconds.
 */
function handleLive(env: Env): Response {
  const state = getCurrentState(Date.now(), env);
  return jsonResponse(state);
}

/**
 * GET /api/live/stats
 * Returns roadmap statistics: win percentages, current streak, longest streak.
 */
function handleStats(env: Env): Response {
  const state   = getCurrentState(Date.now(), env);
  const stats   = computeStats(state.roadmap);
  return jsonResponse({ round: state.round, ...stats });
}

/**
 * GET /api/round/:n
 * Returns the full data for any completed round by number.
 * Useful for auditing, replay, or debugging.
 */
function handleRound(roundParam: string): Response {
  const n = parseInt(roundParam, 10);
  if (isNaN(n) || n < 0) {
    return errorResponse('Invalid round number. Must be a non-negative integer.');
  }

  const nowRound = Math.floor(Date.now() / 1000 / 30);
  if (n >= nowRound) {
    return errorResponse(`Round ${n} has not completed yet. Current round is ${nowRound}.`, 404);
  }

  const roundData = generateRound(n);
  return jsonResponse(roundData);
}

/**
 * GET /api/history?count=20
 * Returns recent completed round history. Default 20, max 50.
 */
function handleHistory(url: URL): Response {
  const countParam = url.searchParams.get('count');
  const count = Math.min(50, Math.max(1, parseInt(countParam ?? '20', 10) || 20));

  const nowRound = Math.floor(Date.now() / 1000 / 30);
  const history  = generateHistory(nowRound, count);
  return jsonResponse({ count: history.length, history });
}

/**
 * GET /api/roadmap?count=100
 * Returns the bead plate roadmap. Default 100, max 200.
 */
function handleRoadmap(url: URL): Response {
  const countParam = url.searchParams.get('count');
  const count = Math.min(200, Math.max(1, parseInt(countParam ?? '100', 10) || 100));

  const nowRound = Math.floor(Date.now() / 1000 / 30);
  const roadmap  = generateRoadmap(nowRound, count);
  const stats    = computeStats(roadmap);
  return jsonResponse({ count: roadmap.length, roadmap, stats });
}

/**
 * GET /api/health
 * Health check for uptime monitoring and deployment verification.
 */
function handleHealth(env: Env): Response {
  const nowMs   = Date.now();
  const nowRound = Math.floor(nowMs / 1000 / 30);
  const state   = getCurrentState(nowMs, env);

  return jsonResponse({
    status:      'ok',
    service:     'betlog-baccarat-worker',
    version:     '1.0.0',
    environment: env.ENVIRONMENT ?? 'unknown',
    tableId:     state.tableId,
    round:       nowRound,
    phase:       state.phase,
    serverTime:  nowMs,
    timestamp:   new Date(nowMs).toISOString(),
  });
}

// ─── Router ───────────────────────────────────────────────────────────────────

function route(request: Request, env: Env): Response {
  const url      = new URL(request.url);
  const pathname = url.pathname.replace(/\/$/, ''); // trim trailing slash

  // ── Preflight ──────────────────────────────────────────────────────────────
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // ── Only GET allowed past this point ──────────────────────────────────────
  if (request.method !== 'GET') {
    return errorResponse('Method Not Allowed. Only GET is supported.', 405);
  }

  // ── Routes ─────────────────────────────────────────────────────────────────
  if (pathname === '/api/live')          return handleLive(env);
  if (pathname === '/api/live/stats')    return handleStats(env);
  if (pathname === '/api/history')       return handleHistory(url);
  if (pathname === '/api/roadmap')       return handleRoadmap(url);
  if (pathname === '/api/health')        return handleHealth(env);

  // /api/round/:n
  const roundMatch = pathname.match(/^\/api\/round\/(\d+)$/);
  if (roundMatch) return handleRound(roundMatch[1] ?? '');

  // ── 404 ────────────────────────────────────────────────────────────────────
  return jsonResponse(
    {
      error:    'Not Found',
      routes: [
        'GET /api/live',
        'GET /api/live/stats',
        'GET /api/round/:n',
        'GET /api/history?count=20',
        'GET /api/roadmap?count=100',
        'GET /api/health',
      ],
    },
    404,
  );
}

// ─── Worker Export ────────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return route(request, env);
    } catch (err) {
      // Catch-all: never expose stack traces in production
      const message = err instanceof Error ? err.message : 'Internal server error';
      console.error('[betlog-worker]', err);
      return errorResponse(message, 500);
    }
  },
} satisfies ExportedHandler<Env>;
