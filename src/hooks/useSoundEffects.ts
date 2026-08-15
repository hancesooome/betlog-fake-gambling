/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * useSoundEffects — hook for sound effects (polyphonic, may overlap).
 *
 * Each playSfx() call is completely independent.
 * Designed for: chips, cards, bells, timer ticks, etc.
 */

import { useCallback } from 'react';
import { useAudioManager } from '../audio/AudioContext';
import type { SfxKey } from '../audio/AudioManager';

export interface UseSoundEffectsReturn {
  /** Play a sound effect. Multiple calls are independent (polyphonic). */
  playSfx: (key: SfxKey) => void;
  /**
   * Play a sound effect as a single instance (non-polyphonic).
   * Repeated calls for the same key restart it instead of overlapping.
   * Pass `maxSeconds` to cap how long the clip plays (e.g. one short tick).
   */
  playSfxOnce: (key: SfxKey, maxSeconds?: number) => void;
  /** Start casino ambiance loop. */
  startAmbiance: () => void;
  /** Stop casino ambiance loop. */
  stopAmbiance: () => void;
}


export function useSoundEffects(): UseSoundEffectsReturn {
  const { manager } = useAudioManager();

  const playSfx = useCallback(
    (key: SfxKey) => {
      manager.playSfx(key);
    },
    [manager],
  );

  const playSfxOnce = useCallback(
    (key: SfxKey, maxSeconds?: number) => {
      manager.playSfxOnce(key, maxSeconds);
    },
    [manager],
  );

  const startAmbiance = useCallback(() => {
    manager.startAmbiance();
  }, [manager]);

  const stopAmbiance = useCallback(() => {
    manager.stopAmbiance();
  }, [manager]);

  return { playSfx, playSfxOnce, startAmbiance, stopAmbiance };
}

