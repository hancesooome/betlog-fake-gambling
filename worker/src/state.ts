/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Time-Based State Machine
 *
 * Architecture:
 *  - One 30-second cycle per round, subdivided into 6 phases.
 *  - State is fully derived from `Date.now()` — no stored state required.
 *  - Any server at any time can compute the exact same state.
 *  - Frontend polls every 2 seconds; sub-second precision is not needed.
 *
 * Round Cycle (30s total):
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  BETTING_OPEN (15s) │ LAST_CALL (5s) │ CLOSED (2s) │ DEAL (3s)  │
 * │   0 ──────────────── 15 ──────────── 20 ─────────── 22 ─────── 25│
 * │  REVEALING (2s) │ RESULT (3s)                                     │
 * │  25 ──────────── 27 ─────────── 30 (= next round 0)              │
 * └──────────────────────────────────────────────────────────────────┘
 *
 * Card Reveal Strategy:
 *  BETTING_OPEN / LAST_CALL / BETTING_CLOSED → no cards
 *  DEALING                                   → 2 player + 2 banker (face up)
 *  REVEALING                                 → all cards (including third cards)
 *  RESULT                                    → all cards + winner announced
 */

import { generateRound, handScore } from './baccarat';
import { generateHistory, generateRoadmap } from './roadmap';
import type {
  Card,
  Env,
  GameResult,
  LiveTableResponse,
  Phase,
  PhaseConfig,
} from './types';

// ─── Phase Definitions ────────────────────────────────────────────────────────

export const ROUND_DURATION = 30; // seconds

export const PHASES: readonly PhaseConfig[] = [
  { phase: 'BETTING_OPEN',   duration: 15, offset: 0  },
  { phase: 'LAST_CALL',      duration: 5,  offset: 15 },
  { phase: 'BETTING_CLOSED', duration: 2,  offset: 20 },
  { phase: 'DEALING',        duration: 3,  offset: 22 },
  { phase: 'REVEALING',      duration: 2,  offset: 25 },
  { phase: 'RESULT',         duration: 3,  offset: 27 },
] as const;

// Compile-time guard: phases must sum to ROUND_DURATION
const _totalDuration = PHASES.reduce((s, p) => s + p.duration, 0);
if (_totalDuration !== ROUND_DURATION) {
  throw new Error(
    `[state] Phase durations must sum to ${ROUND_DURATION}s, got ${_totalDuration}s`,
  );
}

/** Offset at which betting closes — matches BETTING_CLOSED phase offset above */
const BETTING_CLOSE_OFFSET = 20 as const; // PHASES[2].offset

// ─── Phase Resolver ───────────────────────────────────────────────────────────

/**
 * Find the current phase config given seconds elapsed since round start.
 * Iterates from the end of the phase list backward to find the last
 * phase whose offset is ≤ phaseSecond.
 */
function resolvePhase(phaseSecond: number): PhaseConfig {
  for (let i = PHASES.length - 1; i >= 0; i--) {
    const p = PHASES[i];
    if (p !== undefined && phaseSecond >= p.offset) {
      return p;
    }
  }
  return PHASES[0] as PhaseConfig; // phaseSecond === 0
}

// ─── Card Visibility ──────────────────────────────────────────────────────────

interface VisibleCards {
  playerCards: Card[];
  bankerCards: Card[];
}

/**
 * Returns only the cards that should be visible to the client
 * for a given phase, implementing the progressive reveal.
 */
function getVisibleCards(
  phase: Phase,
  allPlayerCards: Card[],
  allBankerCards: Card[],
): VisibleCards {
  switch (phase) {
    case 'BETTING_OPEN':
    case 'LAST_CALL':
    case 'BETTING_CLOSED':
      return { playerCards: [], bankerCards: [] };

    case 'DEALING':
      // Show initial 4 cards only (first 2 for each side)
      return {
        playerCards: allPlayerCards.slice(0, 2),
        bankerCards: allBankerCards.slice(0, 2),
      };

    case 'REVEALING':
    case 'RESULT':
      // All cards visible including third cards
      return { playerCards: allPlayerCards, bankerCards: allBankerCards };
  }
}

// ─── Main State Generator ─────────────────────────────────────────────────────

/**
 * Derive the complete table state from a Unix timestamp.
 *
 * This is a pure function — same input always produces same output.
 * Suitable for deployment across multiple Cloudflare edge nodes.
 */
export function getCurrentState(nowMs: number, env: Env): LiveTableResponse {
  const nowSec      = Math.floor(nowMs / 1000);
  const roundNumber = Math.floor(nowSec / ROUND_DURATION);
  const phaseSecond = nowSec % ROUND_DURATION;

  // ── Phase ──────────────────────────────────────────────────────────────────
  const currentPhase        = resolvePhase(phaseSecond);
  const phaseSecondsElapsed   = phaseSecond - currentPhase.offset;
  const phaseSecondsRemaining = currentPhase.duration - phaseSecondsElapsed;

  // ── Betting countdown ──────────────────────────────────────────────────────
  const bettingOpen = currentPhase.phase === 'BETTING_OPEN' || currentPhase.phase === 'LAST_CALL';
  const countdown   = bettingOpen ? BETTING_CLOSE_OFFSET - phaseSecond : 0;

  // ── Next round countdown ───────────────────────────────────────────────────
  const nextRoundIn = ROUND_DURATION - phaseSecond;

  // ── Round data ─────────────────────────────────────────────────────────────
  const roundData = generateRound(roundNumber);
  const { playerCards: visPlayerCards, bankerCards: visBankerCards } = getVisibleCards(
    currentPhase.phase,
    roundData.playerCards,
    roundData.bankerCards,
  );

  // ── Result (only revealed in REVEALING / RESULT) ───────────────────────────
  const isResultPhase = currentPhase.phase === 'REVEALING' || currentPhase.phase === 'RESULT';
  const result: GameResult | null = isResultPhase ? roundData.result : null;

  // ── Roadmap & History (from completed rounds) ──────────────────────────────
  const roadmap = generateRoadmap(roundNumber, 100);
  const history = generateHistory(roundNumber, 20);

  return {
    tableId:              env.TABLE_ID ?? 'BETLOG-BACCARAT-1',
    round:                roundNumber,
    phase:                currentPhase.phase,
    phaseSecondsElapsed,
    phaseSecondsRemaining,
    countdown,
    nextRoundIn,
    bettingOpen,
    playerCards:          visPlayerCards,
    bankerCards:          visBankerCards,
    playerScore:          handScore(visPlayerCards),
    bankerScore:          handScore(visBankerCards),
    result,
    roadmap,
    history,
    serverTime:           nowMs,
  };
}
