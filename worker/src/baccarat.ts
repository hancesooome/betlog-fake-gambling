/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * BETLOG Baccarat Engine
 *
 * Implements the complete, rule-correct baccarat engine:
 *  - 8-deck shoe simulation
 *  - Correct natural (8/9) detection
 *  - Player third-card rule
 *  - Banker third-card rule (tableau)
 *  - Pair detection
 *  - Score calculation
 *
 * All results are derived deterministically from a round seed,
 * so any server replicates the same round identically.
 *
 * References:
 *   https://en.wikipedia.org/wiki/Baccarat_(card_game)#Rules
 */

import { createRng } from './rng';
import type { Card, Color, GameResult, Rank, RoundData, Suit, Winner } from './types';

// ─── Card Data ────────────────────────────────────────────────────────────────

const SUITS: readonly Suit[]  = ['♠', '♥', '♦', '♣'];
const RANKS: readonly Rank[]  = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const RED_SUITS = new Set<Suit>(['♥', '♦']);

/** Baccarat point values (10-value cards count as 0) */
const RANK_POINTS: Record<Rank, number> = {
  A: 1, '2': 2, '3': 3, '4': 4, '5': 5,
  '6': 6, '7': 7, '8': 8, '9': 9,
  '10': 0, J: 0, Q: 0, K: 0,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Baccarat hand score: sum of values mod 10 */
export function handScore(cards: readonly Card[]): number {
  return cards.reduce((sum, c) => sum + c.value, 0) % 10;
}

/** True if first two cards share the same rank (pair side bet) */
function isPair(cards: readonly Card[]): boolean {
  return cards.length >= 2 && (cards[0] as Card).rank === (cards[1] as Card).rank;
}

function makeCard(rank: Rank, suit: Suit): Card {
  return {
    rank,
    suit,
    value: RANK_POINTS[rank],
    color: RED_SUITS.has(suit) ? 'red' : ('black' as Color),
  };
}

// ─── Shoe Builder ─────────────────────────────────────────────────────────────

/**
 * Build and shuffle an 8-deck shoe using the provided RNG.
 * Returns a flat array of 416 cards, pre-shuffled.
 */
function buildShuffledShoe(rng: ReturnType<typeof createRng>): Card[] {
  const shoe: Card[] = [];
  for (let d = 0; d < 8; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        shoe.push(makeCard(rank, suit));
      }
    }
  }
  return rng.shuffle(shoe);
}

// ─── Third-Card Rules ─────────────────────────────────────────────────────────

/** Player draws a third card if their initial score is 0–5 */
function playerDraws(playerScore: number): boolean {
  return playerScore <= 5;
}

/**
 * Banker third-card rule (full tableau).
 *
 * @param bankerScore    Banker's initial 2-card score
 * @param playerDrew     Whether player drew a third card
 * @param playerThird    Player's third card value (0–9), or null if player didn't draw
 */
function bankerDraws(
  bankerScore: number,
  playerDrew: boolean,
  playerThird: number | null,
): boolean {
  if (!playerDrew) {
    // Banker stands on 6+, draws on 0–5
    return bankerScore <= 5;
  }
  // Player drew — use the full tableau
  const t = playerThird!;
  switch (bankerScore) {
    case 0: case 1: case 2: return true;
    case 3: return t !== 8;
    case 4: return t >= 2 && t <= 7;
    case 5: return t >= 4 && t <= 7;
    case 6: return t === 6 || t === 7;
    case 7: return false;
    default: return false; // 8 or 9 — natural, never reaches here
  }
}

// ─── Round Generator ──────────────────────────────────────────────────────────

/**
 * Generate a complete, deterministic baccarat round.
 *
 * Given the same `roundNumber`, this function always returns the same result.
 * This is the core property that enables server-time-based state generation.
 *
 * Seed strategy: round number XOR'd with a magic constant to avoid
 * degenerate sequences for small round numbers.
 */
export function generateRound(roundNumber: number): RoundData {
  const rng = createRng(roundNumber ^ 0xBEEFCA57);
  const shoe = buildShuffledShoe(rng);
  let idx = 0;
  const draw = (): Card => shoe[idx++] as Card;

  // Standard baccarat deal order: Player1, Banker1, Player2, Banker2
  const playerCards: Card[] = [draw(), draw()];
  const bankerCards: Card[] = [draw(), draw()];

  let pScore = handScore(playerCards);
  let bScore = handScore(bankerCards);

  // ── Natural win ────────────────────────────────────────────────────────────
  const isNatural = pScore >= 8 || bScore >= 8;

  if (!isNatural) {
    // ── Player third card ──────────────────────────────────────────────────
    let pDrew = false;
    let pThirdValue: number | null = null;

    if (playerDraws(pScore)) {
      const pThird = draw();
      playerCards.push(pThird);
      pThirdValue = pThird.value;
      pDrew = true;
      pScore = handScore(playerCards);
    }

    // ── Banker third card ──────────────────────────────────────────────────
    if (bankerDraws(bScore, pDrew, pThirdValue)) {
      bankerCards.push(draw());
      bScore = handScore(bankerCards);
    }
  }

  // ── Final scores ───────────────────────────────────────────────────────────
  const finalP = handScore(playerCards);
  const finalB = handScore(bankerCards);

  let winner: Winner;
  if (finalP > finalB)      winner = 'PLAYER';
  else if (finalB > finalP) winner = 'BANKER';
  else                      winner = 'TIE';

  // Natural value = highest score when natural
  let naturalValue: 8 | 9 | null = null;
  if (isNatural) {
    const maxNatural = Math.max(finalP, finalB);
    naturalValue = maxNatural >= 9 ? 9 : 8;
  }

  const result: GameResult = {
    winner,
    playerScore: finalP,
    bankerScore: finalB,
    isNatural,
    naturalValue,
    playerPair: isPair(playerCards),
    bankerPair:  isPair(bankerCards),
  };

  return { roundNumber, playerCards, bankerCards, result };
}
