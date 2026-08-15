/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * BETLOG Live Baccarat Worker — TypeScript Types
 * All shared types for the baccarat engine, state machine, and API.
 */

// ─── Cards ────────────────────────────────────────────────────────────────────

export type Suit  = '♠' | '♥' | '♦' | '♣';
export type Rank  = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
export type Color = 'red' | 'black';

export interface Card {
  rank:  Rank;
  suit:  Suit;
  value: number;  // 0–9 baccarat point value
  color: Color;
}

// ─── Round ────────────────────────────────────────────────────────────────────

export type Winner = 'PLAYER' | 'BANKER' | 'TIE';

export interface GameResult {
  winner:       Winner;
  playerScore:  number;
  bankerScore:  number;
  isNatural:    boolean;
  naturalValue: 8 | 9 | null;
  playerPair:   boolean;
  bankerPair:   boolean;
}

export interface RoundData {
  roundNumber:  number;
  playerCards:  Card[];
  bankerCards:  Card[];
  result:       GameResult;
}

// ─── Phase / State Machine ────────────────────────────────────────────────────

export type Phase =
  | 'BETTING_OPEN'
  | 'LAST_CALL'
  | 'BETTING_CLOSED'
  | 'DEALING'
  | 'REVEALING'
  | 'RESULT';

export interface PhaseConfig {
  phase:    Phase;
  duration: number;   // seconds
  offset:   number;   // seconds from round start
}

// ─── Roadmap ──────────────────────────────────────────────────────────────────

export interface RoadmapBead {
  winner:      Winner;
  round:       number;
  isNatural:   boolean;
  playerPair:  boolean;
  bankerPair:  boolean;
}

// ─── History ─────────────────────────────────────────────────────────────────

export interface HistoryEntry {
  round:        number;
  winner:       Winner;
  playerScore:  number;
  bankerScore:  number;
  playerCards:  Card[];
  bankerCards:  Card[];
  isNatural:    boolean;
  playerPair:   boolean;
  bankerPair:   boolean;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface LiveTableResponse {
  /** Stable table identifier */
  tableId: string;

  /** Monotonically incrementing round counter */
  round: number;

  /** Current phase of the round cycle */
  phase: Phase;

  /** Seconds elapsed since this phase started */
  phaseSecondsElapsed: number;

  /** Seconds remaining in this phase */
  phaseSecondsRemaining: number;

  /**
   * Seconds until betting closes.
   * Non-zero only during BETTING_OPEN and LAST_CALL.
   */
  countdown: number;

  /**
   * Seconds until the next round begins.
   * Useful for showing "next round in X" during RESULT.
   */
  nextRoundIn: number;

  /** Whether the table is currently accepting bets */
  bettingOpen: boolean;

  /** Player cards (progressive reveal based on phase) */
  playerCards: Card[];

  /** Banker cards (progressive reveal based on phase) */
  bankerCards: Card[];

  /** Player hand score (0–9). 0 when cards are hidden. */
  playerScore: number;

  /** Banker hand score (0–9). 0 when cards are hidden. */
  bankerScore: number;

  /** Null until REVEALING phase */
  result: GameResult | null;

  /** Last 100 round outcomes, oldest first */
  roadmap: RoadmapBead[];

  /** Last 20 completed rounds, most recent first */
  history: HistoryEntry[];

  /** Server Unix timestamp in milliseconds */
  serverTime: number;
}

// ─── Cloudflare Worker Env ────────────────────────────────────────────────────

export interface Env {
  ENVIRONMENT: string;
  TABLE_ID:    string;
  // Future:
  // BETLOG_KV: KVNamespace;
  // BACCARAT_TABLE: DurableObjectNamespace;
}
