/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * useDealerVoice — hook for playing dealer voice lines.
 *
 * Rules enforced by AudioManager:
 *  - Only one voice plays at a time.
 *  - Calling playVoice() while another is playing interrupts it.
 *  - Random variation is automatically selected for multi-variant keys.
 */

import { useCallback } from 'react';
import { useAudioManager } from '../audio/AudioContext';
import type { VoiceKey } from '../audio/AudioManager';

export interface UseDealerVoiceReturn {
  /** Play a dealer voice line by key. Interrupts current voice. */
  playVoice: (key: VoiceKey) => void;
  /** Stop the current voice immediately. */
  stopVoice: () => void;
  /** Whether a voice is currently playing. */
  isVoicePlaying: boolean;
}

export function useDealerVoice(): UseDealerVoiceReturn {
  const { manager } = useAudioManager();

  const playVoice = useCallback(
    (key: VoiceKey) => {
      manager.playVoice(key);
    },
    [manager],
  );

  const stopVoice = useCallback(() => {
    manager.stopVoice();
  }, [manager]);

  return {
    playVoice,
    stopVoice,
    get isVoicePlaying() {
      return manager.isVoicePlaying;
    },
  };
}
