/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AudioManager — centralized audio engine for BETLOG.
 *
 * Architecture:
 *  - Single AudioManager instance shared across the app.
 *  - Voices: only one dealer voice plays at a time; a new voice
 *    call interrupts the previous one.
 *  - SFX: fully polyphonic — each play() spawns an independent clone.
 *  - Ambiance: loops silently until the first user interaction, then
 *    starts at the configured volume.
 */

// ─── Asset paths ────────────────────────────────────────────────────────────

export const VOICE_PACKS = {
  BETTING_OPEN: [
    '/assets/voice-packs/bets-open/1.mp3',
    '/assets/voice-packs/bets-open/2.mp3',
    '/assets/voice-packs/bets-open/3.mp3',
    '/assets/voice-packs/bets-open/4.mp3',
  ],
  LAST_CALL: [
    '/assets/voice-packs/last-call/1.mp3',
    '/assets/voice-packs/last-call/2.mp3',
    '/assets/voice-packs/last-call/3.mp3',
    '/assets/voice-packs/last-call/4.mp3',
  ],
  BETTING_CLOSED: [
    '/assets/voice-packs/bets-closed/1.mp3',
    '/assets/voice-packs/bets-closed/2.mp3',
    '/assets/voice-packs/bets-closed/3.mp3',
    '/assets/voice-packs/bets-closed/4.mp3',
  ],
  RESULT_PLAYER:       '/assets/voice-packs/results/player-win.mp3',
  RESULT_BANKER:       '/assets/voice-packs/results/banker-win.mp3',
  RESULT_TIE:          '/assets/voice-packs/results/tie.mp3',
  RESULT_PLAYER_PAIR:  '/assets/voice-packs/results/player-pair.mp3',
  RESULT_BANKER_PAIR:  '/assets/voice-packs/results/banker-pair.mp3',
  RESULT_NATURAL_EIGHT:'/assets/voice-packs/results/natural-eight.mp3',
  RESULT_NATURAL_NINE: '/assets/voice-packs/results/natural-nine.mp3',
} as const;

export const SFX = {
  BET_OPEN:        '/assets/voice-packs/sfx/bets-open-bell.mp3',
  BET_CLOSED:      '/assets/voice-packs/sfx/bets-closed-bell.mp3',
  CARD_DEAL:       '/assets/voice-packs/sfx/card-deal.mp3',
  CARD_FLIP:       '/assets/voice-packs/sfx/card-flip.mp3',
  CHIP_PLACE:      '/assets/voice-packs/sfx/chip-place.mp3',
  CHIP_STACK:      '/assets/voice-packs/sfx/chip-stack.mp3',
  LAST_5_SECONDS:  '/assets/voice-packs/sfx/5-sec-timer-tick.wav',
  AMBIANCE_LOOP:   '/assets/voice-packs/sfx/casino-ambiance.mp3',
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────

export type VoiceKey = keyof typeof VOICE_PACKS;
export type SfxKey   = keyof typeof SFX;

export interface AudioManagerConfig {
  /** Master volume for voice lines: 0–1 */
  voiceVolume?: number;
  /** Master volume for SFX: 0–1 */
  sfxVolume?: number;
  /** Ambiance loop volume: 0–1 */
  ambianceVolume?: number;
}

// ─── AudioManager class ───────────────────────────────────────────────────────

export class AudioManager {
  // ── Singleton ──────────────────────────────────────────────────────────────
  private static instance: AudioManager | null = null;

  public static getInstance(config?: AudioManagerConfig): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager(config);
    }
    return AudioManager.instance;
  }

  public static destroyInstance(): void {
    if (AudioManager.instance) {
      AudioManager.instance.destroy();
      AudioManager.instance = null;
    }
  }

  // ── State ──────────────────────────────────────────────────────────────────
  private voiceVolume   = 0.9;
  private sfxVolume     = 0.7;
  private ambianceVolume= 0.18;
  private isMuted       = false;

  /** Map of preloaded buffers: path → HTMLAudioElement (used as preload cache) */
  private cache = new Map<string, HTMLAudioElement>();

  /** Currently playing dealer voice */
  private activeVoice: HTMLAudioElement | null = null;

  /** Ambiance loop element */
  private ambianceEl: HTMLAudioElement | null = null;

  /** Whether user has interacted yet */
  private userInteracted = false;

  /** Pending ambiance start (if interaction happened before preload finished) */
  private ambiancePending = false;

  private constructor(config?: AudioManagerConfig) {
    if (config?.voiceVolume    !== undefined) this.voiceVolume    = config.voiceVolume;
    if (config?.sfxVolume      !== undefined) this.sfxVolume      = config.sfxVolume;
    if (config?.ambianceVolume !== undefined) this.ambianceVolume = config.ambianceVolume;

    this.preloadAll();
    this.attachInteractionListener();
  }

  // ── Preloading ─────────────────────────────────────────────────────────────

  private preloadAll(): void {
    // Flatten all voice paths
    const voicePaths: string[] = [
      ...VOICE_PACKS.BETTING_OPEN,
      ...VOICE_PACKS.LAST_CALL,
      ...VOICE_PACKS.BETTING_CLOSED,
      VOICE_PACKS.RESULT_PLAYER,
      VOICE_PACKS.RESULT_BANKER,
      VOICE_PACKS.RESULT_TIE,
      VOICE_PACKS.RESULT_PLAYER_PAIR,
      VOICE_PACKS.RESULT_BANKER_PAIR,
      VOICE_PACKS.RESULT_NATURAL_EIGHT,
      VOICE_PACKS.RESULT_NATURAL_NINE,
    ];

    const sfxPaths: string[] = Object.values(SFX);

    for (const path of [...voicePaths, ...sfxPaths]) {
      this.preload(path);
    }

    // Ambiance gets its own managed element
    this.setupAmbiance();
  }

  private preload(src: string): HTMLAudioElement {
    if (this.cache.has(src)) return this.cache.get(src)!;

    const el = new Audio();
    el.preload = 'auto';
    el.src     = src;
    el.load();
    this.cache.set(src, el);
    return el;
  }

  // ── Ambiance ───────────────────────────────────────────────────────────────

  private setupAmbiance(): void {
    const el = new Audio();
    el.preload = 'auto';
    el.src     = SFX.AMBIANCE_LOOP;
    el.loop    = true;
    el.volume  = this.isMuted ? 0 : this.ambianceVolume;
    el.load();
    this.ambianceEl = el;
  }

  private attachInteractionListener(): void {
    const unlock = () => {
      if (this.userInteracted) return;

      // Resume / create a silent Web Audio context.
      // This is the canonical way to ungate audio on mobile (iOS & Android).
      try {
        const AudioContextClass =
          (window as any).AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          // Create a silent buffer and play it — this gesture-unlocks audio globally.
          const buf = ctx.createBuffer(1, 1, 22050);
          const src = ctx.createBufferSource();
          src.buffer = buf;
          src.connect(ctx.destination);
          src.start(0);
          ctx.resume().catch(() => {});
        }
      } catch (_) {}

      this.userInteracted = true;

      // Retry ambiance if it was blocked earlier
      if (this.ambiancePending) {
        this.ambiancePending = false;
        this.startAmbiance();
      }
    };

    // passive: true is required for touchstart on iOS to not block scrolling
    window.addEventListener('click',      unlock, { passive: true });
    window.addEventListener('keydown',    unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
  }

  public startAmbiance(): void {
    if (!this.ambianceEl) return;
    if (!this.userInteracted) {
      this.ambiancePending = true;
      return;
    }
    this.ambianceEl.volume = this.isMuted ? 0 : this.ambianceVolume;
    this.ambianceEl.play().catch(() => {
      // Browser may still block; retry is handled by next interaction
      this.ambiancePending = true;
    });
  }

  public stopAmbiance(): void {
    this.ambiancePending = false;
    this.ambianceEl?.pause();
  }

  // ── Voice lines ────────────────────────────────────────────────────────────

  /**
   * Play a dealer voice line.
   * Interrupts any currently playing voice.
   * If key maps to an array, picks a random entry.
   */
  public playVoice(key: VoiceKey): void {
    if (this.isMuted) return;
    if (!this.userInteracted) return; // Mobile: don't attempt before gesture unlock

    const entry = VOICE_PACKS[key];
    const src   = Array.isArray(entry)
      ? entry[Math.floor(Math.random() * entry.length)]
      : (entry as string);

    // Stop current voice
    this.stopVoice();

    // Clone so the same src can be reused immediately
    const el = this.cache.get(src)?.cloneNode() as HTMLAudioElement ?? new Audio(src);
    el.volume  = this.voiceVolume;
    el.currentTime = 0;

    this.activeVoice = el;
    el.play().catch(() => { /* silently ignore autoplay policy errors */ });

    el.addEventListener('ended', () => {
      if (this.activeVoice === el) this.activeVoice = null;
    }, { once: true });
  }

  public stopVoice(): void {
    if (this.activeVoice) {
      this.activeVoice.pause();
      this.activeVoice.currentTime = 0;
      this.activeVoice = null;
    }
  }

  public get isVoicePlaying(): boolean {
    return this.activeVoice !== null && !this.activeVoice.paused;
  }

  // ── Sound Effects ──────────────────────────────────────────────────────────

  /**
   * Play a sound effect.
   * Fully polyphonic — each call is independent.
   */
  public playSfx(key: SfxKey): void {
    if (this.isMuted) return;
    if (!this.userInteracted) return; // Mobile: don't attempt before gesture unlock

    const src = SFX[key];
    // Clone from cache for zero-latency overlap
    const cached = this.cache.get(src);
    const el: HTMLAudioElement = cached
      ? (cached.cloneNode() as HTMLAudioElement)
      : new Audio(src);

    el.volume      = key === 'AMBIANCE_LOOP' ? this.ambianceVolume : this.sfxVolume;
    el.currentTime = 0;
    el.play().catch(() => {});
  }

  // ── Volume & Mute ──────────────────────────────────────────────────────────

  public setVoiceVolume(v: number): void {
    this.voiceVolume = Math.max(0, Math.min(1, v));
    if (this.activeVoice) this.activeVoice.volume = this.voiceVolume;
  }

  public setSfxVolume(v: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, v));
  }

  public setAmbianceVolume(v: number): void {
    this.ambianceVolume = Math.max(0, Math.min(1, v));
    if (this.ambianceEl && !this.isMuted) {
      this.ambianceEl.volume = this.ambianceVolume;
    }
  }

  public mute(): void {
    this.isMuted = true;
    this.stopVoice();
    if (this.ambianceEl) this.ambianceEl.volume = 0;
  }

  public unmute(): void {
    this.isMuted = false;
    if (this.ambianceEl) {
      this.ambianceEl.volume = this.ambianceVolume;
      if (this.ambianceEl.paused && this.userInteracted) {
        this.ambianceEl.play().catch(() => {});
      }
    }
  }

  public toggleMute(): boolean {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
    return this.isMuted;
  }

  public get muted(): boolean {
    return this.isMuted;
  }

  public getVolumes() {
    return {
      voice:    this.voiceVolume,
      sfx:      this.sfxVolume,
      ambiance: this.ambianceVolume,
    };
  }

  // ── Cleanup ────────────────────────────────────────────────────────────────

  public destroy(): void {
    this.stopVoice();
    this.stopAmbiance();

    for (const el of this.cache.values()) {
      el.src = '';
    }
    this.cache.clear();

    if (this.ambianceEl) {
      this.ambianceEl.src = '';
      this.ambianceEl = null;
    }
  }
}
