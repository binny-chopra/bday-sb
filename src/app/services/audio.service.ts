import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private audio: HTMLAudioElement | null = null;
  private wasPlaying = localStorage.getItem('bgMusicPlaying') === 'true';
  private hasUserInteracted = false;
  private audioLoaded = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeAudio();
    }
  }

  private initializeAudio(): void {
    this.audio = new Audio();
    this.audio.src = '/assets/audio/thoda_thoda.mp3';
    this.audio.loop = true;
    this.audio.volume = 0.5;
    this.audio.muted = true;
    this.audio.preload = 'auto';

    // Wait for audio to be ready
    this.audio.addEventListener('canplaythrough', () => {
      this.audioLoaded = true;
      console.log('Audio is ready to play');
    });

    this.audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
    });

    this.setupInteractionListeners();
  }

  private setupInteractionListeners(): void {
    const handleFirstInteraction = () => {
      this.hasUserInteracted = true;
      
      // Unmute audio if it was playing before
      if (this.audio && this.wasPlaying) {
        this.audio.muted = false;
        this.play().catch(e => console.error('Initial playback failed:', e));
      }

      // Cleanup listeners after first interaction
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    // Add multiple interaction listeners
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
  }

  public async play(): Promise<void> {
    if (!this.audio || !this.audioLoaded) {
      console.warn('Audio not ready to play');
      return;
    }

    try {
      await this.audio.play();
      this.audio.muted = false;
      localStorage.setItem('bgMusicPlaying', 'true');
      console.log('Audio playback started');
    } catch (error) {
      console.error('Playback failed:', error);
      // Implement retry logic or user notification
    }
  }

  public stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      localStorage.setItem('bgMusicPlaying', 'false');
    }
  }

  public toggle(): void {
    if (this.audio?.paused) {
      this.play();
    } else {
      this.stop();
    }
  }
}