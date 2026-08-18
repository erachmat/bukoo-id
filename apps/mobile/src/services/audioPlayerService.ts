export interface AudioTrack {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  coverUrl: string;
  chapterTitle: string;
  durationSeconds: number;
}

export type PlaybackRate = 1.0 | 1.25 | 1.5 | 2.0;
export type SleepTimer = 0 | 15 | 30 | 45;

export interface AudioPlayerState {
  activeTrack: AudioTrack | null;
  isPlaying: boolean;
  currentSeconds: number;
  playbackRate: PlaybackRate;
  sleepTimerMinutes: SleepTimer;
}

type Listener = (state: AudioPlayerState) => void;

class AudioPlayerService {
  private state: AudioPlayerState = {
    activeTrack: null,
    isPlaying: false,
    currentSeconds: 0,
    playbackRate: 1.0,
    sleepTimerMinutes: 0,
  };

  private listeners: Set<Listener> = new Set();
  private tickerTimer: ReturnType<typeof setInterval> | null = null;
  private sleepTimerTimeout: ReturnType<typeof setTimeout> | null = null;

  getState(): AudioPlayerState {
    return { ...this.state };
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const currentState = this.getState();
    this.listeners.forEach((l) => l(currentState));
  }

  playTrack(track: AudioTrack) {
    this.state.activeTrack = track;
    this.state.currentSeconds = 0;
    this.state.isPlaying = true;
    this.startTicker();
    this.notify();
  }

  togglePlay() {
    if (!this.state.activeTrack) return;
    this.state.isPlaying = !this.state.isPlaying;
    if (this.state.isPlaying) {
      this.startTicker();
    } else {
      this.stopTicker();
    }
    this.notify();
  }

  seekTo(seconds: number) {
    if (!this.state.activeTrack) return;
    this.state.currentSeconds = Math.max(0, Math.min(seconds, this.state.activeTrack.durationSeconds));
    this.notify();
  }

  skip15s(direction: 'forward' | 'backward') {
    if (!this.state.activeTrack) return;
    const delta = direction === 'forward' ? 15 : -15;
    this.seekTo(this.state.currentSeconds + delta);
  }

  setPlaybackRate(rate: PlaybackRate) {
    this.state.playbackRate = rate;
    this.notify();
  }

  setSleepTimer(minutes: SleepTimer) {
    this.state.sleepTimerMinutes = minutes;
    if (this.sleepTimerTimeout) clearTimeout(this.sleepTimerTimeout);

    if (minutes > 0) {
      this.sleepTimerTimeout = setTimeout(() => {
        this.pause();
        this.state.sleepTimerMinutes = 0;
        this.notify();
      }, minutes * 60 * 1000);
    }
    this.notify();
  }

  pause() {
    if (this.state.isPlaying) {
      this.state.isPlaying = false;
      this.stopTicker();
      this.notify();
    }
  }

  stop() {
    this.stopTicker();
    if (this.sleepTimerTimeout) clearTimeout(this.sleepTimerTimeout);
    this.state.activeTrack = null;
    this.state.isPlaying = false;
    this.state.currentSeconds = 0;
    this.notify();
  }

  private startTicker() {
    this.stopTicker();
    this.tickerTimer = setInterval(() => {
      if (!this.state.isPlaying || !this.state.activeTrack) return;

      const increment = 1 * this.state.playbackRate;
      const nextSeconds = this.state.currentSeconds + increment;

      if (nextSeconds >= this.state.activeTrack.durationSeconds) {
        this.state.currentSeconds = this.state.activeTrack.durationSeconds;
        this.pause();
      } else {
        this.state.currentSeconds = nextSeconds;
        this.notify();
      }
    }, 1000);
  }

  private stopTicker() {
    if (this.tickerTimer) {
      clearInterval(this.tickerTimer);
      this.tickerTimer = null;
    }
  }
}

export const audioPlayerService = new AudioPlayerService();
