/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * useAudio — general-purpose audio hook.
 *
 * Provides:
 *  - mute / unmute / toggle
 *  - volume setters
 *  - current mute state
 *  - direct manager access for advanced use cases
 */

import { useCallback } from 'react';
import { useAudioManager } from '../audio/AudioContext';
import type { AudioManagerConfig } from '../audio/AudioManager';

export interface UseAudioReturn {
  isMuted: boolean;
  toggleMute: () => void;
  mute: () => void;
  unmute: () => void;
  setVoiceVolume: (v: number) => void;
  setSfxVolume: (v: number) => void;
  setAmbianceVolume: (v: number) => void;
  getVolumes: () => AudioManagerConfig;
}

export function useAudio(): UseAudioReturn {
  const { manager, isMuted, toggleMute, setVoiceVolume, setSfxVolume, setAmbianceVolume } =
    useAudioManager();

  const mute   = useCallback(() => { manager.mute();   }, [manager]);
  const unmute = useCallback(() => { manager.unmute(); }, [manager]);

  const getVolumes = useCallback(
    () => manager.getVolumes(),
    [manager],
  );

  return {
    isMuted,
    toggleMute,
    mute,
    unmute,
    setVoiceVolume,
    setSfxVolume,
    setAmbianceVolume,
    getVolumes,
  };
}
