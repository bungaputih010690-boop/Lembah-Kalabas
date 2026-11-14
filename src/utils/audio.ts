const VOLUME_STORAGE_KEY = 'nusa_tani_volume_v1';
const MUSIC_VOLUME_STORAGE_KEY = 'nusa_tani_music_volume_v1';
const MUSIC_VOLUME_MAX = 0.8;
const BACKGROUND_MUSIC_URL = `${import.meta.env.BASE_URL}assets/aistudio/Lesung___Kotak_Musik_Tani__Versi_2__890a5565.mp3`;

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted = false;
  private volume = 1.0; // Default Mode Maksimal (100%)
  private musicVolume = MUSIC_VOLUME_MAX;
  private backgroundMusic: HTMLAudioElement | null = null;
  private musicRequested = false;
  private rainGain: GainNode | null = null;
  private rainSource: AudioBufferSourceNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(VOLUME_STORAGE_KEY);
        if (saved !== null) {
          const parsed = parseFloat(saved);
          if (!Number.isNaN(parsed)) {
            this.volume = Math.max(0, Math.min(1, parsed));
          }
        }
        const savedMusicVolume = localStorage.getItem(MUSIC_VOLUME_STORAGE_KEY);
        if (savedMusicVolume !== null) {
          const parsedMusicVolume = parseFloat(savedMusicVolume);
          if (!Number.isNaN(parsedMusicVolume)) {
            this.musicVolume = Math.max(0, Math.min(MUSIC_VOLUME_MAX, parsedMusicVolume));
          }
        }
      } catch {
        // ignore storage access issues
      }

      // Browsers require a user gesture before audio can start.
      window.addEventListener('pointerdown', () => this.playBackgroundMusic(), { once: true });
      window.addEventListener('keydown', () => this.playBackgroundMusic(), { once: true });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this.backgroundMusic?.pause();
        else if (this.musicRequested) this.resumeBackgroundMusic();
      });
    }
  }

  private ensureBackgroundMusic(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (!this.backgroundMusic) {
      this.backgroundMusic = new Audio(BACKGROUND_MUSIC_URL);
      this.backgroundMusic.loop = true;
      this.backgroundMusic.preload = 'auto';
      this.backgroundMusic.volume = this.musicVolume;
    }
    return this.backgroundMusic;
  }

  private resumeBackgroundMusic() {
    if (this.muted || this.musicVolume <= 0 || document.hidden) return;
    const music = this.ensureBackgroundMusic();
    music?.play().catch((error: unknown) => {
      // A user gesture or successful asset load may be needed before playback can proceed.
      console.warn('Musik latar tidak dapat diputar:', error);
    });
  }

  public playBackgroundMusic() {
    this.musicRequested = true;
    this.resumeBackgroundMusic();
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(MUSIC_VOLUME_MAX, vol));
    try {
      localStorage.setItem(MUSIC_VOLUME_STORAGE_KEY, String(this.musicVolume));
    } catch {
      // ignore storage issues
    }
    const music = this.ensureBackgroundMusic();
    if (music) music.volume = this.musicVolume;
    if (this.musicVolume <= 0) music?.pause();
    else if (this.musicRequested) this.resumeBackgroundMusic();
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  private ensureContext(): AudioContext | null {
    if (this.muted || this.volume <= 0) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (!this.ctx) return null;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (!this.masterGain) {
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-10, this.ctx.currentTime);
      compressor.knee.setValueAtTime(12, this.ctx.currentTime);
      compressor.ratio.setValueAtTime(6, this.ctx.currentTime);
      compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      compressor.release.setValueAtTime(0.12, this.ctx.currentTime);

      const master = this.ctx.createGain();
      // 1.35x master boost with limiter so 100% reaches true maximum loudness without clipping
      master.gain.setValueAtTime(this.muted ? 0 : this.volume * 1.35, this.ctx.currentTime);

      master.connect(compressor);
      compressor.connect(this.ctx.destination);
      this.masterGain = master;
    }

    return this.ctx;
  }

  private getOutputNode(ctx: AudioContext): AudioNode {
    return this.masterGain ?? ctx.destination;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        muted ? 0 : this.volume * 1.35,
        this.ctx.currentTime,
        0.02
      );
    }
    if (muted) {
      this.stopRainAmbience();
      this.backgroundMusic?.pause();
    } else if (this.musicRequested) {
      this.resumeBackgroundMusic();
    }
  }

  public isMuted() {
    return this.muted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem(VOLUME_STORAGE_KEY, String(this.volume));
    } catch {
      // ignore storage issues
    }
    if (this.volume > 0 && this.muted) {
      this.muted = false;
      if (this.musicRequested) this.resumeBackgroundMusic();
    }
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        this.muted ? 0 : this.volume * 1.35,
        this.ctx.currentTime,
        0.02
      );
    }
    if (this.volume <= 0) {
      this.stopRainAmbience();
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  private playTone(
    freq: number,
    endFreq: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainPeak = 0.38
  ) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(gainPeak, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playHoe() {
    this.playTone(165, 72, 0.12, 'triangle', 0.58);
  }

  public playPlant() {
    this.playTone(360, 560, 0.1, 'sine', 0.42);
  }

  public playWater() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const bufferSize = Math.floor(ctx.sampleRate * 0.2);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.45));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 950;
    const gain = ctx.createGain();
    gain.gain.value = 0.62;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    noise.start();
  }

  public playChop() {
    this.playTone(195, 65, 0.1, 'square', 0.34);
    setTimeout(() => this.playTone(125, 55, 0.08, 'triangle', 0.42), 30);
  }

  public playHarvest() {
    this.playTone(523.25, 523.25, 0.11, 'triangle', 0.42);
    setTimeout(() => this.playTone(659.25, 659.25, 0.11, 'triangle', 0.44), 55);
    setTimeout(() => this.playTone(783.99, 880, 0.18, 'sine', 0.48), 110);
  }

  public playCoin() {
    this.playTone(987.77, 987.77, 0.08, 'sine', 0.42);
    setTimeout(() => this.playTone(1318.51, 1318.51, 0.18, 'sine', 0.46), 65);
  }

  public playDoor() {
    this.playTone(250, 175, 0.14, 'sine', 0.42);
  }

  public playEat() {
    this.playTone(392, 523, 0.12, 'sine', 0.42);
    setTimeout(() => this.playTone(523, 659, 0.15, 'sine', 0.44), 90);
  }

  public playSleep() {
    this.playTone(440, 330, 0.25, 'sine', 0.36);
    setTimeout(() => this.playTone(330, 261.63, 0.35, 'sine', 0.34), 180);
  }

  public playError() {
    this.playTone(220, 160, 0.14, 'sawtooth', 0.28);
  }

  public playSword() {
    this.playTone(620, 210, 0.13, 'sawtooth', 0.36);
    setTimeout(() => this.playTone(880, 340, 0.08, 'triangle', 0.32), 25);
  }

  public playGunshot() {
    this.playTone(720, 110, 0.11, 'square', 0.42);
    setTimeout(() => this.playTone(180, 55, 0.14, 'sawtooth', 0.45), 15);
  }

  public playRobotHit() {
    this.playTone(150, 75, 0.12, 'square', 0.38);
  }

  public playRobotDefeat() {
    this.playTone(392, 523.25, 0.14, 'triangle', 0.44);
    setTimeout(() => this.playTone(523.25, 659.25, 0.14, 'triangle', 0.46), 80);
    setTimeout(() => this.playTone(659.25, 987.77, 0.26, 'sine', 0.50), 160);
  }

  public playTestSound() {
    this.playHarvest();
  }

  public updateRainAmbience(intensity: 'NONE' | 'LIGHT' | 'HEAVY') {
    if (this.muted || this.volume <= 0 || intensity === 'NONE') {
      this.stopRainAmbience();
      return;
    }
    const ctx = this.ensureContext();
    if (!ctx) return;
    const targetGain = intensity === 'HEAVY' ? 0.22 : 0.11;
    if (!this.rainSource) {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.04 * white) / 1.04;
        lastOut = data[i];
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = intensity === 'HEAVY' ? 1400 : 900;

      const gain = ctx.createGain();
      gain.gain.value = targetGain;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.getOutputNode(ctx));
      source.start();

      this.rainSource = source;
      this.rainGain = gain;
    } else if (this.rainGain) {
      this.rainGain.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.2);
    }
  }

  public stopRainAmbience() {
    if (this.rainSource) {
      try {
        this.rainSource.stop();
        this.rainSource.disconnect();
      } catch {
        // ignore already stopped
      }
      this.rainSource = null;
      this.rainGain = null;
    }
  }
}

export const soundEngine = new SoundEngine();
