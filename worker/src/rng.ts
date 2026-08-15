/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Deterministic seeded PRNG — Mulberry32
 *
 * Given the same seed, produces the same sequence of numbers every time.
 * This is the foundation of time-based deterministic state generation:
 * any server can compute the same round result for the same round number.
 *
 * Algorithm: Mulberry32 (32-bit, period ~4 billion)
 * Fast, small, no dependencies. Sufficient for a card game simulation.
 */

export interface Rng {
  /** Returns a float in [0, 1) */
  next(): number;
  /** Returns an integer in [min, max] inclusive */
  nextInt(min: number, max: number): number;
  /** Picks a random element from an array */
  pick<T>(arr: readonly T[]): T;
  /** Returns a new shuffled copy of the array (Fisher-Yates) */
  shuffle<T>(arr: readonly T[]): T[];
}

/**
 * Create a seeded Mulberry32 RNG instance.
 * The seed is XOR-mixed to avoid bad behaviour with sequential seeds.
 */
export function createRng(seed: number): Rng {
  // Mix seed to avoid low-quality sequences with small integers
  let s = (seed ^ 0x9E3779B9) >>> 0;

  function next(): number {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  }

  return {
    next,

    nextInt(min: number, max: number): number {
      return Math.floor(next() * (max - min + 1)) + min;
    },

    pick<T>(arr: readonly T[]): T {
      return arr[Math.floor(next() * arr.length)] as T;
    },

    shuffle<T>(arr: readonly T[]): T[] {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        const tmp = a[i] as T;
        a[i] = a[j] as T;
        a[j] = tmp;
      }
      return a;
    },
  };
}
