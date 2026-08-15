/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AudioContext — React context that exposes a single AudioManager instance
 * to the entire component tree.
 *
 * Usage:
 *   Wrap your app (or just BaccaratPage) with <AudioProvider>.
 *   Children access it via useAudioManager().
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AudioManager, AudioManagerConfig } from './AudioManager';

// ─── Context ─────────────────────────────────────────────────────────────────

interface AudioContextValue {
  manager: AudioManager;
  isMuted: boolean;
  toggleMute: () => void;
  setVoiceVolume: (v: number) => void;
  setSfxVolume: (v: number) => void;
  setAmbianceVolume: (v: number) => void;
}

const AudioCtx = createContext<AudioContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface AudioProviderProps {
  children: React.ReactNode;
  config?: AudioManagerConfig;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children, config }) => {
  // Use a ref so the manager instance is stable across renders
  const managerRef = useRef<AudioManager>(AudioManager.getInstance(config));
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Kick off ambiance on mount (actual play waits for user interaction)
    managerRef.current.startAmbiance();

    return () => {
      // Do NOT destroy on unmount — the singleton lives for the session.
      // We stop ambiance so it doesn't play outside of the casino.
      managerRef.current.stopAmbiance();
    };
  }, []);

  const toggleMute = () => {
    const nowMuted = managerRef.current.toggleMute();
    setIsMuted(nowMuted);
  };

  const setVoiceVolume   = (v: number) => managerRef.current.setVoiceVolume(v);
  const setSfxVolume     = (v: number) => managerRef.current.setSfxVolume(v);
  const setAmbianceVolume= (v: number) => managerRef.current.setAmbianceVolume(v);

  return (
    <AudioCtx.Provider
      value={{
        manager: managerRef.current,
        isMuted,
        toggleMute,
        setVoiceVolume,
        setSfxVolume,
        setAmbianceVolume,
      }}
    >
      {children}
    </AudioCtx.Provider>
  );
};

// ─── Raw manager hook ─────────────────────────────────────────────────────────

export function useAudioManager(): AudioContextValue {
  const ctx = useContext(AudioCtx);
  if (!ctx) {
    throw new Error('useAudioManager must be used inside <AudioProvider>');
  }
  return ctx;
}
