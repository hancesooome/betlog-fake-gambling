/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Roadmap & History Generator
 *
 * Generates standard baccarat roadmaps from historical round data.
 * Because rounds are deterministic, we can reconstruct any number of
 * past rounds without a database.
 *
 * Roadmap types implemented:
 *  - Bead Plate (珠盤): raw outcome sequence, last N results
 *  - Win streak tracking for future Big Road / Derived Road support
 */

import { generateRound } from './baccarat';
import type { HistoryEntry, RoadmapBead, Winner } from './types';

// ─── Bead Plate (Raw Roadmap) ─────────────────────────────────────────────────

/**
 * Generate the bead plate: the last `count` round outcomes.
 * Results are ordered oldest → newest.
 *
 * @param currentRound  The round currently in progress (not yet completed)
 * @param count         Number of historical beads to return (max 100)
 */
export function generateRoadmap(currentRound: number, count = 100): RoadmapBead[] {
  const beads: RoadmapBead[] = [];

  // We only show completed rounds (currentRound - 1 and before)
  const startRound = Math.max(0, currentRound - count);

  for (let r = startRound; r < currentRound; r++) {
    const { result } = generateRound(r);
    beads.push({
      winner:     result.winner,
      round:      r,
      isNatural:  result.isNatural,
      playerPair: result.playerPair,
      bankerPair: result.bankerPair,
    });
  }

  return beads; // oldest first
}

// ─── History ──────────────────────────────────────────────────────────────────

/**
 * Generate detailed history entries for the last `count` completed rounds.
 * Results are ordered newest first (most recent at index 0).
 *
 * @param currentRound  The round currently in progress
 * @param count         Number of history entries to return (max 20)
 */
export function generateHistory(currentRound: number, count = 20): HistoryEntry[] {
  const entries: HistoryEntry[] = [];

  const startRound = Math.max(0, currentRound - count);

  for (let r = currentRound - 1; r >= startRound; r--) {
    const { roundNumber, playerCards, bankerCards, result } = generateRound(r);
    entries.push({
      round:        roundNumber,
      winner:       result.winner,
      playerScore:  result.playerScore,
      bankerScore:  result.bankerScore,
      playerCards,
      bankerCards,
      isNatural:    result.isNatural,
      playerPair:   result.playerPair,
      bankerPair:   result.bankerPair,
    });
  }

  return entries; // newest first
}

// ─── Statistics ───────────────────────────────────────────────────────────────

export interface RoadmapStats {
  total:         number;
  playerWins:    number;
  bankerWins:    number;
  ties:          number;
  playerPercent: number;
  bankerPercent: number;
  tiePercent:    number;
  currentStreak: { winner: Winner; count: number } | null;
  longestStreak: { winner: Winner; count: number } | null;
}

/**
 * Compute aggregate statistics from a bead plate.
 */
export function computeStats(beads: RoadmapBead[]): RoadmapStats {
  if (beads.length === 0) {
    return {
      total: 0, playerWins: 0, bankerWins: 0, ties: 0,
      playerPercent: 0, bankerPercent: 0, tiePercent: 0,
      currentStreak: null, longestStreak: null,
    };
  }

  let playerWins = 0;
  let bankerWins = 0;
  let ties       = 0;

  // Streak tracking
  let currentStreakWinner: Winner | null = null;
  let currentStreakCount = 0;
  let longestStreakWinner: Winner | null = null;
  let longestStreakCount = 0;

  for (const bead of beads) {
    if (bead.winner === 'PLAYER') playerWins++;
    else if (bead.winner === 'BANKER') bankerWins++;
    else ties++;

    if (bead.winner === currentStreakWinner) {
      currentStreakCount++;
    } else {
      currentStreakWinner = bead.winner;
      currentStreakCount = 1;
    }

    if (currentStreakCount > longestStreakCount) {
      longestStreakCount  = currentStreakCount;
      longestStreakWinner = currentStreakWinner;
    }
  }

  const total = beads.length;

  return {
    total,
    playerWins,
    bankerWins,
    ties,
    playerPercent: Math.round((playerWins / total) * 100),
    bankerPercent: Math.round((bankerWins / total) * 100),
    tiePercent:    Math.round((ties       / total) * 100),
    currentStreak: currentStreakWinner
      ? { winner: currentStreakWinner, count: currentStreakCount }
      : null,
    longestStreak: longestStreakWinner
      ? { winner: longestStreakWinner, count: longestStreakCount }
      : null,
  };
}
